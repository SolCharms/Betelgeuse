import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type FuturesPurchaserConfig = {
    futuresContract: PublicKey,
    paymentTokenMint: PublicKey,
    sourcePaymentTokenAccount: PublicKey,
    purchaseAmount: BN,
}



// // Purchaser_2 (from seller_1 1st future)
// export const futuresPurchaserConfig: FuturesPurchaserConfig =
//     {
//         futuresContract: new PublicKey("FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg"),
//         paymentTokenMint: new PublicKey("F1DA5pyE7EnrYHEeWHZENHLUWs1iqwDSwAk1uCMPmJ3N"),
//         sourcePaymentTokenAccount: new PublicKey("9idnypWpLZp3CFPGdwYTKFHk4fkqeEfA6uD7YQWjhWEy"),
//         purchaseAmount: new BN(2_000_000), // must be a multiple of 2 // 1,000,000 * 2 = 2,000,000
//     }




// // Purchaser_1 (from seller_2)
// export const futuresPurchaserConfig: FuturesPurchaserConfig =
//     {
//         futuresContract: new PublicKey("ANTqVCoWQsUjsJhAyWSgC63GU5hBCfjDvW4tA84Sotyt"),
//         paymentTokenMint: new PublicKey("AURYsjyhUfyFVTdfoYcgox85xBHniDYDN2zbRiBacxps"),
//         sourcePaymentTokenAccount: new PublicKey("Bg6rvxH3hdgv8Rr21rpDfV91fYa9Hj7zjLh5Hsn7xYA9"),
//         purchaseAmount: new BN(4_820_000), // must be a multiple of 241 // 241 * 20,000 = 4,820,000
//     }



// // Purchaser_1 (from seller_1 1st future)
// export const futuresPurchaserConfig: FuturesPurchaserConfig =
//     {
//         futuresContract: new PublicKey("FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg"),
//         paymentTokenMint: new PublicKey("F1DA5pyE7EnrYHEeWHZENHLUWs1iqwDSwAk1uCMPmJ3N"),
//         sourcePaymentTokenAccount: new PublicKey("EFtZsMygYrtbncA43ZxKPL6X3Xy8bkB8SBvjsJ6DoKsm"),
//         purchaseAmount: new BN(4_000_000), // must be a multiple of 2 // 2,000,000 * 2 = 4,000,000
//     }




// // Purchaser_1 (from seller_1 1st future)
// export const futuresPurchaserConfig: FuturesPurchaserConfig =
//     {
//         futuresContract: new PublicKey("FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg"),
//         paymentTokenMint: new PublicKey("SRMwiToVEf5BgxXK7e6DmsYRyw24PT9aPQyQYCakUWW"),
//         sourcePaymentTokenAccount: new PublicKey("E4cZpeXBkd6yDuCQUSsVFBcrtFtmq4ZLJTWEoK6M7NBo"),
//         purchaseAmount: new BN(4_350_000), // must be a multiple of 29 // 150,000 * 29 = 4,350,000
//     }



// Purchaser_2 (from seller_1 1st future)
export const futuresPurchaserConfig: FuturesPurchaserConfig =
    {
        futuresContract: new PublicKey("2f9fchBRauBgRuCYkhga616Pdb38RRQQWoyHiovJaeuT"),
        paymentTokenMint: new PublicKey("AURYsjyhUfyFVTdfoYcgox85xBHniDYDN2zbRiBacxps"),
        sourcePaymentTokenAccount: new PublicKey("Bg6rvxH3hdgv8Rr21rpDfV91fYa9Hj7zjLh5Hsn7xYA9"),
        purchaseAmount: new BN(110_000), // must be a multiple of 11 // 10,000 * 11 = 110,000
    }

