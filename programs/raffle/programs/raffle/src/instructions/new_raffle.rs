use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::{constants::MAX_PRIZES, states::*};

#[derive(Accounts)]
pub struct NewRaffle<'info> {
    /// CHECK: "identifier" is used as part of PDA seed to distinguish multiple raffles with different periods and scales
    pub identifier: UncheckedAccount<'info>,
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [b"raffle", identifier.key().as_ref(), authority.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 16 * MAX_PRIZES + 1 + 1 + 1,
    )]
    pub raffle: Account<'info, Raffle>,

    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn new_raffle(
    ctx: Context<NewRaffle>,
    start_ts: i64,
    end_ts: i64,
    is_active: bool,
    is_public: bool,
    // root: [u8; 32],
) -> Result<()> {
    let raffle = &mut ctx.accounts.raffle;
    raffle.identifier = ctx.accounts.identifier.key();
    raffle.authority = ctx.accounts.authority.key();
    raffle.bump = ctx.bumps.raffle;
    raffle.mint = ctx.accounts.mint.key();
    raffle.start_ts = start_ts;
    raffle.end_ts = end_ts;
    //raffle.prizes = zero
    raffle.is_active = is_active;
    raffle.is_public = is_public;
    Ok(())
}
