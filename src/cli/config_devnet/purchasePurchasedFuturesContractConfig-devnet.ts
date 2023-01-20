import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type purchasePurchasedFuturesConfig = {
    futuresContractPurchaseListing: PublicKey,
    listingTokenMint: PublicKey,
    listingPurchaserTokenAccountSource: PublicKey,
    listingPurchaseAmount: BN
}


// Purchaser 3 (from purchaser 2)
export const purchasePurchasedFuturesConfig: purchasePurchasedFuturesConfig =
    {
        futuresContractPurchaseListing: new PublicKey("5Vgjsb66DvM3m36WqjmQcAYefDmTZRGLoJT9K3XpS1ue"),
        listingTokenMint: new PublicKey("sCRPtgbhJUXcFdKC59nhS3AFb1DD3QtkHRMTZ6iEfvV"),
        listingPurchaserTokenAccountSource: new PublicKey("F22Cv1HTgAQ5bM4iaQTvpTuG6BtAmzQMWo4CHduM4wYd"),
        listingPurchaseAmount: new BN(1_200_000), // must be a multiple of listing_token_ratio_amount in both futures_contract (1) and purchased_futures_listing (300) for the appropriate token pairs
    }





// export const purchasePurchasedFuturesConfig: purchasePurchasedFuturesConfig =
//     {
//         futuresContractPurchase: new PublicKey("7CLuo4hx3mFsBAUtwfa71wdgL6uB7XSUfcvHgB4jst4W"),
//         listingTokenMint: new PublicKey("MNGoB3hQtvNLNQLmzRKSP3toHQiG56GqkGUamQWgFK4"),
//         listingPurchaserTokenAccountSource: new PublicKey("ESyAfFksPnCFPuuWhgH7eNEDN9pvcYgaYJSpao4Pczq9"),
//         listingPurchaseAmount: new BN(290_000),
//     }
