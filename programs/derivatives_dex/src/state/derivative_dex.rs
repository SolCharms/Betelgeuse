use anchor_lang::prelude::*;

pub const LATEST_DERIVATIVE_DEX_VERSION: u16 = 0;

#[proc_macros::assert_size(168)] // +5 to make it divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct DerivativeDex {
    pub version: u16,

    pub derivative_dex_manager: Pubkey,

    pub derivative_dex_authority: Pubkey,

    pub derivative_dex_authority_seed: Pubkey,

    pub derivative_dex_authority_bump_seed: [u8; 1],

    // --------------- Dex trading fee info

    pub derivative_dex_treasury: Pubkey,

    pub derivative_dex_trading_fee: u64,

    // --------------- PDA counts

    pub futures_contracts_count: u64,

    pub purchased_futures_contracts_listings_count: u64,

    pub settlement_contract_count: u64,
}

impl DerivativeDex {

    pub fn derivative_dex_seeds(&self) -> [&[u8]; 2] {
        [self.derivative_dex_authority_seed.as_ref(), &self.derivative_dex_authority_bump_seed]
    }

}
