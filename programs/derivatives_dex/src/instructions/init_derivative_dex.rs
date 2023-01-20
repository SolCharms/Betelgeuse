use anchor_lang::prelude::*;

use crate::state::{DerivativeDex, LATEST_DERIVATIVE_DEX_VERSION};

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8)]
pub struct InitDerivativeDex<'info> {

    // Derivative_Dex and Derivative_Dex Manager
    #[account(init, payer = derivative_dex_manager, space = 8 + std::mem::size_of::<DerivativeDex>())]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    #[account(mut)]
    pub derivative_dex_manager: Signer<'info>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(init, seeds = [b"treasury".as_ref(), derivative_dex.key().as_ref()], bump, payer = derivative_dex_manager, space = 8)]
    pub derivative_dex_treasury: AccountInfo<'info>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitDerivativeDex>, trading_fee: u64) -> Result<()> {

    let derivative_dex = &mut ctx.accounts.derivative_dex;

    // Manually derive the pubkey of the authority PDA responsible for all token transfers in/out of the new derivative_dex account
    let (derivative_dex_authority_key, bump_derivative_dex_auth) = Pubkey::find_program_address(&[derivative_dex.key().as_ref()], ctx.program_id);
    // Check that the derived authority PDA pubkey matches the one provided
    assert_eq!(ctx.accounts.derivative_dex_authority.key(), derivative_dex_authority_key);

    // Manually derive the pubkey of the derivative dex treasury PDA
    let (derivative_dex_treasury_key, _bump_derivative_dex_treasury) = Pubkey::find_program_address(&[b"treasury".as_ref(), derivative_dex.key().as_ref()], ctx.program_id);
    // Check that the derived treasury PDA pubkey matches the one provided
    assert_eq!(ctx.accounts.derivative_dex_treasury.key(), derivative_dex_treasury_key);

    // Record Derivative_Dex's State
    derivative_dex.version = LATEST_DERIVATIVE_DEX_VERSION;
    derivative_dex.derivative_dex_manager = ctx.accounts.derivative_dex_manager.key();

    derivative_dex.derivative_dex_authority = ctx.accounts.derivative_dex_authority.key();
    derivative_dex.derivative_dex_authority_seed = derivative_dex.key();
    derivative_dex.derivative_dex_authority_bump_seed = [bump_derivative_dex_auth];

    derivative_dex.derivative_dex_treasury = ctx.accounts.derivative_dex_treasury.key();
    derivative_dex.derivative_dex_trading_fee = trading_fee;

    derivative_dex.futures_contracts_count = 0;
    derivative_dex.purchased_futures_contracts_listings_count = 0;
    derivative_dex.settlement_contract_count = 0;

    msg!("New derivative dex account with pubkey {} initialized", ctx.accounts.derivative_dex.key());
    Ok(())
}
