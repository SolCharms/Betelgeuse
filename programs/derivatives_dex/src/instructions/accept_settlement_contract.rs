use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, SettlementContract};
use prog_common::{close_account, TrySub};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_payment_token: u8, bump_listed_token: u8, bump_settlement_contract: u8)]
pub struct AcceptSettlementContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract to be purchased (or fractionally purchased)
    #[account(mut, seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), seller.key().as_ref(), seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = seller, has_one = seed, has_one = token_mint, has_one = token_account)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    pub seller: AccountInfo<'info>,

    /// CHECK:
    pub seed: AccountInfo<'info>,

    // The futures contract purchase state account
    #[account(mut, seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), purchaser.key().as_ref(), payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase, has_one = futures_contract, has_one = purchaser, has_one = payment_token_mint, has_one = payment_token_account)]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    /// CHECK:
    pub purchaser: AccountInfo<'info>,

    // Payment_token mint
    pub payment_token_mint: Box<Account<'info, Mint>>,

    // PDA payment_token account
    #[account(mut, seeds = [b"token_account".as_ref(), payment_token_mint.key().as_ref(), purchaser.key().as_ref(), futures_contract.key().as_ref()],
              bump = bump_payment_token, token::mint = payment_token_mint, token::authority = derivative_dex_authority)]
    pub payment_token_account: Box<Account<'info, TokenAccount>>,

    // Destination payment_token account, owned by purchaser
    #[account(mut, token::mint = payment_token_mint, token::authority = purchaser)]
    pub destination_payment_token_account: Box<Account<'info, TokenAccount>>,

    // Destination payment_token account, owned by seller
    #[account(mut, token::mint = payment_token_mint, token::authority = seller)]
    pub seller_destination_payment_token_account: Box<Account<'info, TokenAccount>>,

    // Futures contract's token mint
    pub token_mint: Box<Account<'info, Mint>>,

    // Futures contract's PDA token account
    #[account(mut, seeds = [b"token_account".as_ref(), token_mint.key().as_ref(), seller.key().as_ref(), futures_contract.key().as_ref()],
              bump = bump_listed_token, token::mint = token_mint, token::authority = derivative_dex_authority)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    // Destination token account, owned by seller
    #[account(mut, token::mint = token_mint, token::authority = seller)]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,

    // Destination token account, owned by purchaser
    #[account(mut, token::mint = token_mint, token::authority = purchaser)]
    pub purchaser_destination_token_account: Box<Account<'info, TokenAccount>>,

    // The settlement PDA contract
    #[account(mut, seeds = [b"settlement_contract".as_ref(), futures_contract.key().as_ref(), futures_contract_purchase.key().as_ref()],
              bump = bump_settlement_contract)]
    pub settlement_contract: Box<Account<'info, SettlementContract>>,

    // The creator of the settlement contract
    pub signer: Signer<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> AcceptSettlementContract<'info> {
    fn transfer_payment_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.payment_token_account.to_account_info(),
                to: self.destination_payment_token_account.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn transfer_purchased_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.token_account.to_account_info(),
                to: self.destination_token_account.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn settlement_transfer_payment_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.destination_payment_token_account.to_account_info(),
                to: self.seller_destination_payment_token_account.to_account_info(),
                authority: self.purchaser.to_account_info(),
            },
        )
    }

    fn settlement_transfer_purchased_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.destination_token_account.to_account_info(),
                to: self.purchaser_destination_token_account.to_account_info(),
                authority: self.seller.to_account_info(),
            },
        )
    }
}

pub fn handler(ctx: Context<AcceptSettlementContract>) -> Result<()> {

    let settlement_contract = &ctx.accounts.settlement_contract;

    // Ensure Signer is the remaining signature required by the settlement contract
    let futures_contract_seller_key = ctx.accounts.futures_contract.seller;
    let futures_contract_purchaser_key = ctx.accounts.futures_contract_purchase.purchaser;
    let signer_key = ctx.accounts.signer.key();

    if !(signer_key == futures_contract_seller_key) && !(signer_key == futures_contract_purchaser_key) {
        return Err(error!(ErrorCode::InvalidSettlementSignerKey));
    }

    if (signer_key == futures_contract_seller_key) && settlement_contract.seller_signed_boolean {
        return Err(error!(ErrorCode::ProvidedSignerAlreadySignedSettlement));
    }

    if (signer_key == futures_contract_purchaser_key) && settlement_contract.purchaser_signed_boolean {
        return Err(error!(ErrorCode::ProvidedSignerAlreadySignedSettlement));
    }

    // Do the transfers
    let payment_amount = ctx.accounts.payment_token_account.amount;
    token::transfer(ctx.accounts.transfer_payment_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), payment_amount)?;

    let purchased_amount = ctx.accounts.futures_contract_purchase.purchased_amount;
    token::transfer(ctx.accounts.transfer_purchased_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), purchased_amount)?;

    let payment_token_amount = ctx.accounts.settlement_contract.payment_token_amount;
    if payment_token_amount > 0 {
        token::transfer(ctx.accounts.settlement_transfer_payment_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), payment_token_amount)?;
    }

    let purchased_token_amount = ctx.accounts.settlement_contract.purchased_token_amount;
    if purchased_token_amount > 0 {
        token::transfer(ctx.accounts.settlement_transfer_purchased_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), purchased_token_amount)?;
    }

    // Either update the seller's futures contract or close it (in the case that purchased_amount = listed_amount)
    if purchased_amount != ctx.accounts.futures_contract.listed_amount {

        let futures_contract = &mut ctx.accounts.futures_contract;
        futures_contract.listed_amount.try_sub_assign(purchased_amount)?;
        futures_contract.purchased_amount.try_sub_assign(purchased_amount)?;

    }
    else {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.seller;

        // Close the futures contract state account
        let futures_contract_account_info = &mut ctx.accounts.futures_contract.to_account_info();
        close_account(futures_contract_account_info, receiver)?;

        // Decrement futures contract count in Derivative Dex's state
        ctx.accounts.derivative_dex.futures_contracts_count.try_sub_assign(1)?;

    }


    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.purchaser;

    // Close the futures contract purchase state account
    let futures_contract_purchase_account_info = &mut ctx.accounts.futures_contract_purchase.to_account_info();
    close_account(futures_contract_purchase_account_info, receiver)?;

    if settlement_contract.seller_signed_boolean {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.seller;

        // Close the settlement contract state account
        let settlement_contract_account_info = &mut ctx.accounts.settlement_contract.to_account_info();
        close_account(settlement_contract_account_info, receiver)?;

        // Decrement settlement contract count in Derivative Dex's state
        ctx.accounts.derivative_dex.settlement_contract_count.try_sub_assign(1)?;

    }

    else {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.purchaser;

        // Close the settlement contract state account
        let settlement_contract_account_info = &mut ctx.accounts.settlement_contract.to_account_info();
        close_account(settlement_contract_account_info, receiver)?;

        // Decrement settlement contract count in Derivative Dex's state
        ctx.accounts.derivative_dex.settlement_contract_count.try_sub_assign(1)?;

    }

    msg!("Settlement contract with address {} accepted by {}", ctx.accounts.settlement_contract.key(), ctx.accounts.signer.key());
    Ok(())
}
