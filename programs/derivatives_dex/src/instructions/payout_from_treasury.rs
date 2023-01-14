use anchor_lang::prelude::*;

use crate::state::DerivativeDex;
use prog_common::{TrySub, TryAdd};

#[derive(Accounts)]
#[instruction(bump_dex_treasury: u8)]
pub struct PayoutFromTreasury<'info> {

    // Derivative Dex and Derivative Dex Manager
    #[account(has_one = derivative_dex_manager, has_one = derivative_dex_treasury)]
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

pub fn handler(ctx: Context<PayoutFromTreasury>, minimum_balance_for_rent_exemption: u64) -> Result<()> {

    let treasury_account_info: &mut AccountInfo = &mut ctx.accounts.derivative_dex_treasury.to_account_info();
    let receiver_account_info: &mut AccountInfo = &mut ctx.accounts.receiver.to_account_info();

    let treasury_lamports_initial = treasury_account_info.lamports();
    let receiver_lamports_initial = receiver_account_info.lamports();

    let amount = treasury_lamports_initial.try_sub(minimum_balance_for_rent_exemption)?;

    **receiver_account_info.lamports.borrow_mut() = receiver_lamports_initial.try_add(amount)?;
    **treasury_account_info.lamports.borrow_mut() = minimum_balance_for_rent_exemption;

    msg!("{} lamports transferred from treasury to {}", amount, ctx.accounts.receiver.key());
    Ok(())
}
