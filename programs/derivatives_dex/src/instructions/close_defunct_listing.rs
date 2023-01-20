use anchor_lang::prelude::*;

use crate::state::{DerivativeDex, PurchasedFuturesListing};
use prog_common::{close_account, now_ts, TrySub};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_treasury: u8)]
pub struct CloseDefunctListing<'info> {

    // Derivative Dex and Derivative Dex Manager
    #[account(mut, has_one = derivative_dex_manager, has_one = derivative_dex_treasury)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    pub derivative_dex_manager: Signer<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), derivative_dex.key().as_ref()], bump = bump_dex_treasury)]
    pub derivative_dex_treasury: AccountInfo<'info>,

    // The purchased futures contract listing
    #[account(mut)]
    pub purchased_futures_listing: Box<Account<'info, PurchasedFuturesListing>>,

    // misc
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseDefunctListing>) -> Result<()> {

    let now_ts = now_ts()?;

    // Ensure purchased futures contract listing has expired
    let listing_expires_ts = ctx.accounts.purchased_futures_listing.listing_expires_ts;

    if !(now_ts > listing_expires_ts) {
        return Err(error!(ErrorCode::ListingNotYetDefunct));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.derivative_dex_treasury;

    // Close the purchased futures contract listing state account
    let purchased_futures_contract_listing_account_info = &mut ctx.accounts.purchased_futures_listing.to_account_info();
    close_account(purchased_futures_contract_listing_account_info, receiver)?;

    // Decrement purchased_futures_contracts_listings_count in the Derivative Dex's state account
    let derivative_dex = &mut ctx.accounts.derivative_dex;
    derivative_dex.purchased_futures_contracts_listings_count.try_sub_assign(1)?;

    msg!("Purchased futures contract listing with address {} now closed", ctx.accounts.purchased_futures_listing.key());
    Ok(())
}
