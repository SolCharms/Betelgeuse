use anchor_lang::prelude::*;

use crate::state::{TokenSwapRatios};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct PurchasedFuturesListing {
    // Each listing corresponds to a single purchased futures contract
    pub futures_contract_purchase: Pubkey,

    // The amount of tokens of the purchased futures contract to be listed
    pub listing_amount: u64,

    // The unix timestamp for which the listing was created
    pub listing_created_ts: u64,

    // The unix timestamp for which the listing expires
    pub listing_expires_ts: u64,

    // The vector of token mints being accepted for trade and their corresponding swap ratios
    pub listing_token_swap_ratios_vec: Vec<TokenSwapRatios>,
}
