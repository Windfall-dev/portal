use anchor_lang::prelude::*;
use mpl_core::instructions::CreateV2CpiBuilder;

use crate::constants::*;
use crate::states::*;

const NFT_TITLE: &str = "Windfall PFP";
const METADATA_URL: &str = "https://api.softgate.co.jp/api/pfp/1";

#[derive(Accounts)]
pub struct NewUserInfo<'info> {
    #[account(
        init,
        seeds = [b"staking", vault.key().as_ref(), owner.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 1,
    )]
    pub user_info: Account<'info, UserInfo>,
    pub owner: Signer<'info>,
    /// CHECK: "authority" is PDA to sign CPI calls.
    #[account(seeds = [AUTHORITY_SEED.as_bytes()], bump)]
    pub authority: UncheckedAccount<'info>,
    /// CHECK: "valut" is used in PDA derivation and should be implemented later.
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub asset: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Metaplex MPL Core
    pub core_program: UncheckedAccount<'info>,
}

pub fn new_user_info(ctx: Context<NewUserInfo>, amount: u64) -> Result<()> {
    let ui = &mut ctx.accounts.user_info;
    ui.owner = ctx.accounts.owner.key();
    ui.vault = ctx.accounts.vault.key();
    ui.stake_amount = amount;
    ui.bump = ctx.bumps.user_info;

    // Fixed authority seed
    let signer_seeds = &[AUTHORITY_SEED.as_bytes(), &[ctx.bumps.authority]];

    // To demonstrate minting a Core Asset upon user account creation.
    CreateV2CpiBuilder::new(&ctx.accounts.core_program)
        .asset(&ctx.accounts.asset)
        .payer(&ctx.accounts.payer)
        .system_program(&ctx.accounts.system_program)
        .name(NFT_TITLE.to_string())
        .uri(METADATA_URL.to_string())
        .owner(Some(&ctx.accounts.owner))
        .update_authority(Some(&ctx.accounts.authority.to_account_info()))
        .invoke_signed(&[signer_seeds])?;

    Ok(())
}
