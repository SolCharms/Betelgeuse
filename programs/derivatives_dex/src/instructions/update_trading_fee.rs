use anchor_lang::prelude::*;

use crate::state::{DerivativeDex};

#[derive(Accounts)]
pub struct UpdateTradingFee<'info> {

    // Derivative Dex and Derivative Dex Manager
    #[account(mut, has_one = derivative_dex_manager)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,
    pub derivative_dex_manager: Signer<'info>,

    // misc
    pub system_program: Program<'info, System>,
}


pub fn handler(ctx: Context<UpdateTradingFee>, new_derivative_dex_trading_fee: u64) -> Result<()> {

    let derivative_dex = &mut ctx.accounts.derivative_dex;
    derivative_dex.derivative_dex_trading_fee = new_derivative_dex_trading_fee;

    msg!("Derivative Dex trading fee now {}", derivative_dex.derivative_dex_trading_fee);
    Ok(())
}
