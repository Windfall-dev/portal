use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct AddPrizeToRaffle<'info> {
    pub authority: Signer<'info>,

    #[account(mut, has_one=authority)]
    pub raffle: Account<'info, Raffle>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn add_prize_to_raffle(
    ctx: Context<AddPrizeToRaffle>,
    payout: u64,
    tickets: u64,
) -> Result<()> {
    let raffle = &mut ctx.accounts.raffle;

    require!(payout > 0, ErrorCode::InvalidParam);
    require!(tickets > 0, ErrorCode::InvalidParam);

    for prize in raffle.prizes.iter_mut() {
        if prize.payout == 0 {
            *prize = Prize { payout, tickets };
            return Ok(());
        }
    }

    Err(ErrorCode::InvalidParam.into())
}
