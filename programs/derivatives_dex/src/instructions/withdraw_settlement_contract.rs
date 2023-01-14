use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, SettlementContract};
//use prog_common::{TryAdd};
//use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_settlement_contract: u8)]
pub struct WithdrawSettlementContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract to be purchased (or fractionally purchased)
    #[account(seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), seller.key().as_ref(), seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = seller, has_one = seed)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    pub seller: AccountInfo<'info>,

    /// CHECK:
    pub seed: AccountInfo<'info>,

    // The futures contract purchase state account
    #[account(seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), purchaser.key().as_ref(), payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase)]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    /// CHECK:
    pub purchaser: AccountInfo<'info>,

    // The mint address of the payment token
    pub payment_token_mint: Box<Account<'info, Mint>>,

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
