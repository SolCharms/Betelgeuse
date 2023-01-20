use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, PurchasedFuturesListing};
use prog_common::{close_account, TrySub};

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_purchased_futures_listing: u8)]
pub struct ClosePurchasedFuturesListing<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority)]
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

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClosePurchasedFuturesListing>) -> Result<()> {

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the purchased futures contract listing state account
    let purchased_futures_contract_listing_account_info = &mut ctx.accounts.purchased_futures_listing.to_account_info();
    close_account(purchased_futures_contract_listing_account_info, receiver)?;

    // Decrement purchased_futures_contracts_listings_count in the Derivative Dex's state account
    let derivative_dex = &mut ctx.accounts.derivative_dex;
    derivative_dex.purchased_futures_contracts_listings_count.try_sub_assign(1)?;

    msg!("Purchased futures contract listing with address {} now closed", ctx.accounts.purchased_futures_listing.key());
    Ok(())
}
