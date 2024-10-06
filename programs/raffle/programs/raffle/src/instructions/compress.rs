use crate::states::*;
use crate::*;
use light_sdk::compressed_account::LightAccount;
use light_sdk::light_accounts;
// use light_sdk::context::LightContext;
use light_sdk::merkle_context::PackedAddressMerkleContext;

#[light_accounts]
pub struct Compress<'info> {
    #[account(mut)]
    #[fee_payer]
    pub signer: Signer<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::Raffle>,
    /// CHECK: Checked in Light System Program.
    #[authority]
    pub cpi_signer: AccountInfo<'info>,

    #[light_account(init, seeds = [b"raffle", raffle.key().as_ref(), signer.key().as_ref()])]
    pub compressed_user_record: LightAccount<CompressedUserRecord>,

    #[account(mut, close=signer, seeds = [b"raffle", raffle.key().as_ref(), signer.key().as_ref()], bump)]
    pub user_record: Account<'info, UserRecord>,

    pub raffle: Account<'info, Raffle>,
}

// pub fn compress<'info>(
//     ctx: &mut LightContext<'_, '_, '_, 'info, Compress<'info>, LightCompress>,
// ) -> Result<()> {
//     // TODO: Verify
//     ctx.light_accounts.compressed_user_record.prizes_won = 0x98;
//     ctx.light_accounts.compressed_user_record.tickets_allocated = 0x76;
//     ctx.light_accounts.compressed_user_record.tickets_drawn = 0x54;
//     ctx.light_accounts.compressed_user_record.amount_claimed = 0x32;

//     ctx.light_accounts.compressed_user_record.user_authority = ctx.accounts.signer.key().clone();
//     // ctx.light_accounts.compressed_user_record.user_authority = ctx.accounts.raffle.key().clone();
//     // ctx.light_accounts.compressed_user_record.user_authority = ctx.accounts.user_authority.key().clone();
//     // ctx.light_accounts.compressed_user_record.user_authority = ctx.accounts.user_record.user_authority.key();
//     ctx.light_accounts.compressed_user_record.raffle = ctx.accounts.raffle.key();
//     // ctx.light_accounts.compressed_user_record.raffle = ctx.accounts.raffle.key().clone();
//     // ctx.light_accounts.compressed_user_record.prizes_won = ctx.accounts.user_record.prizes_won;
//     // ctx.light_accounts.compressed_user_record.tickets_allocated = ctx.accounts.user_record.tickets_allocated;
//     // ctx.light_accounts.compressed_user_record.tickets_drawn = ctx.accounts.user_record.tickets_drawn;
//     // ctx.light_accounts.compressed_user_record.amount_claimed = ctx.accounts.user_record.amount_claimed;

//     msg!(
//         "ctx.accounts.signer.key() = {}, ctx.accounts.raffle.key() = {}",
//         ctx.accounts.signer.key(),
//         ctx.accounts.raffle.key()
//     );
//     msg!(
//         "user_authority.key() = {}, raffle.key() = {}",
//         ctx.light_accounts
//             .compressed_user_record
//             .user_authority
//             .key(),
//         ctx.light_accounts.compressed_user_record.raffle.key()
//     );

//     Ok(())
// }
