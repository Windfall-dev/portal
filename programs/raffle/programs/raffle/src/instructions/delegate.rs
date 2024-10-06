use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::cpi::delegate_account;
use crate::states::*;

#[derive(Accounts)]
pub struct Delegate<'info> {
    pub payer: Signer<'info>,
    #[account(mut)]
    pub user_record: Account<'info, UserRecord>,
    /// CHECK: The program that owns the pda
    pub owner_program: AccountInfo<'info>,
    /// CHECK The temporary buffer account used during delegation
    #[account(mut)]
    pub buffer: AccountInfo<'info>,
    /// CHECK: The delegation record account
    #[account(mut)]
    pub delegation_record: AccountInfo<'info>,
    /// CHECK: The delegation metadata account
    #[account(mut)]
    pub delegation_metadata: AccountInfo<'info>,
    /// CHECK: The delegation program ID
    pub delegation_program: AccountInfo<'info>,
    /// The system program
    pub system_program: Program<'info, System>,
}

pub fn delegate(
    ctx: Context<Delegate>,
    valid_until: i64,
    commit_frequency_ms: u32,
) -> Result<()> {
    // TODO: Verify

    let pda_seeds: &[&[u8]] = &[
        b"raffle",
        &ctx.accounts.user_record.raffle.to_bytes(),
        &ctx.accounts.user_record.user_authority.to_bytes(),
    ];

    delegate_account(
        &ctx.accounts.payer,
        &ctx.accounts.user_record.to_account_info(),
        &ctx.accounts.owner_program,
        &ctx.accounts.buffer,
        &ctx.accounts.delegation_record,
        &ctx.accounts.delegation_metadata,
        &ctx.accounts.delegation_program,
        &ctx.accounts.system_program,
        pda_seeds,
        valid_until,
        commit_frequency_ms,
    )?;

    Ok(())
}
