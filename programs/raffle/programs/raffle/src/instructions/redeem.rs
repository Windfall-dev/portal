use anchor_lang::prelude::*;
use crate::states::*;

#[derive(Accounts)]
pub struct Redeem<'info> {
    pub user_authority: Signer<'info>,
    #[account(mut)]
    pub raffle: Account<'info, Raffle>,

    #[account(
        init,
        seeds = [b"raffle", raffle.key().as_ref(), user_authority.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8,
    )]
    pub user_record: Account<'info, UserRecord>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn redeem(
    ctx: Context<Redeem>,
    tickets_allocated: u64,
    // proof: Vec<[u8; 32]>,
) -> Result<()> {
    // TODO: Verify raffle status

    // TODO: Verify if a corresponding compressed account exists or not

    if !ctx.accounts.raffle.is_public {
        // TODO: Verify the number of tickets using a Merkle tree

        // Implement Merkle tree verification logic here
        // This should include:
        // 1. Retrieving the Merkle root from the raffle account
        // 2. Calculating the leaf node for the current user and ticket amount
        // 3. Verifying the Merkle proof provided by frontend against the root
        // 4. Ensuring the calculated leaf is part of the Merkle tree
        // If verification fails, return an error
    } else {
        // TODO: Verify the number of tickets allowed per user
    }

    let ur = &mut ctx.accounts.user_record;
    ur.tickets_allocated = tickets_allocated;
    ur.user_authority = ctx.accounts.user_authority.key();
    ur.raffle = ctx.accounts.raffle.key();

    // From here on, the user has either:
    //   1. UserRecord as a normal Solana account
    //   2. UserRecord as a zk compressed account

    Ok(())
}
