use anchor_lang::prelude::*;
// use anchor_lang::solana_program::program::{invoke};
// use anchor_lang::solana_program::system_instruction;

use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::{AssociatedToken};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, SettlementContract};
use prog_common::{close_account, TrySub};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_dex_treasury: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_payment_token: u8, bump_listed_token: u8, bump_settlement_contract: u8)]
pub struct AcceptSettlementContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority, has_one = derivative_dex_treasury)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), derivative_dex.key().as_ref()], bump = bump_dex_treasury)]
    pub derivative_dex_treasury: AccountInfo<'info>,

    // The futures contract to be purchased (or fractionally purchased)
    #[account(mut, seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), future_creator.key().as_ref(), future_seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = future_creator, has_one = future_seed, has_one = future_token_mint, has_one = future_token_account)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    #[account(mut)]
    pub future_creator: AccountInfo<'info>,

    /// CHECK:
    pub future_seed: AccountInfo<'info>,

    // The futures contract purchase state account
    #[account(mut, seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), future_purchaser.key().as_ref(), future_payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase, has_one = futures_contract, has_one = future_purchaser, has_one = future_payment_token_mint, has_one = future_payment_token_account)]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    /// CHECK:
    #[account(mut)]
    pub future_purchaser: AccountInfo<'info>,

    // Payment_token mint
    pub future_payment_token_mint: Box<Account<'info, Mint>>,

    // PDA payment_token account
    #[account(mut, seeds = [b"token_account".as_ref(), future_payment_token_mint.key().as_ref(), future_purchaser.key().as_ref(), futures_contract.key().as_ref()],
              bump = bump_payment_token, token::mint = future_payment_token_mint, token::authority = derivative_dex_authority)]
    pub future_payment_token_account: Box<Account<'info, TokenAccount>>,

    // Destination payment_token account, owned by purchaser
    #[account(init_if_needed, associated_token::mint = future_payment_token_mint, associated_token::authority = future_purchaser, payer = signer)]
    pub future_payment_token_account_purchaser: Box<Account<'info, TokenAccount>>,

    // Destination payment_token account, owned by future creator
    #[account(init_if_needed, associated_token::mint = future_payment_token_mint, associated_token::authority = future_creator, payer = signer)]
    pub future_payment_token_account_creator: Box<Account<'info, TokenAccount>>,

    // Futures contract's token mint
    pub future_token_mint: Box<Account<'info, Mint>>,

    // Futures contract's PDA token account
    #[account(mut, seeds = [b"token_account".as_ref(), future_token_mint.key().as_ref(), future_creator.key().as_ref(), futures_contract.key().as_ref()],
              bump = bump_listed_token, token::mint = future_token_mint, token::authority = derivative_dex_authority)]
    pub future_token_account: Box<Account<'info, TokenAccount>>,

    // Destination token account, owned by future_creator
    #[account(init_if_needed, associated_token::mint = future_token_mint, associated_token::authority = future_creator, payer = signer)]
    pub future_token_account_creator: Box<Account<'info, TokenAccount>>,

    // Destination token account, owned by purchaser
    #[account(init_if_needed, associated_token::mint = future_token_mint, associated_token::authority = future_purchaser, payer = signer)]
    pub future_token_account_purchaser: Box<Account<'info, TokenAccount>>,

    // The settlement PDA contract
    #[account(mut, seeds = [b"settlement_contract".as_ref(), futures_contract.key().as_ref(), futures_contract_purchase.key().as_ref()],
              bump = bump_settlement_contract)]
    pub settlement_contract: Box<Account<'info, SettlementContract>>,

    // The creator of the settlement contract
    #[account(mut)]
    pub signer: Signer<'info>,

    // misc
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> AcceptSettlementContract<'info> {
    fn transfer_payment_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_payment_token_account.to_account_info(),
                to: self.future_payment_token_account_creator.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn transfer_future_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_token_account.to_account_info(),
                to: self.future_token_account_purchaser.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn reclaim_payment_token_balance_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_payment_token_account.to_account_info(),
                to: self.future_payment_token_account_purchaser.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn reclaim_future_token_balance_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_token_account.to_account_info(),
                to: self.future_token_account_creator.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn close_payment_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.future_payment_token_account.to_account_info(),
                destination: self.future_purchaser.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn close_future_token_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.future_token_account.to_account_info(),
                destination: self.future_creator.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    // fn pay_derivative_dex_fee(&self, lamports: u64) -> Result<()> {
    //     invoke(
    //         &system_instruction::transfer(&self.signer.key, &self.derivative_dex_treasury.key, lamports),
    //         &[
    //             self.signer.to_account_info(),
    //             self.derivative_dex_treasury.to_account_info(),
    //             self.system_program.to_account_info(),
    //         ],
    //     )
    //         .map_err(Into::into)
    // }
}

pub fn handler(ctx: Context<AcceptSettlementContract>) -> Result<()> {

    let settlement_contract = &ctx.accounts.settlement_contract;

    // Ensure Signer is the remaining signature required by the settlement contract
    let futures_contract_creator_key = ctx.accounts.futures_contract.future_creator;
    let futures_contract_purchaser_key = ctx.accounts.futures_contract_purchase.future_purchaser;
    let signer_key = ctx.accounts.signer.key();

    if !(signer_key == futures_contract_creator_key) && !(signer_key == futures_contract_purchaser_key) {
        return Err(error!(ErrorCode::InvalidSettlementSignerKey));
    }

    if (signer_key == futures_contract_creator_key) && settlement_contract.future_creator_signed_boolean {
        return Err(error!(ErrorCode::ProvidedSignerAlreadySignedSettlement));
    }

    if (signer_key == futures_contract_purchaser_key) && settlement_contract.future_purchaser_signed_boolean {
        return Err(error!(ErrorCode::ProvidedSignerAlreadySignedSettlement));
    }

    // Do the transfers
    let payment_token_amount = ctx.accounts.settlement_contract.payment_token_amount;
    token::transfer(ctx.accounts.transfer_payment_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), payment_token_amount)?;

    let purchased_token_amount = ctx.accounts.settlement_contract.purchased_token_amount;
    token::transfer(ctx.accounts.transfer_future_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), purchased_token_amount)?;

    let future_payment_token_amount = ctx.accounts.futures_contract_purchase.future_payment_token_amount;
    let remaining_payment_token_amount = future_payment_token_amount.try_sub(payment_token_amount)?;
    if remaining_payment_token_amount > 0 {
        token::transfer(ctx.accounts.reclaim_payment_token_balance_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), remaining_payment_token_amount)?;
    }

    let future_amount_purchased = ctx.accounts.futures_contract_purchase.future_amount_purchased;
    let remaining_purchased_token_amount = future_amount_purchased.try_sub(purchased_token_amount)?;
    if remaining_purchased_token_amount > 0 {
        token::transfer(ctx.accounts.reclaim_future_token_balance_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), remaining_purchased_token_amount)?;
    }

    // Either update the future_creator's futures contract or close it (in the case that purchased_amount = listed_amount)
    if future_amount_purchased != ctx.accounts.futures_contract.future_listed_amount {

        let futures_contract = &mut ctx.accounts.futures_contract;
        futures_contract.future_listed_amount.try_sub_assign(future_amount_purchased)?;
        futures_contract.future_purchased_amount.try_sub_assign(future_amount_purchased)?;

    }
    else {

        // Close the PDA token account
        token::close_account(ctx.accounts.close_future_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]))?;

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.future_creator;

        // Close the futures contract state account
        let futures_contract_account_info = &mut ctx.accounts.futures_contract.to_account_info();
        close_account(futures_contract_account_info, receiver)?;

        // Decrement futures contract count in Derivative Dex's state
        ctx.accounts.derivative_dex.futures_contracts_count.try_sub_assign(1)?;

    }

    // Close the PDA token account
    token::close_account(ctx.accounts.close_payment_token_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]))?;

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.future_purchaser;

    // Close the futures contract purchase state account
    let futures_contract_purchase_account_info = &mut ctx.accounts.futures_contract_purchase.to_account_info();
    close_account(futures_contract_purchase_account_info, receiver)?;

    if settlement_contract.future_creator_signed_boolean {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.future_creator;

        // Close the settlement contract state account
        let settlement_contract_account_info = &mut ctx.accounts.settlement_contract.to_account_info();
        close_account(settlement_contract_account_info, receiver)?;

        // Decrement settlement contract count in Derivative Dex's state
        ctx.accounts.derivative_dex.settlement_contract_count.try_sub_assign(1)?;

    }

    else {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.future_purchaser;

        // Close the settlement contract state account
        let settlement_contract_account_info = &mut ctx.accounts.settlement_contract.to_account_info();
        close_account(settlement_contract_account_info, receiver)?;

        // Decrement settlement contract count in Derivative Dex's state
        ctx.accounts.derivative_dex.settlement_contract_count.try_sub_assign(1)?;

    }

    // // Pay Derivative Dex Trading fee
    // let derivative_dex = &ctx.accounts.derivative_dex;

    // if derivative_dex.derivative_dex_trading_fee > 0 {
    //     ctx.accounts.pay_derivative_dex_fee(derivative_dex.derivative_dex_trading_fee)?;
    // }

    msg!("Settlement contract with address {} accepted by {}", ctx.accounts.settlement_contract.key(), ctx.accounts.signer.key());
    Ok(())
}
