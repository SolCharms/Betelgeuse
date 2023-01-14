use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, FuturesContract};
use prog_common::{now_ts, TryAdd};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8)]
pub struct SupplementFuturesContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract
    #[account(mut, seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), seller.key().as_ref(), seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = seller, has_one = seed, has_one = token_mint, has_one = token_account)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    // Seller of the futures contract
    pub seller: Signer<'info>,

    /// CHECK:
    // Account pubkey used as seed for initialization of futures contract PDA
    pub seed: AccountInfo<'info>,

    // PDA token account and mint
    #[account(mut, seeds = [b"token_account".as_ref(), token_mint.key().as_ref(), seller.key().as_ref(), futures_contract.key().as_ref()],
              bump, token::mint = token_mint, token::authority = derivative_dex_authority)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    pub token_mint: Box<Account<'info, Mint>>,

    // Source token account, owned by seller
    #[account(mut, token::mint = token_mint, token::authority = seller)]
    pub source_token_account: Box<Account<'info, TokenAccount>>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}

impl<'info> SupplementFuturesContract<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.source_token_account.to_account_info(),
                to: self.token_account.to_account_info(),
                authority: self.seller.to_account_info(),
            },
        )
    }
}

pub fn handler(ctx: Context<SupplementFuturesContract>, supplemental_listing_amount: u64) -> Result<()> {

    // Ensure that the futures contract expiry date has not passed
    let now_ts = now_ts()?;
    let futures_contract = &ctx.accounts.futures_contract;
    let futures_contract_expires_ts = futures_contract.contract_expires_ts;

    if now_ts > futures_contract_expires_ts {
        return Err(error!(ErrorCode::FuturesContractExpired));
    }

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), supplemental_listing_amount)?;

    // Update the futures contract's state account
    let futures_contract = &mut ctx.accounts.futures_contract;
    futures_contract.listed_amount.try_add_assign(supplemental_listing_amount)?;

    msg!("Supplemental funds added to futures contract with address {} for a total listing amount of {}",
         ctx.accounts.futures_contract.key(), ctx.accounts.futures_contract.listed_amount);
    Ok(())
}
