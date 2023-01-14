use anchor_lang::prelude::*;

use crate::state::{TokenSwapRatios};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct FuturesContract {
    // Each futures contract belongs to a single derivative dex
    pub derivative_dex: Pubkey,

    // The contract seller
    pub seller: Pubkey,

    // Unique seed used in deterministic generation of futures contract PDA
    pub seed: Pubkey,

    // The mint address of the token being listed for sale in the futures contract
    pub token_mint: Pubkey,

    // The PDA token account for which the listed tokens will be held
    pub token_account: Pubkey,

    // The amount being listed for sale in the futures contract (in token's smallest denomination, i.e. lamports)
    pub listed_amount: u64,

    // The unix timestamp for which the futures contract was created
    pub contract_created_ts: u64,

    // The unix timestamp for which the futures contract expires
    pub contract_expires_ts: u64,

    // The total purchased amount from all accepted contract offers (necessary to allow for partial fulfillment of offers)
    pub purchased_amount: u64,

    // The vector of token mints being accepted for trade and their corresponding swap ratios
    pub token_swap_ratios_vec: Vec<TokenSwapRatios>,

}
