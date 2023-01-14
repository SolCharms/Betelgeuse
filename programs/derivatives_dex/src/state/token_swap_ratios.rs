/// 'Note bene' that the ratios in these structs should be kept relatively simple (at least on side of the listing amount, if possible).
/// Moreover, they should be stated in the lowest reduced form, or in other words, factored out (i.e 2:7 and not 4:14).
/// The seller is in control of these ratios and it is in their interest to make the listed amount a factor of all the listing token ratio amounts.
/// Understandably, this may be quite complicated since there can be several pairings with vastly different ratios (ex. 3:1, 2:5, 1:7, etc).
/// Failure to do so can result in futures contracts which contain listing amounts impossible to fully sell. (i.e listing amount 10, ratio 3:1).

/// Alternatively, one cant list the ratios involving whole amounts (i.e 100,000 listed tokens at a ratio of 100,000:5,000,000).
/// In this way, there can only be one purchaser of the futures contract, avoiding fractionalization.

use anchor_lang::prelude::*;

#[proc_macros::assert_size(48)]
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct TokenSwapRatios {
    // Mint address of token that seller will accept as payment for futures contract
    pub accepted_trade_token: Pubkey,

    // The following two amounts constitute the trade swap ratio between the pair of tokens
    pub listing_token_ratio_amount: u64,

    pub trade_token_ratio_amount: u64,
}
