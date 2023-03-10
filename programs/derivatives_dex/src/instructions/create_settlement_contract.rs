use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, SettlementContract};
use prog_common::{TryAdd};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8)]
pub struct CreateSettlementContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract to be purchased (or fractionally purchased)
    #[account(seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), future_creator.key().as_ref(), future_seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = future_creator, has_one = future_seed)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    pub future_creator: AccountInfo<'info>,

    /// CHECK:
    pub future_seed: AccountInfo<'info>,

    // The futures contract purchase state account
    #[account(seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), future_purchaser.key().as_ref(), future_payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase, has_one = futures_contract, has_one = future_purchaser, has_one = future_payment_token_mint)]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    /// CHECK:
    pub future_purchaser: AccountInfo<'info>,

    // The mint address of the payment token
    pub future_payment_token_mint: Box<Account<'info, Mint>>,

    // The settlement PDA contract
    #[account(init, seeds = [b"settlement_contract".as_ref(), futures_contract.key().as_ref(), futures_contract_purchase.key().as_ref()],
              bump, payer = signer, space = 8 + std::mem::size_of::<SettlementContract>())]
    pub settlement_contract: Box<Account<'info, SettlementContract>>,

    #[account(mut)]
    pub signer: Signer<'info>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateSettlementContract>, purchased_token_amount: u64, payment_token_amount: u64) -> Result<()> {

    // Ensure signer is either the future creator or the future purchaser of the futures contract
    let futures_contract_future_creator_key = ctx.accounts.futures_contract.future_creator;
    let futures_contract_purchaser_key = ctx.accounts.futures_contract_purchase.future_purchaser;
    let signer_key = ctx.accounts.signer.key();

    if !(signer_key == futures_contract_future_creator_key) && !(signer_key == futures_contract_purchaser_key) {
        return Err(error!(ErrorCode::InvalidSettlementSignerKey));
    }

    let futures_contract_purchase = &ctx.accounts.futures_contract_purchase;

    // Ensure the purchased token amount in the settlement contract is not greater than the one in the purchased futures contract
    if purchased_token_amount > futures_contract_purchase.future_amount_purchased {
        return Err(error!(ErrorCode::InvalidPurchasedTokenAmount));
    }

    // Ensure payment token amount in the settlement contract is not greater than the one in the purchased futures contract
    if payment_token_amount > futures_contract_purchase.future_payment_token_amount {
        return Err(error!(ErrorCode::InvalidPaymentTokenAmount));
    }

    let settlement_contract = &mut ctx.accounts.settlement_contract;

    settlement_contract.futures_contract = ctx.accounts.futures_contract.key();
    settlement_contract.futures_contract_purchase = ctx.accounts.futures_contract_purchase.key();
    settlement_contract.purchased_token_amount = purchased_token_amount;
    settlement_contract.payment_token_amount = payment_token_amount;

    if signer_key == futures_contract_future_creator_key {

        settlement_contract.future_creator_signed_boolean = true;
        settlement_contract.future_purchaser_signed_boolean = false;

    }
    else if signer_key == futures_contract_purchaser_key {

        settlement_contract.future_creator_signed_boolean = false;
        settlement_contract.future_purchaser_signed_boolean = true;

    }

    // Increment settlement contract count in Derivative Dex's state
    ctx.accounts.derivative_dex.settlement_contract_count.try_add_assign(1)?;

    msg!("Settlement contract with address {} created and signed by {}",
         ctx.accounts.settlement_contract.key(), ctx.accounts.signer.key());
    Ok(())
}
