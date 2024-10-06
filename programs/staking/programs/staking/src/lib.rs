use anchor_lang::prelude::*;

pub mod constants;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("FDqszx72CkWWaLBAEpfhK7ciwq9FrBkv1FCQSgQHeNT9");

#[program]
pub mod staking {
    use super::*;

    pub fn new_user_info(ctx: Context<NewUserInfo>, amount: u64) -> Result<()> {
        instructions::new_user_info(ctx, amount)
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake(ctx, amount)
    }

    pub fn close_user_info(ctx: Context<CloseUserInfo>) -> Result<()> {
        instructions::close_user_info(ctx)
    }

    //
    // Instructions to implement
    //
    // Vault instructions
    // - new_vault
    // - update_vault
    // - close_vault
    //
    // User instructions
    // - new_user
    // - stake
    // - unstake
    //
    // TODO: add various management instructions for operating staked tokens.
    //
}
