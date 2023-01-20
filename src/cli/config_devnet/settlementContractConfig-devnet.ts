import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type settlementContractConfig = {
    futuresContractPurchase: PublicKey,
    purchaseTokenAmount: BN,
    paymentTokenAmount: BN
}

export const settlementContractConfig: settlementContractConfig =
    {
        futuresContractPurchase: new PublicKey("2bpcfEnRj8Ee4tTi48o3MS6YkWn7aAREwdDD88STgdoR"),
        purchaseTokenAmount: new BN(110_000),
        paymentTokenAmount: new BN(50_000_000_000),
    }



// export const settlementContractConfig: settlementContractConfig =
//     {
//         futuresContractPurchase: new PublicKey("2JmGt2ioy5yPxtBXZZxmmHEatd8iw5UggPBdCX4iPYda"),
//         purchaseTokenAmount: new BN(2_000_000),
//         paymentTokenAmount: new BN(4_000_000),
//     }




