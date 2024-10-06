use anchor_lang::prelude::*;
use crate::states::*;

#[derive(Accounts)]
pub struct CloseRaffle<'info> {
    pub authority: Signer<'info>,

    #[account(mut, close=payer, has_one=authority)]
    pub raffle: Account<'info, Raffle>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn close_raffle(
    _ctx: Context<CloseRaffle>,
) -> Result<()> {
    Ok(())
}
