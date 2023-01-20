import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { TokenSwapRatios } from '../../derivative-dex/derivative-dex.client';

export type ListPurchasedFuturesConfig = {
    futuresContractPurchase: PublicKey,
    listingAmount: BN,
    listingExpiresTs: BN,
    tokenSwapRatiosVec: TokenSwapRatios[]
}


// // Purchaser_1
// export const listPurchasedFuturesConfig: ListPurchasedFuturesConfig =
//     {
//         futuresContractPurchase: new PublicKey("2JmGt2ioy5yPxtBXZZxmmHEatd8iw5UggPBdCX4iPYda"),
//         listingAmount: new BN(2_000_000), // must not exceed future amount purchased
//         listingExpiresTs: new BN(1_674_190_740), // must not succeed the expiry date of the futures contract
//         tokenSwapRatiosVec: [
//             {
//                 acceptedTradeToken: new PublicKey("oRCApJ64d39ajjJAhtjKkH25rnkaAUEbSrV92ZXbDw2"),
//                 listingTokenRatioAmount: new BN(5), // USDC
//                 tradeTokenRatioAmount: new BN(4) // ORCA
//             },
//             {
//                 acceptedTradeToken: new PublicKey("MNGoB3hQtvNLNQLmzRKSP3toHQiG56GqkGUamQWgFK4"),
//                 listingTokenRatioAmount: new BN(1), // USDC
//                 tradeTokenRatioAmount: new BN(50) // MNGO
//             },
//         ]
//     }



// Purchaser_2
export const listPurchasedFuturesConfig: ListPurchasedFuturesConfig =
    {
        futuresContractPurchase: new PublicKey("BNMKfc7tz48mcWk1KPCaJrF6i5kz719xE1t7XBcnuus2"),
        listingAmount: new BN(1_000_000), // must not exceed future amount purchased
        listingExpiresTs: new BN(1_674_190_740), // must not succeed the expiry date of the futures contract
        tokenSwapRatiosVec: [
            {
                acceptedTradeToken: new PublicKey("sLNDA9GsWmkUUETzZ5vcaDr7RwswTyG3b4Vz3vdoBFS"),
                listingTokenRatioAmount: new BN(11), // USDC
                tradeTokenRatioAmount: new BN(25) // SLND
            },
            {
                acceptedTradeToken: new PublicKey("sCRPtgbhJUXcFdKC59nhS3AFb1DD3QtkHRMTZ6iEfvV"),
                listingTokenRatioAmount: new BN(300), // USDC
                tradeTokenRatioAmount: new BN(1) // SCRP
            },
        ]
    }
