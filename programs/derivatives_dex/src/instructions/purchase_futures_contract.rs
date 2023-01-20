use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase};
use prog_common::{now_ts, TryAdd, TrySub, TryMul, TryDiv};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8)]
pub struct PurchaseFuturesContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract to be purchased (or fractionally purchased)
    #[account(mut, seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), future_creator.key().as_ref(), future_seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = future_creator, has_one = future_seed)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    pub future_creator: AccountInfo<'info>,

    /// CHECK:
    pub future_seed: AccountInfo<'info>,

    // The purchaser
    #[account(mut)]
    pub future_purchaser: Signer<'info>,

    // The futures contract purchase state account
    #[account(init, seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), future_purchaser.key().as_ref(), future_payment_token_mint.key().as_ref()],
              bump, payer = future_purchaser, space = 8 + std::mem::size_of::<FuturesContractPurchase>())]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    // PDA token account and mint
    #[account(init, seeds = [b"token_account".as_ref(), future_payment_token_mint.key().as_ref(), future_purchaser.key().as_ref(), futures_contract.key().as_ref()],
              bump, token::mint = future_payment_token_mint, token::authority = derivative_dex_authority, payer = future_purchaser)]
    pub future_payment_token_account: Box<Account<'info, TokenAccount>>,

    pub future_payment_token_mint: Box<Account<'info, Mint>>,

    // Source token account, owned by future purchaser
    #[account(mut, token::mint = future_payment_token_mint, token::authority = future_purchaser)]
    pub future_payment_source_token_account: Box<Account<'info, TokenAccount>>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> PurchaseFuturesContract<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_payment_source_token_account.to_account_info(),
                to: self.future_payment_token_account.to_account_info(),
                authority: self.future_purchaser.to_account_info(),
            },
        )
    }
}

pub fn handler(ctx: Context<PurchaseFuturesContract>, purchase_amount: u64) -> Result<()> {

    // Ensure that the futures contract expiry date has not passed
    let now_ts = now_ts()?;
    let futures_contract = &ctx.accounts.futures_contract;
    let futures_contract_expires_ts = futures_contract.future_expires_ts;

    if now_ts > futures_contract_expires_ts {
        return Err(error!(ErrorCode::FuturesContractExpired));
    }

    // Ensure that purchase amount requested is available in the futures contract
    let listed_amount = ctx.accounts.futures_contract.future_listed_amount;
    let purchased_amount = ctx.accounts.futures_contract.future_purchased_amount;
    let remaining_amount = listed_amount.try_sub(purchased_amount)?;

    if purchase_amount > remaining_amount {
        return Err(error!(ErrorCode::PurchaseAmountRequestedUnavailable));
    }

    // Check that the payment token mint provided is one listed in the futures contract's token swap ratios
    let payment_token_mint_key = ctx.accounts.future_payment_token_mint.key();
    let accepted_trade_tokens_array: Vec<Pubkey> = futures_contract.future_token_swap_ratios_vec.iter().map(|x| x.accepted_trade_token).collect();

    if accepted_trade_tokens_array.iter().find(|&&x| x == payment_token_mint_key).is_none() {
        return Err(error!(ErrorCode::InvalidPaymentTokenMintProvided));
    }

    // Ensure requested purchase amount is an integer multiple of the token swap ratio corresponding to provided mint
    let index: usize = futures_contract.future_token_swap_ratios_vec.iter().position(|&x| x.accepted_trade_token == payment_token_mint_key).unwrap();
    let listing_token_ratio_amount: u64 = futures_contract.future_token_swap_ratios_vec[index].listing_token_ratio_amount;
    let trade_token_ratio_amount: u64 = futures_contract.future_token_swap_ratios_vec[index].trade_token_ratio_amount;

    if !(purchase_amount % listing_token_ratio_amount == 0) {
        return Err(error!(ErrorCode::InvalidPurchaseAmountRequested));
    }

    // Calculate payment token amount given requested purchase amount, payment token mint address and token swap ratios
    let multiplier = purchase_amount.try_div(listing_token_ratio_amount)?;
    let payment_amount = trade_token_ratio_amount.try_mul(multiplier)?;

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), payment_amount)?;

    // Update the futures contract purchase's state account
    let futures_contract_purchase = &mut ctx.accounts.futures_contract_purchase;

    futures_contract_purchase.futures_contract = ctx.accounts.futures_contract.key();
    futures_contract_purchase.future_purchaser = ctx.accounts.future_purchaser.key();
    futures_contract_purchase.future_amount_purchased = purchase_amount;
    futures_contract_purchase.future_payment_token_mint = payment_token_mint_key;
    futures_contract_purchase.future_payment_token_account = ctx.accounts.future_payment_token_account.key();
    futures_contract_purchase.future_payment_token_amount = payment_amount;

    // Update the futures contract's state account
    let futures_contract_mut = &mut ctx.accounts.futures_contract;
    futures_contract_mut.future_purchased_amount.try_add_assign(purchase_amount)?;

    msg!("Purchase of futures contract with address {} for {} complete", ctx.accounts.futures_contract.key(), purchase_amount);
    Ok(())
}
