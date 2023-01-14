use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, PurchasedFuturesContractListing};
use prog_common::{close_account, TrySub};

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_purchased_futures_contract_listing: u8)]
pub struct ClosePurchasedFuturesContractListing<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract
    #[account(seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), seller.key().as_ref(), seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = seller, has_one = seed)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    /// CHECK:
    pub seller: AccountInfo<'info>,

    /// CHECK:
    pub seed: AccountInfo<'info>,

    // The futures contract purchase state account
    #[account(seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), purchaser.key().as_ref(), payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase, has_one = purchaser, has_one = payment_token_mint)]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    // The purchaser of the futures contract and listing creator
    pub purchaser: Signer<'info>,

    pub payment_token_mint: Box<Account<'info, Mint>>,

    // The purchased futures contract listing
    #[account(mut, seeds = [b"purchased_futures_contract_listing".as_ref(), futures_contract_purchase.key().as_ref()],
              bump = bump_purchased_futures_contract_listing, has_one = futures_contract_purchase)]
    pub purchased_futures_contract_listing: Box<Account<'info, PurchasedFuturesContractListing>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClosePurchasedFuturesContractListing>) -> Result<()> {

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the purchased futures contract listing state account
    let purchased_futures_contract_listing_account_info = &mut ctx.accounts.purchased_futures_contract_listing.to_account_info();
    close_account(purchased_futures_contract_listing_account_info, receiver)?;

    // Decrement purchased_futures_contracts_listings_count in the Derivative Dex's state account
    let derivative_dex = &mut ctx.accounts.derivative_dex;
    derivative_dex.purchased_futures_contracts_listings_count.try_sub_assign(1)?;

    msg!("Purchased futures contract listing with address {} now closed", ctx.accounts.purchased_futures_contract_listing.key());
    Ok(())
}
