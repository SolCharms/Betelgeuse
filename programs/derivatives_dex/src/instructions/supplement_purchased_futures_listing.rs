use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, PurchasedFuturesListing};
use prog_common::{now_ts, TryAdd};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_purchased_futures_listing: u8)]
pub struct SupplementPurchasedFuturesListing<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract
    #[account(seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), future_creator.key().as_ref(), future_seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = future_creator, has_one = future_seed)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    pub future_creator: AccountInfo<'info>,

    /// CHECK:
    pub future_seed: AccountInfo<'info>,

    // The futures contract purchase state account
    #[account(seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), future_purchaser.key().as_ref(), future_payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase, has_one = future_purchaser, has_one = future_payment_token_mint)]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    // The purchaser of the futures contract and listing creator
    pub future_purchaser: Signer<'info>,

    pub future_payment_token_mint: Box<Account<'info, Mint>>,

    // The purchased futures contract listing
    #[account(mut, seeds = [b"purchased_futures_listing".as_ref(), futures_contract_purchase.key().as_ref()],
              bump = bump_purchased_futures_listing, has_one = futures_contract_purchase)]
    pub purchased_futures_listing: Box<Account<'info, PurchasedFuturesListing>>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SupplementPurchasedFuturesListing>, supplemental_listing_amount: u64) -> Result<()> {

    // Ensure that the listing_expiry_ts of the purchased futures contract listing has not passed
    let now_ts = now_ts()?;
    let listing_expires_ts = ctx.accounts.purchased_futures_listing.listing_expires_ts;

    if now_ts > listing_expires_ts {
        return Err(error!(ErrorCode::PurchasedFuturesContractListingExpired));
    }

    // Update the purchased futures contract listing's state account
    let purchased_futures_contract_liting = &mut ctx.accounts.purchased_futures_listing;
    purchased_futures_contract_liting.listing_amount.try_add_assign(supplemental_listing_amount)?;

    // Ensure the new listing amount is not greater than the purchased futures contract's purchased amount
    let new_listing_amount = ctx.accounts.purchased_futures_listing.listing_amount;
    let purchased_amount = ctx.accounts.futures_contract_purchase.future_amount_purchased;

    if new_listing_amount > purchased_amount {
        return Err(error!(ErrorCode::InvalidSupplementalListingAmount));
    }

    msg!("Supplemental listing amount of {} added to purchased futures contract listing with address {}",
         supplemental_listing_amount, ctx.accounts.purchased_futures_listing.key());
    msg!("New listing amount is {}", new_listing_amount);
    Ok(())
}
