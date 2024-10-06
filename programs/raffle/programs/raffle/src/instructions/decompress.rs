use crate::*;
use crate::states::*;
use light_sdk::light_accounts;
use light_sdk::compressed_account::LightAccount;
// use light_sdk::context::LightContext;
use light_sdk::merkle_context::PackedAddressMerkleContext;

#[light_accounts]
pub struct Decompress<'info> {
    #[account(mut)]
    #[fee_payer]
    pub signer: Signer<'info>,
    #[self_program]
    pub self_program: Program<'info, crate::program::Raffle>,
    /// CHECK: Checked in Light System Program.
    #[authority]
    pub cpi_signer: AccountInfo<'info>,

    #[light_account(close, seeds = [b"raffle", raffle.key().as_ref(), signer.key().as_ref()])]
    pub compressed_user_record: LightAccount<CompressedUserRecord>,

    #[account(
        init,
        seeds = [b"raffle", raffle.key().as_ref(), signer.key().as_ref()],
        bump,
        payer = signer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8,
    )]
    pub user_record: Account<'info, UserRecord>,

    pub raffle: Account<'info, Raffle>,
}

// pub fn decompress<'info>(
//     ctx: &mut LightContext<'_, '_, '_, 'info, Decompress<'info>, LightDecompress>
// ) -> Result<()> {

//     // TODO: Verify

//     // ctx.accounts.user_record.user_authority = ctx.light_accounts.compressed_user_record.user_authority.key();
//     // ctx.accounts.user_record.raffle = ctx.light_accounts.compressed_user_record.raffle.key();
//     // ctx.accounts.user_record.prizes_won = ctx.light_accounts.compressed_user_record.prizes_won;
//     // ctx.accounts.user_record.tickets_allocated = ctx.light_accounts.compressed_user_record.tickets_allocated;
//     // ctx.accounts.user_record.tickets_drawn = ctx.light_accounts.compressed_user_record.tickets_drawn;
//     // ctx.accounts.user_record.amount_claimed = ctx.light_accounts.compressed_user_record.amount_claimed;

//     Ok(())
// }
