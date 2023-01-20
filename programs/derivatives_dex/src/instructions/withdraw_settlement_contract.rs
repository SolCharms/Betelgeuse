use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, SettlementContract};
use prog_common::{close_account, TrySub};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_settlement_contract: u8)]
pub struct WithdrawSettlementContract<'info> {

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
    #[account(mut, seeds = [b"settlement_contract".as_ref(), futures_contract.key().as_ref(), futures_contract_purchase.key().as_ref()],
              bump = bump_settlement_contract)]
    pub settlement_contract: Box<Account<'info, SettlementContract>>,

    // The creator of the settlement contract
    pub signer: Signer<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawSettlementContract>) -> Result<()> {

    let settlement_contract = &ctx.accounts.settlement_contract;

    // Ensure signer is the creator of the settlement contract
    let futures_contract_creator_key = ctx.accounts.futures_contract.future_creator;
    let futures_contract_purchaser_key = ctx.accounts.futures_contract_purchase.future_purchaser;
    let signer_key = ctx.accounts.signer.key();

    if !(signer_key == futures_contract_creator_key) && !(signer_key == futures_contract_purchaser_key) {
        return Err(error!(ErrorCode::InvalidSettlementSignerKey));
    }

    if (signer_key == futures_contract_creator_key) && !settlement_contract.future_creator_signed_boolean {
        return Err(error!(ErrorCode::SettlementSignerKeyNotContractCreator));
    }

    if (signer_key == futures_contract_purchaser_key) && !settlement_contract.future_purchaser_signed_boolean {
        return Err(error!(ErrorCode::SettlementSignerKeyNotContractCreator));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the purchased futures contract listing state account
    let settlement_contract_account_info = &mut ctx.accounts.settlement_contract.to_account_info();
    close_account(settlement_contract_account_info, receiver)?;

    // Decrement settlement contract count in Derivative Dex's state
    ctx.accounts.derivative_dex.settlement_contract_count.try_sub_assign(1)?;

    msg!("Settlement contract with address {}, now closed", ctx.accounts.settlement_contract.key());
    Ok(())
}
