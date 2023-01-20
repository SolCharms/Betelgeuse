use anchor_lang::prelude::*;

use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, FuturesContract};
use prog_common::{close_account, TrySub};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8, bump_futures_contract: u8)]
pub struct WithdrawUnsoldFuturesTokens<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    // The futures contract
    #[account(mut, seeds = [b"futures_contract".as_ref(), derivative_dex.key().as_ref(), future_creator.key().as_ref(), future_seed.key.as_ref()],
              bump = bump_futures_contract, has_one = derivative_dex, has_one = future_creator, has_one = future_seed, has_one = future_token_mint, has_one = future_token_account)]
    pub futures_contract: Box<Account<'info, FuturesContract>>,

    // Creator of the futures contract
    pub future_creator: Signer<'info>,

    /// CHECK:
    // Account pubkey used as seed for initialization of futures contract PDA
    pub future_seed: AccountInfo<'info>,

    // PDA token account and mint
    #[account(mut, seeds = [b"token_account".as_ref(), future_token_mint.key().as_ref(), future_creator.key().as_ref(), futures_contract.key().as_ref()],
              bump, token::mint = future_token_mint, token::authority = derivative_dex_authority)]
    pub future_token_account: Box<Account<'info, TokenAccount>>,

    pub future_token_mint: Box<Account<'info, Mint>>,

    // Destination token account, not necessarily owned by future contract creator
    #[account(mut, token::mint = future_token_mint)]
    pub future_destination_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}

impl<'info> WithdrawUnsoldFuturesTokens<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_token_account.to_account_info(),
                to: self.future_destination_token_account.to_account_info(),
                authority: self.derivative_dex_authority.to_account_info(),
            },
        )
    }

    fn close_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.future_token_account.to_account_info(),
                destination: self.receiver.to_account_info(),
                authority: self.derivative_dex_authority.clone(),
            },
        )
    }
}

pub fn handler(ctx: Context<WithdrawUnsoldFuturesTokens>) -> Result<()> {

    // Calculate the amount of unsold tokens in the futures contract
    let listed_amount = ctx.accounts.futures_contract.future_listed_amount;
    let purchased_amount = ctx.accounts.futures_contract.future_purchased_amount;
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
        futures_contract.future_listed_amount.try_sub_assign(unsold_amount)?;

        msg!("{} unsold tokens withdrawn from futures contract with address {}",
             unsold_amount, ctx.accounts.futures_contract.key());
    }
    else {

        // Close the PDA token account
        token::close_account(ctx.accounts.close_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]))?;

        // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
        let receiver = &mut ctx.accounts.receiver;

        // Close the futures contract state account
        let futures_contract_account_info = &mut ctx.accounts.futures_contract.to_account_info();
        close_account(futures_contract_account_info, receiver)?;

        // Decrement futures contract count in Derivative Dex's state
        let derivative_dex = &mut ctx.accounts.derivative_dex;
        derivative_dex.futures_contracts_count.try_sub_assign(1)?;

        msg!("{} unsold tokens withdrawn and futures contract with address {} now closed",
             unsold_amount, ctx.accounts.futures_contract.key());
    }

    Ok(())
}
