use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::ephem::commit_and_undelegate_accounts;
use crate::states::*;

#[derive(Accounts)]
pub struct Undelegate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub user_record: Account<'info, UserRecord>,
    /// CHECK: MagicBlock program.
    pub magic_program: AccountInfo<'info>,
    /// CHECK: MagicBlock context.
    #[account(mut)]
    pub magic_context: AccountInfo<'info>,
}

pub fn undelegate(
    ctx: Context<Undelegate>,
) -> Result<()> {
    // TODO: Verify

    commit_and_undelegate_accounts(
        &ctx.accounts.payer,
        vec![&ctx.accounts.user_record.to_account_info()],
        &ctx.accounts.magic_context,
        &ctx.accounts.magic_program,
    )?;

    Ok(())
}
