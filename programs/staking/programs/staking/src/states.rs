use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct UserInfo {
    /// The owner pubkey of the account.
    pub owner: Pubkey,

    /// The pubkey of the vault.
    pub vault: Pubkey,

    // The amount of token the user has staked.
    pub stake_amount: u64,

    /// The bump seed of the raffle account.
    pub bump: u8,
}
