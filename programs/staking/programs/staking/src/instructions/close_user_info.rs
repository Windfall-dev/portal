use anchor_lang::prelude::*;
use mpl_core::instructions::{TransferV1CpiBuilder, BurnV1CpiBuilder};

use crate::constants::*;
use crate::states::*;

#[derive(Accounts)]
pub struct CloseUserInfo<'info> {
    #[account(mut, close=payer, has_one=owner)]
    pub user_info: Account<'info, UserInfo>,
    pub owner: Signer<'info>,
    /// CHECK: "authority" is PDA to sign CPI calls.
    #[account(seeds = [AUTHORITY_SEED.as_bytes()], bump)]
    pub authority: UncheckedAccount<'info>,
    /// CHECK: "asset" is the Core NFT to be burned.
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Metaplex MPL Core
    pub core_program: UncheckedAccount<'info>,
}

// This instruction is planned to be removed in the future.
// It's temporarily implemented here just to verify the transfer and burn of Core NFT.
// The account closure instruction is implemented provisionally for this purpose.
pub fn close_user_info(ctx: Context<CloseUserInfo>) -> Result<()> {
    // Fixed authority seed
    let signer_seeds = &[AUTHORITY_SEED.as_bytes(), &[ctx.bumps.authority]];

    // Transfer the NFT to 'authority' first.
    // The authority is either the 'authority' or the 'owner' (in this case it should be 'owner').
    TransferV1CpiBuilder::new(&ctx.accounts.core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.owner))
        .payer(&ctx.accounts.payer)
        .new_owner(&ctx.accounts.authority)
        .invoke()?;

    // Now burn the NFT since the program has control over it.
    BurnV1CpiBuilder::new(&ctx.accounts.core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.authority))
        .payer(&ctx.accounts.payer)
        .system_program(Some(&ctx.accounts.system_program))
        .invoke_signed(&[signer_seeds])?;

    Ok(())
}