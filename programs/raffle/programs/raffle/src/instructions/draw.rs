use crate::{constants::MAX_PRIZES, states::*};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Draw<'info> {
    pub user_authority: Signer<'info>,
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,

    #[account(mut, has_one=raffle, has_one=user_authority)]
    pub user_record: Account<'info, UserRecord>,

    #[account(mut)]
    pub payer: Signer<'info>,
}

fn initialize_seed() -> Result<u64> {
    // TODO: generate better pseudo random number using VRF
    return Ok(Clock::get()?.slot);
}

fn generate_rn(input: u64) -> u64 {
    // TODO: generate better pseudo random number

    // simple XORShift
    let input = input ^ input.rotate_left(13);
    let input = input ^ input.rotate_right(17);
    input ^ input.rotate_left(5)
}

pub fn draw(ctx: Context<Draw>, tickets_to_draw: u64) -> Result<()> {
    let raffle = &mut ctx.accounts.raffle;
    let ur = &mut ctx.accounts.user_record;

    // TODO: Verify raffle status

    // TODO: check overflow
    let mut tickets_remaining: u64 = raffle.prizes.iter().map(|prize| prize.tickets).sum();
    let mut rn = initialize_seed().unwrap();

    // TODO: Verify the number of remaining tickets

    // TODO: Draw as many tickets as computational budget permits
    for _ in 0..tickets_to_draw {
        let mut ticket = rn % tickets_remaining;

        for index in 0..MAX_PRIZES {
            if ticket < raffle.prizes[index].tickets {
                raffle.prizes[index].tickets = raffle.prizes[index].tickets.checked_sub(1).unwrap();
                ur.prizes_won = ur.prizes_won.checked_add(1).unwrap();
                tickets_remaining = tickets_remaining.saturating_sub(1);
                msg!(
                    "prize {} (remaining {}) won [{}]",
                    index,
                    raffle.prizes[index].tickets,
                    ur.prizes_won
                );
                break;
            } else {
                ticket = ticket.checked_sub(raffle.prizes[index].tickets).unwrap();
            }
        }

        ur.tickets_drawn = ur.tickets_drawn.checked_add(1).unwrap();

        rn = generate_rn(rn);
    }

    Ok(())
}
