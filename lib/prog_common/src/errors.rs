use anchor_lang::prelude::*;

/// Do NOT reorder the errors in this enum. Tests are relying on error ordering.
/// Not great, but for some reason when ErrorCode is factored out into a lib,
/// test messages no longer print actual messages and print error codes instead.
///
/// The other alternative is to have a custom error type inside the common library
/// and to try to convert that -> ErrorCode -> ProgramError
/// Unfortunately I wasn't able to get that working, last leg is failing.
///
/// todo to revisit in v1
#[error_code]
pub enum ErrorCode {
    // --------------------------------------- generic (0 - 19)
    #[msg("failed to perform some math operation safely")]
    ArithmeticError, //0x1770

    #[msg("unknown instruction called")]
    UnknownInstruction, //0x1771

    #[msg("invalid parameter passed in")]
    InvalidParameter, //0x1772

    #[msg("anchor serialization issue")]
    AnchorSerializationIssue, //0x1773

    #[msg("two amounts that are supposed to be equal are not")]
    AmountMismatch, //0x1774

    #[msg("account discriminator doesn't match")]
    AccountDiscriminatorMismatch, //0x1775

    Reserved6, //0x1776
    Reserved7, //0x1777
    Reserved8, //0x1778
    Reserved9, //0x1779

    #[msg("All futures contract, purchased futures contract listing, and settlement PDAs must be closed before attempting to close derivative dex")]
    NotAllContractPDAsClosed, //0x177A

    #[msg("The futures contract expiry unix timestamp must succeed the present unix timestamp")]
    InvalidContractExpiresTs, //0x177B

    #[msg("The number of token swap ratios provided must be greater than zero")]
    InvalidNumberOfTokenSwapRatios, //0x177C

    #[msg("The futures contract has expired, purchase of contract no longer possible")]
    FuturesContractExpired, //0x177D

    #[msg("The amount requested for purchase is not available in the futures contract")]
    PurchaseAmountRequestedUnavailable, //0x177E

    #[msg("The payment token mint provided is not one listed as 'accepted' in the futures contract")]
    InvalidPaymentTokenMintProvided, //0x177F

    #[msg("Purchase amount requested must be an integer multiple of the listing token ratio amount (for the correct mint's token swap ratio)")]
    InvalidPurchaseAmountRequested, //0x1780

    #[msg("Cannot withdraw as there are no remaining unsold tokens in this futures contract")]
    NoUnsoldFuturesContractTokens, //0x1781

    #[msg("The listing's expiry unix timestamp must succeed the present unix timestamp and precede the futures contract's expiry unix timestamp")]
    InvalidListingExpiresTs, //0x1782

    #[msg("The listing amount cannot be greater than purchased amount from the futures contract purchase")]
    InvalidListingAmount, //0x1782

    #[msg("The purchased futures contract listing has expired, purchase of listing no longer possible")]
    PurchasedFuturesContractListingExpired, //0x1783

    #[msg("The listing amount is now greater than the purchased amount due to the addition of the supplemental listing amount provided")]
    InvalidSupplementalListingAmount, //0x1784

    #[msg("Cannot withdraw as there are no remaining unsold tokens in this purchased futures contract listing")]
    NoUnsoldPurchasedFuturesContractListingTokens, //0x1785

    #[msg("The amount requested for purchase is not available in the listing")]
    InvalidListingPurchaseAmountRequested, //0x1786

    #[msg("The signer key provided must be either the futures contract seller or purchaser")]
    InvalidSettlementSignerKey, //0x1787

    #[msg("The signer key provided is not the settlement contract creator")]
    SettlementSignerKeyNotContractCreator, //0x1788

    #[msg("The provided signer key has already signed the settlement contract")]
    ProvidedSignerAlreadySignedSettlement, //0x1789

    Reserved26, //0x178A
    Reserved27, //0x178B
    Reserved28, //0x178C
    Reserved29, //0x178D

    Reserved30, //0x178E
    Reserved31, //0x178F
    Reserved32, //0x1790
    Reserved33, //0x1791
    Reserved34, //0x1792
    Reserved35, //0x1793
    Reserved36, //0x1794
    Reserved37, //0x1795
    Reserved38, //0x1796
    Reserved39, //0x1797

    Reserved40, //0x1798
    Reserved41, //0x1799
    Reserved42, //0x179A
    Reserved43, //0x179B
    Reserved44, //0x179C
    Reserved45, //0x179D
    Reserved46, //0x179E
    Reserved47, //0x179F
    Reserved48, //0x17A0
    Reserved49, //0x17A1

    Reserved50, //0x17A2
    Reserved51, //0x17A3
    Reserved52, //0x17A4
    Reserved53, //0x17A5
    Reserved54, //0x17A6
    Reserved55, //0x17A7
    Reserved56, //0x17A8
    Reserved57, //0x17A9
    Reserved58, //0x17AA
    Reserved59, //0x17AB

    Reserved60, //0x17AC
    Reserved61, //0x17AD
    Reserved62, //0x17AE
    Reserved63, //0x17AF
    Reserved64, //0x17B0
    Reserved65, //0x17B1
    Reserved66, //0x17B2
    Reserved67, //0x17B3
    Reserved68, //0x17B4
    Reserved69, //0x17B5

    Reserved70, //0x17B6
    Reserved71, //0x17B7
    Reserved72, //0x17B8
    Reserved73, //0x17B9
    Reserved74, //0x17BA
    Reserved75, //0x17BB
    Reserved76, //0x17BC
    Reserved77, //0x17BD
    Reserved78, //0x17BE
    Reserved79, //0x17BF
}
