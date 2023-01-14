use anchor_lang::prelude::*;

use crate::state::{DerivativeDex};
use prog_common::errors::ErrorCode;
use prog_common::{close_account};

#[derive(Accounts)]
#[instruction(bump_dex_treasury: u8)]
pub struct CloseDerivativeDex<'info> {

    // Derivative Dex and Derivative Dex Manager
    #[account(mut, has_one = derivative_dex_manager, has_one = derivative_dex_treasury)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,
    pub derivative_dex_manager: Signer<'info>,

    /// CHECK:
    #[account(mut, seeds = [b"treasury".as_ref(), derivative_dex.key().as_ref()], bump = bump_dex_treasury)]
    pub derivative_dex_treasury: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub system_program: Program<'info, System>,

}

pub fn handler(ctx: Context<CloseDerivativeDex>) -> Result<()> {

    // Ensure all Futures Contracts PDAs associated to derivative dex have already been closed
    let derivative_dex = &mut ctx.accounts.derivative_dex;

    if (derivative_dex.futures_contracts_count > 0) || (derivative_dex.purchased_futures_contracts_listings_count > 0) || (derivative_dex.settlement_contract_count > 0) {
        return Err(error!(ErrorCode::NotAllContractPDAsClosed));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the derivative dex treasury state account
    let treasury_account_info = &mut ctx.accounts.derivative_dex_treasury.to_account_info();
    close_account(treasury_account_info, receiver)?;

    // Close the derivative dex state account
    let derivative_dex_account_info = &mut (*ctx.accounts.derivative_dex).to_account_info();
    close_account(derivative_dex_account_info, receiver)?;

    msg!("Derivative dex account with pubkey {} now closed", ctx.accounts.derivative_dex.key());

    Ok(())
}
