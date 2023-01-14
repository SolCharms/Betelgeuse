use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_lang::solana_program::system_instruction::{create_account};

use anchor_spl::token::{Mint, Token};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, TokenSwapRatios};
use prog_common::{now_ts, TryAdd};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8)]
pub struct ListPurchasedFuturesContract<'info> {

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
    #[account(mut)]
    pub purchaser: Signer<'info>,

    pub payment_token_mint: Box<Account<'info, Mint>>,

    // The purchased futures contract listing
    /// CHECK:
    #[account(mut)]
    pub purchased_futures_contract_listing: AccountInfo<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ListPurchasedFuturesContract>,
    token_swap_ratios_vec: Vec<TokenSwapRatios>,
    listing_amount: u64,
    listing_expires_ts: u64
) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Ensure that listing_expires_ts is greater than now_ts
    if listing_expires_ts < now_ts {
        return Err(error!(ErrorCode::InvalidListingExpiresTs));
    }

    // Ensure that contract_expires_ts is greater than listing_expires_ts
    let contract_expires_ts = ctx.accounts.futures_contract.contract_expires_ts;

    if contract_expires_ts < listing_expires_ts {
        return Err(error!(ErrorCode::InvalidListingExpiresTs));
    }

    // Ensure listing amount is not greater than the purchased amount in the purchased futures contract
    let purchased_amount = ctx.accounts.futures_contract_purchase.purchased_amount;

    if listing_amount > purchased_amount {
        return Err(error!(ErrorCode::InvalidListingAmount));
    }

    // Ensure that at least one token swap mint address and ratio is provided
    let number_of_token_swap_ratios = token_swap_ratios_vec.len();

    if !(number_of_token_swap_ratios > 0) {
        return Err(error!(ErrorCode::InvalidNumberOfTokenSwapRatios));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"purchased_futures_contract_listing".as_ref(),
            ctx.accounts.futures_contract_purchase.key().as_ref(),
        ],
        ctx.program_id,
    );

    // Create the futures contract PDA if it doesn't yet exist
    if ctx.accounts.purchased_futures_contract_listing.data_is_empty() {
        create_pda_with_space(
            &[
                b"purchased_futures_contract_listing".as_ref(),
                ctx.accounts.futures_contract_purchase.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.purchased_futures_contract_listing,
            8 + 32 + 3 * 8 + (4 + std::mem::size_of::<TokenSwapRatios>() * (number_of_token_swap_ratios)),
            ctx.program_id,
            &ctx.accounts.purchaser.to_account_info(),
            &ctx.accounts.system_program.to_account_info()
        )?;
    }

    // Manually byte-pack the data into the newly created purchased futures contract listing account
    let disc = hash("account:PurchasedFuturesContractListing".as_bytes());

    let mut buffer: Vec<u8> = Vec::new();
    token_swap_ratios_vec.serialize(&mut buffer).unwrap();

    let buffer_as_slice: &[u8] = buffer.as_slice();
    let buffer_slice_length: usize = buffer_as_slice.len();
    let slice_end_byte = 64 + buffer_slice_length;

    let mut purchased_futures_contract_listing_account_raw = ctx.accounts.purchased_futures_contract_listing.data.borrow_mut();
    purchased_futures_contract_listing_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
    purchased_futures_contract_listing_account_raw[8..40].clone_from_slice(&ctx.accounts.futures_contract_purchase.key().to_bytes());
    purchased_futures_contract_listing_account_raw[40..48].clone_from_slice(&listing_amount.to_le_bytes());
    purchased_futures_contract_listing_account_raw[48..56].clone_from_slice(&now_ts.to_le_bytes());
    purchased_futures_contract_listing_account_raw[56..64].clone_from_slice(&listing_expires_ts.to_le_bytes());
    purchased_futures_contract_listing_account_raw[64..slice_end_byte].clone_from_slice(buffer_as_slice);

    // Increment purchased_futures_contracts_listings_count in the Derivative Dex's state account
    let derivative_dex = &mut ctx.accounts.derivative_dex;
    derivative_dex.purchased_futures_contracts_listings_count.try_add_assign(1)?;

    msg!("Purchased futures contract listing created with address {}", ctx.accounts.purchased_futures_contract_listing.key());
    Ok(())
}

// Auxiliary helper functions

fn create_pda_with_space<'info>(
    pda_seeds: &[&[u8]],
    pda_info: &AccountInfo<'info>,
    space: usize,
    owner: &Pubkey,
    funder_info: &AccountInfo<'info>,
    system_program_info: &AccountInfo<'info>,
) -> Result<()> {
    //create a PDA and allocate space inside of it at the same time - can only be done from INSIDE the program
    //based on https://github.com/solana-labs/solana-program-library/blob/7c8e65292a6ebc90de54468c665e30bc590c513a/feature-proposal/program/src/processor.rs#L148-L163
    invoke_signed(
        &create_account(
            &funder_info.key,
            &pda_info.key,
            1.max(Rent::get()?.minimum_balance(space)),
            space as u64,
            owner,
        ),
        &[
            funder_info.clone(),
            pda_info.clone(),
            system_program_info.clone(),
        ],
        &[pda_seeds], //this is the part you can't do outside the program
    )
        .map_err(Into::into)
}
