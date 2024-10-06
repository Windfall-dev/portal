use anchor_lang::prelude::*;
use mpl_core::types::{Attribute, Attributes, Plugin};
use mpl_core::instructions::AddPluginV1CpiBuilder;

use crate::constants::*;
use crate::states::*;

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(
        mut,
        seeds = [b"staking", vault.key().as_ref(), owner.key().as_ref()],
        bump,
        has_one=owner,
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
    /// CHECK: "asset" is the Core NFT to add attributes.
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Metaplex MPL Core
    pub core_program: UncheckedAccount<'info>,
}

pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    let ui = &mut ctx.accounts.user_info;
    ui.stake_amount = ui.stake_amount.checked_add(amount).unwrap();

    // Fixed authority seed
    let signer_seeds = &[AUTHORITY_SEED.as_bytes(), &[ctx.bumps.authority]];

    // To demonstrate dynamically adding attributes using Attribute plugin
    AddPluginV1CpiBuilder::new(&ctx.accounts.core_program)
        .asset(&ctx.accounts.asset)
        .payer(&ctx.accounts.payer)
        .authority(Some(&ctx.accounts.authority))
        .init_authority(mpl_core::types::PluginAuthority::UpdateAuthority)
        .system_program(&ctx.accounts.system_program)
        .plugin(Plugin::Attributes(Attributes {
            attribute_list: vec![
                Attribute {
                    key: "color".to_string(),
                    value: "blue".to_string(),
                },
                Attribute {
                    key: "access_type".to_string(),
                    value: "elite".to_string(),
                },
            ],
        }))
        .invoke_signed(&[signer_seeds])?;

    Ok(())
}
