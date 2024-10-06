use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Raffle must start in the future")]
    RaffleFuture, // 6000 (0x1770)
    #[msg("Raffle times are non-sequential")]
    SeqTimes, // 6001 (0x1771)
    #[msg("Raffle has not started")]
    StartRaffleTime, // 6002 (0x1772)
    #[msg("Raffle has ended")]
    EndRaffleTime, // 6003 (0x1773)
    #[msg("Raffle has not finished yet")]
    RaffleNotOver, // 6004 (0x1774)
    #[msg("Given nonce is invalid")]
    InvalidNonce, // 6005 (0x1775)
    #[msg("Already withdrawn")]
    AlreadyWithdrawn, // 6006 (0x1776)
    #[msg("Invalid param")]
    InvalidParam, // 6007 (0x1777)
    #[msg("Insufficient tickets")]
    InsufficientTickets, // 6008 (0x1778)
    #[msg("Prize slot unavailable")]
    MaxPrizeReached, // 6009 (0x1779)
}
