use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, FuturesContract};
use prog_common::{close_account, now_ts, TrySub};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8)]
pub struct WithdrawUnsoldFuturesContractTokens<'info> {

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

    // Destination token account, not necessarily owned by seller
    #[account(mut, token::mint = token_mint)]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}

impl<'info> WithdrawUnsoldFuturesContractTokens<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.token_account.to_account_info(),
                to: self.destination_token_account.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }
}

pub fn handler(ctx: Context<WithdrawUnsoldFuturesContractTokens>) -> Result<()> {

    // Ensure that the futures contract expiry date has not passed
    let now_ts = now_ts()?;
    let futures_contract = &ctx.accounts.futures_contract;
    let futures_contract_expires_ts = futures_contract.contract_expires_ts;

    if now_ts > futures_contract_expires_ts {
        return Err(error!(ErrorCode::FuturesContractExpired));
    }

    // Calculate the amount of unsold tokens in the futures contract
    let listed_amount = ctx.accounts.futures_contract.listed_amount;
    let purchased_amount = ctx.accounts.futures_contract.purchased_amount;
    let unsold_amount = listed_amount.try_sub(purchased_amount)?;

    // Ensure that there are unsold futures contract tokens to withdraw
    if unsold_amount == 0 {
        return Err(error!(ErrorCode::NoUnsoldFuturesContractTokens));
    }

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), unsold_amount)?;

    // Either update the futures contract's state account or close it (in the case that listed amount - unsold amount = 0)
    if purchased_amount != 0 {

        // Update the futures contract's state account
        let futures_contract = &mut ctx.accounts.futures_contract;
        futures_contract.listed_amount.try_sub_assign(unsold_amount)?;

        msg!("{} unsold tokens withdrawn from futures contract with address {}",
             unsold_amount, ctx.accounts.futures_contract.key());
    }
    else {

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.receiver;

        // Close the futures contract state account
        let futures_contract_account_info = &mut ctx.accounts.futures_contract.to_account_info();
        close_account(futures_contract_account_info, receiver)?;

        msg!("{} unsold tokens withdrawn and futures contract with address {} now closed",
             unsold_amount, ctx.accounts.futures_contract.key());
    }

    Ok(())
}
