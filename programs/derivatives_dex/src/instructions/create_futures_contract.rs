use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::{invoke_signed};
use anchor_lang::solana_program::system_instruction::{create_account};

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{DerivativeDex, TokenSwapRatios};
use prog_common::{now_ts, TryAdd};
use prog_common::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(bump_dex_auth: u8)]
pub struct CreateFuturesContract<'info> {

    // Derivative Dex and Derivative Dex Authority
    #[account(mut, has_one = derivative_dex_authority)]
    pub derivative_dex: Box<Account<'info, DerivativeDex>>,

    /// CHECK:
    #[account(seeds = [derivative_dex.key().as_ref()], bump = bump_dex_auth)]
    pub derivative_dex_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub futures_contract: AccountInfo<'info>,

    // The creator of the futures contract
    #[account(mut)]
    pub future_creator: Signer<'info>,

    /// CHECK:
    // Account pubkey that will be used as seed for initialization of futures contract PDA
    pub future_seed: AccountInfo<'info>,

    // PDA token account and mint
    #[account(init, seeds = [b"token_account".as_ref(), future_token_mint.key().as_ref(), future_creator.key().as_ref(), futures_contract.key().as_ref()],
              bump, token::mint = future_token_mint, token::authority = derivative_dex_authority, payer = future_creator)]
    pub future_token_account: Box<Account<'info, TokenAccount>>,

    pub future_token_mint: Box<Account<'info, Mint>>,

    // Source token account, owned by future creator
    #[account(mut, token::mint = future_token_mint, token::authority = future_creator)]
    pub future_source_token_account: Box<Account<'info, TokenAccount>>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateFuturesContract<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.future_source_token_account.to_account_info(),
                to: self.future_token_account.to_account_info(),
                authority: self.future_creator.to_account_info(),
            },
        )
    }
}

pub fn handler(
    ctx: Context<CreateFuturesContract>,
    token_swap_ratios_vec: Vec<TokenSwapRatios>,
    listing_amount: u64,
    contract_expires_ts: u64
) -> Result<()> {

    let now_ts: u64 = now_ts()?;

    // Ensure futures contract_expires_ts is greater than now_ts
    if contract_expires_ts < now_ts {
        return Err(error!(ErrorCode::InvalidContractExpiresTs));
    }

    // Ensure that at least one token swap mint address and ratio is provided
    let number_of_token_swap_ratios = token_swap_ratios_vec.len();

    if !(number_of_token_swap_ratios > 0) {
        return Err(error!(ErrorCode::InvalidNumberOfTokenSwapRatios));
    }

    // find bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"futures_contract".as_ref(),
            ctx.accounts.derivative_dex.key().as_ref(),
            ctx.accounts.future_creator.key().as_ref(),
            ctx.accounts.future_seed.key().as_ref(),
        ],
        ctx.program_id,
    );

    // Create the futures contract PDA if it doesn't yet exist
    if ctx.accounts.futures_contract.data_is_empty() {
        create_pda_with_space(
            &[
                b"futures_contract".as_ref(),
                ctx.accounts.derivative_dex.key().as_ref(),
                ctx.accounts.future_creator.key().as_ref(),
                ctx.accounts.future_seed.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.futures_contract,
            8 + 5 * 32 + 4 * 8 + (4 + std::mem::size_of::<TokenSwapRatios>() * (number_of_token_swap_ratios)),
            ctx.program_id,
            &ctx.accounts.future_creator.to_account_info(),
            &ctx.accounts.system_program.to_account_info()
        )?;
    }

    // Manually byte-pack the data into the newly created futures contract account
    let disc = hash("account:FuturesContract".as_bytes());

    let purchased_amount: u64 = 0;

    let mut buffer: Vec<u8> = Vec::new();
    token_swap_ratios_vec.serialize(&mut buffer).unwrap();

    let buffer_as_slice: &[u8] = buffer.as_slice();
    let buffer_slice_length: usize = buffer_as_slice.len();
    let slice_end_byte = 200 + buffer_slice_length;

    let mut futures_contract_account_raw = ctx.accounts.futures_contract.data.borrow_mut();
    futures_contract_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
    futures_contract_account_raw[8..40].clone_from_slice(&ctx.accounts.derivative_dex.key().to_bytes());
    futures_contract_account_raw[40..72].clone_from_slice(&ctx.accounts.future_creator.key().to_bytes());
    futures_contract_account_raw[72..104].clone_from_slice(&ctx.accounts.future_seed.key().to_bytes());
    futures_contract_account_raw[104..136].clone_from_slice(&ctx.accounts.future_token_mint.key().to_bytes());
    futures_contract_account_raw[136..168].clone_from_slice(&ctx.accounts.future_token_account.key().to_bytes());
    futures_contract_account_raw[168..176].clone_from_slice(&listing_amount.to_le_bytes());
    futures_contract_account_raw[176..184].clone_from_slice(&purchased_amount.to_le_bytes());
    futures_contract_account_raw[184..192].clone_from_slice(&now_ts.to_le_bytes());
    futures_contract_account_raw[192..200].clone_from_slice(&contract_expires_ts.to_le_bytes());
    futures_contract_account_raw[200..slice_end_byte].clone_from_slice(buffer_as_slice);

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.derivative_dex.derivative_dex_seeds()]), listing_amount)?;

    // Increment Futures Contracts count in Derivative Dex's state
    ctx.accounts.derivative_dex.futures_contracts_count.try_add_assign(1)?;

    msg!("Created futures contract pda with pubkey {} for token mint address {} in the amount of {}",
         ctx.accounts.futures_contract.key(), ctx.accounts.future_token_mint.key(), listing_amount);
    Ok(())
}

// Auxiliary helper functions

fn create_pda_with_space<'info>(
    pda_seeds: &[&[u8]],
    pda_info: &AccountInfo<'info>,
    space: usize,
    owner: &Pubkey,
    funder_info: &AccountInfo<'info>,
    system_program_info: &AccountInfo<'info>,
) -> Result<()> {
    //create a PDA and allocate space inside of it at the same time - can only be done from INSIDE the program
    //based on https://github.com/solana-labs/solana-program-library/blob/7c8e65292a6ebc90de54468c665e30bc590c513a/feature-proposal/program/src/processor.rs#L148-L163
    invoke_signed(
        &create_account(
            &funder_info.key,
            &pda_info.key,
            1.max(Rent::get()?.minimum_balance(space)),
            space as u64,
            owner,
        ),
        &[
            funder_info.clone(),
            pda_info.clone(),
            system_program_info.clone(),
        ],
        &[pda_seeds], //this is the part you can't do outside the program
    )
        .map_err(Into::into)
}
