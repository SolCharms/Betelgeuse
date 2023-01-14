use anchor_lang::prelude::*;

#[proc_macros::assert_size(144)] // divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct FuturesContractPurchase {
    // Each futures contract purchase corresponds to a single futures contract
    pub futures_contract: Pubkey,

    // The contract purchaser
    pub purchaser: Pubkey,

    // The amount of futures contract tokens purchased
    pub purchased_amount: u64,

    // The futures contract payment token mint
    pub payment_token_mint: Pubkey,

    // The futures contract payment PDA token account
    pub payment_token_account: Pubkey,

    // The futures contract payment token amount (predetermined by purchased amount + token swap ratios)
    pub payment_token_amount: u64,
}
