use anchor_lang::prelude::*;
// use anchor_lang::solana_program::hash::hash;
//use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("HboFgiAsoeAKLFZqUgTmfRYAf6aGUooaEakoGwvnP5iz");

#[program]
pub mod prototype_raffle {
    use super::*;

    pub fn new_raffle(
        ctx: Context<NewRaffle>,
        start_ts: i64,
        end_ts: i64,
        tickets_total: [u64; 4],
        tickets_per_user: u64,
        // payout_per_win: u64,
        is_public: bool,
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        raffle.identifier = ctx.accounts.identifier.key();
        raffle.authority = ctx.accounts.authority.key();
        raffle.bump = ctx.bumps.raffle;
        // raffle.mint = ctx.accounts.mint.key();
        raffle.start_ts = start_ts;
        raffle.end_ts = end_ts;
        raffle.tickets_remaining = tickets_total;
        // raffle.payout_per_win = payout_per_win;
        raffle.tickets_max_per_user = tickets_per_user;
        raffle.is_active = true;
        raffle.is_public = is_public;
        Ok(())
    }

    // TODO: launch ER and execute gas-less tx to draw all the tickets the user has
    pub fn draw(ctx: Context<Draw>, tickets_allocated: u64) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle;
        let dr = &mut ctx.accounts.draw_record;
        
        require!(
            dr.tickets_allocated + tickets_allocated <= raffle.tickets_max_per_user,
            ErrorCode::MaxDrawLimitReached
        );

        // TODO: check if the user is eligible to draw `num_tickets` tickets
        dr.raffle = raffle.key();
        dr.user_authority = ctx.accounts.user_authority.key();
        dr.tickets_allocated += tickets_allocated;
        // TODO: check overflow
        let tickets_remaining: u64 = raffle.tickets_remaining.iter().sum();
        msg!(
            "remaining_tickets [0]: {} ({}/{}/{}/{}), tickets_allocated: {}, tickets_won: {},{},{},{}",
            tickets_remaining,
            raffle.tickets_remaining[0],
            raffle.tickets_remaining[1],
            raffle.tickets_remaining[2],
            raffle.tickets_remaining[3],
            dr.tickets_allocated,
            dr.tickets_won[0],
            dr.tickets_won[1],
            dr.tickets_won[2],
            dr.tickets_won[3],
        );

        // let tickets_remaining = raffle
        //     .losing_tickets_remaining
        //     .checked_add(raffle.winning_tickets_remaining)
        //     .unwrap();
        require!(
            tickets_remaining >= tickets_allocated,
            ErrorCode::InsufficientTickets
        );

        // Generate a simple pseudo-random u64 number based on Solana's Clock
        let clock = Clock::get()?;
        let pseudo_random_number = (clock.unix_timestamp as u64).wrapping_mul(clock.slot);
        let pseudo_random_number = pseudo_random_number.wrapping_mul(pseudo_random_number);
        let mut ticket = pseudo_random_number % tickets_remaining;
        // msg!(
        //     "ticket: {}",
        //     ticket,
        // );

        for index in 0..4 {
            let won = ticket < raffle.tickets_remaining[index];
            if won {
                msg!(
                    "random number: {}, ticket: {}, drawn: r{}",
                    pseudo_random_number,
                    ticket,
                    index
                );
                raffle.tickets_remaining[index] = raffle.tickets_remaining[index].checked_sub(1).unwrap();
                dr.tickets_won[index] = dr.tickets_won[index].checked_add(1).unwrap();
                break;
            } else {
                ticket = ticket.checked_sub(raffle.tickets_remaining[index]).unwrap();
            }
        }

        msg!(
            "remaining_tickets [1]: {} ({}/{}/{}/{}), tickets_allocated: {}, tickets_won: {},{},{},{}",
            tickets_remaining,
            raffle.tickets_remaining[0],
            raffle.tickets_remaining[1],
            raffle.tickets_remaining[2],
            raffle.tickets_remaining[3],
            dr.tickets_allocated,
            dr.tickets_won[0],
            dr.tickets_won[1],
            dr.tickets_won[2],
            dr.tickets_won[3],
        );
        // for _ in 0..tickets_allocated {
        //     // Increment the number of tickets drawn
        //     // dr.tickets_drawn += 1;

        //     // Simulate drawing a ticket
        //     pseudo_random_number = pseudo_random_number.wrapping_mul(pseudo_random_number);

        //     // let pseudo_random_number = clock.slot;

        //     let ticket = pseudo_random_number % tickets_remaining;
        //     let is_winning = ticket < raffle.winning_tickets_remaining;

        //     msg!(
        //         "random number: {}, ticket: {}, is_winning: {}",
        //         pseudo_random_number,
        //         ticket,
        //         is_winning
        //     );

        //     if is_winning {
        //         // Handle winning ticket
        //         raffle.winning_tickets_remaining -= 1;
        //         tickets_won += 1;
        //    } else {
        //         // Handle losing ticket
        //         raffle.losing_tickets_remaining -= 1;
        //     }

        //     // Break the loop if all tickets (winning and losing) have been drawn
        //     if raffle.winning_tickets_remaining == 0 && raffle.losing_tickets_remaining == 0 {
        //         msg!("All tickets have been drawn");
        //         raffle.is_active = false;
        //         break;
        //     }
        //     // Log the current state of the raffle
        //     msg!(
        //         "Remaining tickets - Winning: {}, Losing: {}",
        //         raffle.winning_tickets_remaining,
        //         raffle.losing_tickets_remaining
        //     );
        // }

        // let payout = raffle.payout_per_win.checked_mul(tickets_won).unwrap();
        // if payout > 0 {
        //     let seeds = [
        //         b"raffle".as_ref(),
        //         &raffle.identifier.to_bytes(),
        //         &raffle.authority.to_bytes(),
        //         &[raffle.bump],
        //     ];
        //     token::transfer(
        //         CpiContext::new(
        //             ctx.accounts.token_program.to_account_info(),
        //             token::Transfer {
        //                 from: ctx.accounts.from.to_account_info(),
        //                 to: ctx.accounts.to.to_account_info(),
        //                 authority: ctx.accounts.raffle.to_account_info(),
        //             },
        //         )
        //         .with_signer(&[&seeds[..]]),
        //         payout,
        //     )?;
        // }

        // dr.tickets_won = dr.tickets_won.checked_add(tickets_won).unwrap();

        Ok(())
    }

    pub fn close_raffle(
        _ctx: Context<CloseRaffle>,
    ) -> Result<()> {
        Ok(())
    }

    pub fn nop(
        _ctx: Context<Nop>,
    ) -> Result<()> {
        Ok(())
    }
}

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
        space = 8 + 32 + 32 + 8 + 8 + 8 * 4 + 8 + 1 + 1 + 1,
    )]
    pub raffle: Account<'info, Raffle>,

    // pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Draw<'info> {
    // #[account(mut, address=from.owner)]
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,

    #[account(
        init_if_needed,
        seeds = [b"raffle", raffle.key().as_ref(), user_authority.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 * 4,
    )]
    pub draw_record: Account<'info, DrawRecord>,
    // pub mint: Account<'info, Mint>,
    // #[account(
    //     mut,
    //     associated_token::mint = mint,
    //     associated_token::authority = raffle,
    // )]
    // pub from: Account<'info, TokenAccount>,
    // #[account(
    //     mut,
    //     associated_token::mint = mint,
    //     associated_token::authority = payer,
    // )]
    // pub to: Account<'info, TokenAccount>,
    pub user_authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    // pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CloseRaffle<'info> {
    pub authority: Signer<'info>,

    #[account(mut, close=payer, has_one=authority)]
    pub raffle: Account<'info, Raffle>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Nop {
    // #[account()]
    // pub raffle: Account<'info, Raffle>,
    // #[account(mut)]
    // pub payer: Signer<'info>,
}

/// The [`Raffle`] account, which is created when a set of raffle prizes and eligible participants are set,
/// along with the token account that is being raffled.
#[account]
#[derive(Default)]
pub struct Raffle {
    // The identifier of the raffle. It is used in the PDA derivation.
    pub identifier: Pubkey,
    // The authority of the raffle, which usually represents the organization that is running the raffle.
    pub authority: Pubkey,
    // The mint of the token that is being raffled.
    // Token will be held in the ATA token account derived from the Raffle PDA account.
    // pub mint: Pubkey,
    // The start timestamp of the raffle. 0 means the raffle is open for drawing since is_active becomes true (and now < end_ts).
    pub start_ts: i64,
    // The end timestamp of the raffle. 0 means the raffle is open for drawing until is_active becomes false.
    pub end_ts: i64,

    // TODO: Consider how to handle different types of winning tickets, later after hackathon.

    // The number of remaining ranked tickets in the raffle.
    pub tickets_remaining: [u64; 4],
    // The amount of tokens paid out for each winning ticket.
    // pub payout_per_win: u64,
    // The number of tickets at maximum per each user.
    pub tickets_max_per_user: u64,
    // The bump seed of the raffle account.
    pub bump: u8,
    // Whether the raffle is active or not. Note that an active raffle is not necessarily open for drawing.
    pub is_active: bool,
    // Whether the raffle is public or not. If not, only the eligible users can participate.
    pub is_public: bool,
    // TODO: Add various data to manage the raffle prizes, participants, and results
}

#[account]
#[derive(Default)]
pub struct DrawRecord {
    pub user_authority: Pubkey,
    pub raffle: Pubkey,
    pub tickets_allocated: u64,
    // pub tickets_drawn: u64,
    pub tickets_won: [u64; 4],
}

#[error_code]
pub enum ErrorCode {
    #[msg("Raffle must start in the future")]
    RaffleFuture, // 6000 (0x1770)
    #[msg("Raffle times are non-sequential")]
    SeqTimes, // 6001 (0x1771)
    #[msg("Raffle has not started")]
    StartRaffleTime, // 6002 (0x1772)
    #[msg("Raffle has ended")]
    EndRaffleTime, // 6003 (0x1773)
    #[msg("Raffle has not finished yet")]
    RaffleNotOver, // 6004 (0x1774)
    #[msg("Given nonce is invalid")]
    InvalidNonce, // 6005 (0x1775)
    #[msg("Already withdrawn")]
    AlreadyWithdrawn, // 6006 (0x1776)
    #[msg("Invalid param")]
    InvalidParam, // 6007 (0x1777)
    #[msg("Insufficient tickets")]
    InsufficientTickets, // 6008 (0x1778)
    #[msg("Max draw limit reached")]
    MaxDrawLimitReached, // 6009 (0x1779)
}
