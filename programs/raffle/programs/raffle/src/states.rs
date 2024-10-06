use anchor_lang::prelude::*;
// use light_hasher::bytes::AsByteVec;
// use std::ops::{Deref, DerefMut};
use light_sdk::light_account;

use crate::constants::MAX_PRIZES;

/// Represents the winning information for a raffle prize
#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone)]
pub struct Prize {
    /// The amount of tokens paid out when winning.
    pub payout: u64,

    /// The number of tickets remaining.
    pub tickets: u64,
}

/// The [`Raffle`] account, which is created when a set of raffle prizes and eligible participants are set,
/// along with the token account that is being raffled.
#[account]
#[derive(Default)]
pub struct Raffle {
    /// The identifier of the raffle. It is used in PDA derivation.
    pub identifier: Pubkey,

    /// The authority of the raffle, which usually represents the organization that is running the raffle.
    pub authority: Pubkey,

    /// The mint of the token that is being raffled.
    /// Token will be held in the ATA token account derived from the Raffle PDA account.
    pub mint: Pubkey,

    /// The start timestamp of the raffle. 0 means the raffle is open for drawing since is_active becomes true (and now < end_ts).
    pub start_ts: i64,

    /// The end timestamp of the raffle. 0 means the raffle is open for drawing until is_active becomes false.
    pub end_ts: i64,

    /// Information about the prizes offered by this raffle
    pub prizes: [Prize; MAX_PRIZES],

    /// The bump seed of the raffle account.
    pub bump: u8,

    /// Whether the raffle is active or not. Note that an active raffle is not necessarily open for drawing.
    pub is_active: bool,

    /// Whether the raffle is public or not. If not, only the eligible users can participate.
    pub is_public: bool,

    // TODO: merkle root pubkey used in private raffle

    // TODO: max tickets per user in public raffle
}

// /// The [`UserRecordData`] struct, which holds information about a user's raffle entries, winnings, and payouts.
// #[derive(Default, Debug, Clone, AnchorSerialize, AnchorDeserialize)]
// pub struct UserRecordData {
//     /// The authority of the user record.
//     pub user_authority: Pubkey,

//     /// The raffle account that the user is participating in.
//     pub raffle: Pubkey,

//     pub prizes_won: u64,

//     pub tickets_allocated: u64,

//     pub tickets_drawn: u64,

//     pub amount_claimed: u64,
// }

// // impl anchor_lang::IdlBuild for UserRecordData {}

// impl AsByteVec for UserRecordData {
//     fn as_byte_vec(&self) -> Vec<Vec<u8>> {
//         // // for pub prizes_won: [u64; MAX_PRIZES],
//         // // This calculation itself is correct, but passing it to the vec! macro below causes a Custom Program Error 0x1
//         // // Maybe due to hash overflow and the field just needs #[truncate] macro or something like that.
//         // let prizes_won_bytes: Vec<u8> = self.prizes_won.iter()
//         //     .flat_map(|&prize| prize.to_be_bytes().to_vec())
//         //     .collect();
//         vec![
//             self.user_authority.try_to_vec().unwrap(),
//             self.raffle.try_to_vec().unwrap(),
//             self.prizes_won.to_le_bytes().to_vec(),
//             self.tickets_allocated.to_le_bytes().to_vec(),
//             self.tickets_drawn.to_le_bytes().to_vec(),
//             self.amount_claimed.to_le_bytes().to_vec(),
//         ]
//     }
// }

/// The [`UserRecord`] account, a standard account structure used when users participate in drawings or redraws, storing information about their raffle participation.
#[account]
pub struct UserRecord {
    /// The authority of the user record.
    pub user_authority: Pubkey,

    /// The raffle account that the user is participating in.
    pub raffle: Pubkey,

    pub prizes_won: u64,

    pub tickets_allocated: u64,

    pub tickets_drawn: u64,

    pub amount_claimed: u64,
}

// pub struct UserRecord {
//     pub data: UserRecordData,
// }

// impl Deref for UserRecord {
//     type Target = UserRecordData;

//     fn deref(&self) -> &Self::Target {
//         &self.data
//     }
// }

// impl DerefMut for UserRecord {
//     fn deref_mut(&mut self) -> &mut Self::Target {
//         &mut self.data
//     }
// }

/// The [`CompressedUserRecord`] account, a compressed account structure created when users register for a raffle and after the drawing is completed, storing information about their raffle participation.
#[light_account]
#[derive(Clone, Debug, Default)]
pub struct CompressedUserRecord {
    /// The authority of the user record.
    #[truncate]
    pub user_authority: Pubkey,

    /// The raffle account that the user is participating in.
    #[truncate]
    pub raffle: Pubkey,

    pub prizes_won: u64,

    pub tickets_allocated: u64,

    pub tickets_drawn: u64,

    pub amount_claimed: u64,
}

// pub struct CompressedUserRecord {
//     pub data: UserRecordData,
//     // pub amount: u64,
// }

// impl Deref for CompressedUserRecord {
//     type Target = UserRecordData;

//     fn deref(&self) -> &Self::Target {
//         &self.data
//     }
// }

// impl DerefMut for CompressedUserRecord {
//     fn deref_mut(&mut self) -> &mut Self::Target {
//         &mut self.data
//     }
// }
