use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, FuturesContract, FuturesContractPurchase, PurchasedFuturesContractListing};
use prog_common::{now_ts, close_account, TrySub, TryMul, TryDiv};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8, bump_futures_contract_purchase: u8, bump_payment_token_account:u8, bump_purchased_futures_contract_listing: u8)]
pub struct PurchasePurchasedFuturesContract<'info> {

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
    #[account(mut, seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), listing_seller.key().as_ref(), payment_token_mint.key().as_ref()],
              bump = bump_futures_contract_purchase, has_one = payment_token_mint, constraint = futures_contract_purchase.purchaser == listing_seller.key())]
    pub futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    /// CHECK:
    // The purchaser of the futures contract and listing creator
    #[account(mut)]
    pub listing_seller: AccountInfo<'info>,

    // The token mint used to purchase the futures contract
    pub payment_token_mint: Box<Account<'info, Mint>>,

    // The PDA token account of the purchased futures contract
    #[account(mut, seeds = [b"token_account".as_ref(), payment_token_mint.key().as_ref(), listing_seller.key().as_ref(), futures_contract.key().as_ref()],
              bump = bump_payment_token_account, token::mint = payment_token_mint, token::authority = derivative_dex_authority)]
    pub payment_token_account: Box<Account<'info, TokenAccount>>,

    // The PDA token account of the listing purchaser's purchased futures contract
    #[account(init, seeds = [b"token_account".as_ref(), payment_token_mint.key().as_ref(), listing_purchaser.key().as_ref(), futures_contract.key().as_ref()],
              bump, token::mint = payment_token_mint, token::authority = derivative_dex_authority, payer = listing_purchaser)]
    pub listing_purchaser_payment_token_account: Box<Account<'info, TokenAccount>>,

    // The purchased futures contract listing
    #[account(mut, seeds = [b"purchased_futures_contract_listing".as_ref(), futures_contract_purchase.key().as_ref()],
              bump = bump_purchased_futures_contract_listing, has_one = futures_contract_purchase)]
    pub purchased_futures_contract_listing: Box<Account<'info, PurchasedFuturesContractListing>>,

    // The purchaser of the purchased futures contract listing
    #[account(mut)]
    pub listing_purchaser: Signer<'info>,

    // The token accounts of the listing seller (futures purchaser) and the listing's purchaser, used to purchase the listing
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(mut, token::mint = token_mint, token::authority = listing_purchaser)]
    pub source_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, token::mint = token_mint, token::authority = listing_seller)]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,

    // The listing purchaser's futures contract purchase state account
    #[account(init, seeds = [b"futures_contract_purchase".as_ref(), futures_contract.key().as_ref(), listing_purchaser.key().as_ref(), payment_token_mint.key().as_ref()],
              bump, payer = listing_purchaser, space = 8 + std::mem::size_of::<FuturesContractPurchase>())]
    pub listing_purchaser_futures_contract_purchase: Box<Account<'info, FuturesContractPurchase>>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> PurchasePurchasedFuturesContract<'info> {
    fn listing_payment_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.source_token_account.to_account_info(),
                to: self.destination_token_account.to_account_info(),
                authority: self.listing_purchaser.to_account_info(),
            },
        )
    }

    fn futures_transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.payment_token_account.to_account_info(),
                to: self.listing_purchaser_payment_token_account.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }
}

pub fn handler(ctx: Context<PurchasePurchasedFuturesContract>, listing_purchase_amount: u64) -> Result<()> {

    // Ensure that the purchased futures contract listing's expiry date has not passed
    let now_ts = now_ts()?;
    let listing_expires_ts = ctx.accounts.purchased_futures_contract_listing.listing_expires_ts;

    if now_ts > listing_expires_ts {
        return Err(error!(ErrorCode::PurchasedFuturesContractListingExpired));
    }

    // Ensure that the listing purchase amount requested is available in the listing
    let listing_amount = ctx.accounts.purchased_futures_contract_listing.listing_amount;

    if listing_purchase_amount > listing_amount {
        return Err(error!(ErrorCode::InvalidListingPurchaseAmountRequested));
    }

    // Ensure that the token mint provided is one listed in the listing's token swap ratios
    let token_mint_key = ctx.accounts.token_mint.key();
    let purchased_futures_contract_listing = &ctx.accounts.purchased_futures_contract_listing;
    let accepted_trade_tokens_array: Vec<Pubkey> = purchased_futures_contract_listing.token_swap_ratios_vec.iter().map(|x| x.accepted_trade_token).collect();

    if accepted_trade_tokens_array.iter().find(|&&x| x == token_mint_key).is_none() {
        return Err(error!(ErrorCode::InvalidPaymentTokenMintProvided));
    }

    // Ensure requested listing purchase amount is an integer multiple of the token swap ratio corresponding to provided mint in the purchased futures contract listing
    let index: usize = purchased_futures_contract_listing.token_swap_ratios_vec.iter().position(|&x| x.accepted_trade_token == token_mint_key).unwrap();
    let listing_token_ratio_amount: u64 = purchased_futures_contract_listing.token_swap_ratios_vec[index].listing_token_ratio_amount;
    let trade_token_ratio_amount: u64 = purchased_futures_contract_listing.token_swap_ratios_vec[index].trade_token_ratio_amount;

    if !(listing_purchase_amount % listing_token_ratio_amount == 0) {
        return Err(error!(ErrorCode::InvalidPurchaseAmountRequested));
    }

    // Ensure requested listing purchase amount is an integer multiple of the token swap ratio in the futures contract
    let payment_token_mint_key = ctx.accounts.payment_token_mint.key();
    let futures_contract = &ctx.accounts.futures_contract;
    let futures_contract_index: usize = futures_contract.token_swap_ratios_vec.iter().position(|&x| x.accepted_trade_token == payment_token_mint_key).unwrap();
    let futures_contract_listing_token_ratio_amount: u64 = futures_contract.token_swap_ratios_vec[futures_contract_index].listing_token_ratio_amount;
    let futures_contract_trade_token_ratio_amount: u64 = futures_contract.token_swap_ratios_vec[futures_contract_index].trade_token_ratio_amount;

    if !(listing_purchase_amount % futures_contract_listing_token_ratio_amount == 0) {
        return Err(error!(ErrorCode::InvalidPurchaseAmountRequested));
    }

    // Calculate token payment amount given requested listing purchase amount, token mint address and token swap ratios
    let multiplier = listing_purchase_amount.try_div(listing_token_ratio_amount)?;
    let payment_amount = trade_token_ratio_amount.try_mul(multiplier)?;

    // Do the transfer
    token::transfer(ctx.accounts.listing_payment_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), payment_amount)?;

    // Either update the purchased futures contract listing state account or close it (in the case that listing_amount = listing_purchase_amount)
    if listing_purchase_amount != listing_amount {

        let purchased_futures_contract_listing_mut = &mut ctx.accounts.purchased_futures_contract_listing;
        purchased_futures_contract_listing_mut.listing_amount.try_sub_assign(listing_purchase_amount)?;

    }
    else {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.listing_seller;

        // Close the purchased futures contract listing state account
        let purchased_futures_contract_listing_account_info = &mut ctx.accounts.purchased_futures_contract_listing.to_account_info();
        close_account(purchased_futures_contract_listing_account_info, receiver)?;

        // Decrement purchased_futures_contracts_listings_count in the Derivative Dex's state account
        let derivative_dex = &mut ctx.accounts.derivative_dex;
        derivative_dex.purchased_futures_contracts_listings_count.try_sub_assign(1)?;
    }

    // Calculate payment token amount to be transferred from listing_seller's futures contract purchase state account to listing_purchaser's
    let futures_contract_multiplier = listing_purchase_amount.try_div(futures_contract_listing_token_ratio_amount)?;
    let transfer_amount = futures_contract_trade_token_ratio_amount.try_mul(futures_contract_multiplier)?;

    // Do the transfer
    token::transfer(ctx.accounts.futures_transfer_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), transfer_amount)?;

    // Either update the listing seller's futures contract purchase state account or close it (in the case that purchased amount = listing_purchase_amount)
    if listing_purchase_amount != ctx.accounts.futures_contract_purchase.purchased_amount {

        let futures_contract_purchase = &mut ctx.accounts.futures_contract_purchase;
        futures_contract_purchase.purchased_amount.try_sub_assign(listing_purchase_amount)?;
        futures_contract_purchase.payment_token_amount.try_sub_assign(transfer_amount)?;

    }
    else {
        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.listing_seller;

        // Close the futures contract purchase state account
        let futures_contract_purchase_account_info = &mut ctx.accounts.futures_contract_purchase.to_account_info();
        close_account(futures_contract_purchase_account_info, receiver)?;

    }

    // Update the listing_purchaser's futures contract purchase's state account
    let listing_purchaser_futures_contract_purchase = &mut ctx.accounts.listing_purchaser_futures_contract_purchase;

    listing_purchaser_futures_contract_purchase.futures_contract = ctx.accounts.futures_contract.key();
    listing_purchaser_futures_contract_purchase.purchaser = ctx.accounts.listing_purchaser.key();
    listing_purchaser_futures_contract_purchase.purchased_amount = listing_purchase_amount;
    listing_purchaser_futures_contract_purchase.payment_token_mint = payment_token_mint_key;
    listing_purchaser_futures_contract_purchase.payment_token_account = ctx.accounts.listing_purchaser_payment_token_account.key();
    listing_purchaser_futures_contract_purchase.payment_token_amount = transfer_amount;

    msg!("Purchase of {} from purchased futures contract listing with address {} complete",
         listing_purchase_amount, ctx.accounts.purchased_futures_contract_listing.key());
    Ok(())
}
