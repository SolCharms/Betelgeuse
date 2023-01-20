use anchor_lang::prelude::*;
use instructions::*;
use crate::state::TokenSwapRatios;

declare_id!("2KQHFGiNHLJUG3uPaTNi8sh8JJ9mysW38w3KcTE1DNcD");

pub mod instructions;
pub mod state;

#[program]
pub mod derivative_dex {
    use super::*;

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// Derivative Dex level functions /////////////////////////////////////////

    pub fn init_derivative_dex(
        ctx: Context<InitDerivativeDex>,
        _bump_dex_auth: u8,
        trading_fee: u64,
    ) -> Result<()> {
        msg!("initializing derivative dex");
        instructions::init_derivative_dex::handler(
            ctx,
            trading_fee
        )
    }

    pub fn update_trading_fee(
        ctx: Context<UpdateTradingFee>,
        new_derivative_dex_trading_fee: u64,
    ) -> Result<()> {
        msg!("updating dex trading fee");
        instructions::update_trading_fee::handler(
            ctx,
            new_derivative_dex_trading_fee
        )
    }

    pub fn payout_from_treasury(
        ctx: Context<PayoutFromTreasury>,
        _bump_dex_treasury: u8,
        minimum_balance_for_rent_exemption: u64,
    ) -> Result<()> {
        msg!("paying out funds from treasury");
        instructions::payout_from_treasury::handler(
            ctx,
            minimum_balance_for_rent_exemption
        )
    }

    pub fn close_defunct_listing(
        ctx: Context<CloseDefunctListing>,
        _bump_dex_treasury: u8,
    ) -> Result<()> {
        msg!("closing defunct listing");
        instructions::close_defunct_listing::handler(ctx)
    }

    pub fn close_derivative_dex(
        ctx: Context<CloseDerivativeDex>,
        _bump_dex_treasury: u8,
    ) -> Result<()> {
        msg!("closing derivative dex");
        instructions::close_derivative_dex::handler(ctx)
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// Futures Contract level functions ///////////////////////////////////////

    pub fn create_futures_contract(
        ctx: Context<CreateFuturesContract>,
        _bump_dex_auth: u8,
        token_swap_ratios_vec: Vec<TokenSwapRatios>,
        listing_amount: u64,
        contract_expires_ts: u64,
    ) -> Result<()> {
        msg!("creating futures contract");
        instructions::create_futures_contract::handler(
            ctx,
            token_swap_ratios_vec,
            listing_amount,
            contract_expires_ts
        )
    }

    pub fn supplement_futures_contract(
        ctx: Context<SupplementFuturesContract>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        supplemental_listing_amount: u64,
    ) -> Result<()> {
        msg!("supplementing funds to futures contract");
        instructions::supplement_futures_contract::handler(
            ctx,
            supplemental_listing_amount
        )
    }

    pub fn withdraw_unsold_futures_tokens(
        ctx: Context<WithdrawUnsoldFuturesTokens>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
    ) -> Result<()> {
        msg!("withdrawing unsold futures contract tokens");
        instructions::withdraw_unsold_futures_tokens::handler(ctx)
    }

    pub fn purchase_futures_contract(
        ctx: Context<PurchaseFuturesContract>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        purchase_amount: u64
    ) -> Result<()> {
        msg!("purchasing futures contract");
        instructions::purchase_futures_contract::handler(
            ctx,
            purchase_amount
        )
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////// Futures Contract Purchase level functions //////////////////////////////

    pub fn list_purchased_futures_contract(
        ctx: Context<ListPurchasedFuturesContract>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        token_swap_ratios_vec: Vec<TokenSwapRatios>,
        listing_amount: u64,
        listing_expires_ts: u64,
    ) -> Result<()> {
        msg!("listing purchased futures contract");
        instructions::list_purchased_futures_contract::handler(
            ctx,
            token_swap_ratios_vec,
            listing_amount,
            listing_expires_ts
        )
    }

    pub fn supplement_purchased_futures_listing(
        ctx: Context<SupplementPurchasedFuturesListing>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        _bump_purchased_futures_listing: u8,
        supplemental_listing_amount: u64,
    ) -> Result<()> {
        msg!("supplementing purchased futures contract");
        instructions::supplement_purchased_futures_listing::handler(
            ctx,
            supplemental_listing_amount
        )
    }

    pub fn close_purchased_futures_listing(
        ctx: Context<ClosePurchasedFuturesListing>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        _bump_purchased_futures_listing: u8,
    ) -> Result<()> {
        msg!("closing purchased futures contract listing");
        instructions::close_purchased_futures_listing::handler(ctx)
    }

    pub fn purchase_purchased_futures_contract(
        ctx: Context<PurchasePurchasedFuturesContract>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        _bump_payment_token_account: u8,
        _bump_purchased_futures_listing: u8,
        listing_purchase_amount: u64,
    ) -> Result<()> {
        msg!("purchasing purchased futures contract");
        instructions::purchase_purchased_futures_contract::handler(
            ctx,
            listing_purchase_amount
        )
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////// Settlement level functions ////////////////////////////////////

    pub fn create_settlement_contract(
        ctx: Context<CreateSettlementContract>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        purchased_token_amount: u64,
        payment_token_amount: u64,
    ) -> Result<()> {
        msg!("creating settlement contract");
        instructions::create_settlement_contract::handler(
            ctx,
            purchased_token_amount,
            payment_token_amount
        )
    }

    pub fn withdraw_settlement_contract(
        ctx: Context<WithdrawSettlementContract>,
        _bump_dex_auth: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        _bump_settlement_contract: u8,
    ) -> Result<()> {
        msg!("withdrawing settlement contract offer");
        instructions::withdraw_settlement_contract::handler(ctx)
    }

    pub fn accept_settlement_contract(
        ctx: Context<AcceptSettlementContract>,
        _bump_dex_auth: u8,
        _bump_dex_treasury: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        _bump_payment_token: u8,
        _bump_listed_token: u8,
        _bump_settlement_contract: u8,
    ) -> Result<()> {
        msg!("accepting settlement contract");
        instructions::accept_settlement_contract::handler(ctx)
    }

    pub fn settle_futures_contract_purchase(
        ctx: Context<SettleFuturesContractPurchase>,
        _bump_dex_auth: u8,
        _bump_dex_treasury: u8,
        _bump_futures_contract: u8,
        _bump_futures_contract_purchase: u8,
        _bump_payment_token: u8,
        _bump_listed_token: u8,
    ) -> Result<()> {
        msg!("settling futures contract purchase");
        instructions::settle_futures_contract_purchase::handler(ctx)
    }

}
