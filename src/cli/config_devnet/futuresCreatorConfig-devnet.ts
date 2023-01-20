import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { TokenSwapRatios } from '../../derivative-dex/derivative-dex.client'

export type FuturesCreatorConfig = {
    derivativeDex: PublicKey,
    seed: PublicKey,
    tokenMint: PublicKey,
    sourceTokenAccount: PublicKey,
    listingAmount: BN,
    contractExpiresTs: BN,
    tokenSwapRatiosVec: TokenSwapRatios[]
}

// // Seller 1
// export const futuresCreatorConfig: FuturesCreatorConfig =
//     {
//         derivativeDex: new PublicKey("8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC"), // Derivative Dex State Account Pubkey
//         seed: new PublicKey("6jxBsCxbfsfKReHpXRBXSQZ2YaYKrc9R9sz3h3xSKpTw"), // Unique pubkey to be used as seed for generating the futures contract
//         tokenMint: new PublicKey("USDCrw1xMH2J8VqeTmn75h1GpiPA5mKt5CpR6hUcqrz"), // USDC Token Mint
//         sourceTokenAccount: new PublicKey("AJz715UF74MSxcXe1ZXkinVBcFB2dvWD4ZrukxYLa2FQ"), // Creator's USDC Token Account
//         listingAmount: new BN(100_000_000), // Amount of USDC in smallest denomination
//         contractExpiresTs: new BN(1_674_190_740), // Currently set to: Thu Jan 19 2023 23:59:00 GMT-0500 (Eastern Standard Time)
//         tokenSwapRatiosVec: [
//             {
//                 acceptedTradeToken: new PublicKey("RAYrCJMhb6CmrRTQ9aUGaG8PaiikzWd8agD5XRXzcLw"), // RAYDIUM Token Mint
//                 listingTokenRatioAmount: new BN(7),
//                 tradeTokenRatioAmount: new BN(20)
//             },
//             {
//                 acceptedTradeToken: new PublicKey("F1DA5pyE7EnrYHEeWHZENHLUWs1iqwDSwAk1uCMPmJ3N"), // BONFIDA Token Mint
//                 listingTokenRatioAmount: new BN(1),
//                 tradeTokenRatioAmount: new BN(2)
//             },
//             {
//                 acceptedTradeToken: new PublicKey("SRMwiToVEf5BgxXK7e6DmsYRyw24PT9aPQyQYCakUWW"), // SERUM Token Mint
//                 listingTokenRatioAmount: new BN(29),
//                 tradeTokenRatioAmount: new BN(50)
//             },
//             {
//                 acceptedTradeToken: new PublicKey("AURYsjyhUfyFVTdfoYcgox85xBHniDYDN2zbRiBacxps"), // AURORY Token Mint
//                 listingTokenRatioAmount: new BN(1),
//                 tradeTokenRatioAmount: new BN(1250)
//             },
//         ]
//     }


// // Seller 2
// export const futuresCreatorConfig: FuturesCreatorConfig =
//     {
//         derivativeDex: new PublicKey("8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC"),
//         seed: new PublicKey("6iBSAjQ5o4Ft2h6uZ3n3WBiku6ghpFD3LVoqEc1Dbokw"),
//         tokenMint: new PublicKey("RAYrCJMhb6CmrRTQ9aUGaG8PaiikzWd8agD5XRXzcLw"),
//         sourceTokenAccount: new PublicKey("6hPiYiDMGDQkazhzhNFRGUFKFCbyNjHk7dKGtCQKVArZ"),
//         listingAmount: new BN(100_000_000),
//         contractExpiresTs: new BN(1_674_190_740),
//         tokenSwapRatiosVec: [
//             {
//                 acceptedTradeToken: new PublicKey("sCRPtgbhJUXcFdKC59nhS3AFb1DD3QtkHRMTZ6iEfvV"),
//                 listingTokenRatioAmount: new BN(3000),
//                 tradeTokenRatioAmount: new BN(2)
//             },
//             {
//                 acceptedTradeToken: new PublicKey("oRCApJ64d39ajjJAhtjKkH25rnkaAUEbSrV92ZXbDw2"),
//                 listingTokenRatioAmount: new BN(50),
//                 tradeTokenRatioAmount: new BN(9)
//             },
//             {
//                 acceptedTradeToken: new PublicKey("AURYsjyhUfyFVTdfoYcgox85xBHniDYDN2zbRiBacxps"),
//                 listingTokenRatioAmount: new BN(241),
//                 tradeTokenRatioAmount: new BN(70_000)
//             },
//         ]
//     }


// // Seller 3
// export const futuresCreatorConfig: FuturesCreatorConfig =
//     {
//         derivativeDex: new PublicKey("8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC"),
//         seed: new PublicKey("2Urv9YFRE6jdvuAeLeoACuvbJZHAi2hcnKjtcA3EeUwH"),
//         tokenMint: new PublicKey("oRCApJ64d39ajjJAhtjKkH25rnkaAUEbSrV92ZXbDw2"),
//         sourceTokenAccount: new PublicKey("6SyeP8wFbkwvw7bj6SLfyRWh6md73fkpBHHVNCAXCdcS"),
//         listingAmount: new BN(75_000_000),
//         contractExpiresTs: new BN(1_674_190_740),
//         tokenSwapRatiosVec: [
//             {
//                 acceptedTradeToken: new PublicKey("sLNDA9GsWmkUUETzZ5vcaDr7RwswTyG3b4Vz3vdoBFS"),
//                 listingTokenRatioAmount: new BN(5),
//                 tradeTokenRatioAmount: new BN(12)
//             },
//             {
//                 acceptedTradeToken: new PublicKey("MNGoB3hQtvNLNQLmzRKSP3toHQiG56GqkGUamQWgFK4"),
//                 listingTokenRatioAmount: new BN(1),
//                 tradeTokenRatioAmount: new BN(60)
//             }
//         ]
//     }


// Seller 1 (2nd futures contract)
export const futuresCreatorConfig: FuturesCreatorConfig =
    {
        derivativeDex: new PublicKey("8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC"),
        seed: new PublicKey("3wyCV7zQwppyxhn9LZb7ugrh9acWo4bpTCTmz4huuqWG"),
        tokenMint: new PublicKey("sCRPtgbhJUXcFdKC59nhS3AFb1DD3QtkHRMTZ6iEfvV"),
        sourceTokenAccount: new PublicKey("HQcCKkzw6RWUuv34vkp586jehJwyszs5wN6Nz4PvseTG"),
        listingAmount: new BN(1_000_000),
        contractExpiresTs: new BN(1_674_237_000),
        tokenSwapRatiosVec: [
            {
                acceptedTradeToken: new PublicKey("AURYsjyhUfyFVTdfoYcgox85xBHniDYDN2zbRiBacxps"),
                listingTokenRatioAmount: new BN(11),
                tradeTokenRatioAmount: new BN(5_000_000)
            }
        ]
    }
