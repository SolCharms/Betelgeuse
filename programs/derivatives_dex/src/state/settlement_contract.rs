use anchor_lang::prelude::*;

#[proc_macros::assert_size(88)] // divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct SettlementContract {
    // Each settlement contract corresponds to a single futures contract
    pub futures_contract: Pubkey,

    // Each settlement contract corresponds to a single futures contract purchase
    pub futures_contract_purchase: Pubkey,

    // The amount of futures contract tokens purchased to be transferred in the settlement offer (seller -> purchaser)
    pub purchased_token_amount: u64,

    // The amount of payment tokens to be transferred in the settlement offer (purchaser -> seller)
    pub payment_token_amount: u64,

    // The boolean indicating whether the futures contract seller has signed the settlement
    pub future_creator_signed_boolean: bool,

    // The boolean indicating whether the futures contract purchaser has signed the settlement
    pub future_purchaser_signed_boolean: bool

}
