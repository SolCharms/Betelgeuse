import { PublicKey } from '@solana/web3.js';
import { DERIVATIVE_DEX_PROG_ID } from '../index';

export const findDerivativeDexAuthorityPDA = async (derivativeDex: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [derivativeDex.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
};

export const findDerivativeDexTreasuryPDA = async (derivativeDex: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), derivativeDex.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
}

export const findTokenAccountPDA = async (tokenMint: PublicKey, user: PublicKey, futuresContract: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('token_account'), tokenMint.toBytes(), user.toBytes(), futuresContract.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
}

export const findFuturesContractPDA = async (derivativeDex: PublicKey, seller: PublicKey, seed: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('futures_contract'), derivativeDex.toBytes(), seller.toBytes(), seed.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
}

export const findFuturesContractPurchasePDA = async (futuresContract: PublicKey, purchaser: PublicKey, token_mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('futures_contract_purchase'), futuresContract.toBytes(), purchaser.toBytes(), token_mint.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
}

export const findPurchasedFuturesListingPDA = async (futuresContractPurchase: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('purchased_futures_listing'), futuresContractPurchase.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
}

export const findSettlementContractPDA = async (futuresContract: PublicKey, futuresContractPurchase: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('settlement_contract'), futuresContract.toBytes(), futuresContractPurchase.toBytes()],
        DERIVATIVE_DEX_PROG_ID
    );
}
