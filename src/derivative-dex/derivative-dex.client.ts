import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AccountInfo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountUtils, isKp, stringifyPKsAndBNs } from '../prog-common';
import { DerivativeDex } from '../types/derivative_dex';
import {
    findDerivativeDexAuthorityPDA,
    findDerivativeDexTreasuryPDA,
    findFuturesContractPDA,
    findFuturesContractPurchasePDA,
    findPurchasedFuturesListingPDA,
    findSettlementContractPDA,
    findTokenAccountPDA
} from './derivative-dex.pda'

export interface TokenSwapRatios {
    acceptedTradeToken: PublicKey;
    listingTokenRatioAmount: BN;
    tradeTokenRatioAmount: BN;
}

export class DerivativeDexClient extends AccountUtils {
    wallet: anchor.Wallet;
    provider!: anchor.Provider;
    derivativeDexProgram!: anchor.Program<DerivativeDex>;

    constructor(
        conn: Connection,
        wallet: anchor.Wallet,
        idl?: Idl,
        programId?: PublicKey
    ) {
        super(conn);
        this.wallet = wallet;
        this.setProvider();
        this.setDerivativeDexProgram(idl, programId);
    }

    setProvider() {
        this.provider = new AnchorProvider(
            this.conn,
            this.wallet,
            AnchorProvider.defaultOptions()
        );
        anchor.setProvider(this.provider);
    }

    setDerivativeDexProgram(idl?: Idl, programId?: PublicKey) {
        //instantiating program depends on the environment
        if (idl && programId) {
            //means running in prod
            this.derivativeDexProgram = new anchor.Program<DerivativeDex>(
                idl as any,
                programId,
                this.provider
            );
        } else {
            //means running inside test suite
            this.derivativeDexProgram = anchor.workspace.BountyPool as Program<DerivativeDex>;
        }
    }

    // -------------------------------------------------------- fetch deserialized accounts

    async fetchDerivativeDexAccount(derivativeDex: PublicKey) {
        return this.derivativeDexProgram.account.derivativeDex.fetch(derivativeDex);
    }

    async fetchFuturesContractAccount(futuresContract: PublicKey) {
        return this.derivativeDexProgram.account.futuresContract.fetch(futuresContract);
    }

    async fetchFuturesContractPurchaseAccount(futuresContractPurchase: PublicKey) {
        return this.derivativeDexProgram.account.futuresContractPurchase.fetch(futuresContractPurchase);
    }

    async fetchPurchasedFuturesContractListingAccount(purchasedFuturesListing: PublicKey) {
        return this.derivativeDexProgram.account.purchasedFuturesListing.fetch(purchasedFuturesListing);
    }

    async fetchSettlementContractAccount(settlementContract: PublicKey) {
        return this.derivativeDexProgram.account.settlementContract.fetch(settlementContract);
    }

    async fetchTokenAccount(mint: PublicKey, tokenAcc: PublicKey): Promise<AccountInfo> {
        return this.deserializeTokenAccount(mint, tokenAcc);
    }

    async fetchTreasuryBalance(derivativeDex: PublicKey) {
        const [treasury] = await findDerivativeDexTreasuryPDA(derivativeDex);
        return this.getBalance(treasury);
    }

    // -------------------------------------------------------- get all PDAs by type
    //https://project-serum.github.io/anchor/ts/classes/accountclient.html#all

    async fetchAllDerivativeDexPDAs(derivativeDexManager?: PublicKey) {
        const filter = derivativeDexManager
            ? [
                {
                    memcmp: {
                        offset: 10, //need to prepend 8 bytes for anchor's disc and 2 for version: u16
                        bytes: derivativeDexManager.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.derivativeDex.all(filter);
        console.log('Found a total of', pdas.length, 'derivative dex PDAs');
        return pdas;
    }

    async fetchAllFuturesContractPDAs(derivativeDex: PublicKey) {
        const filter = derivativeDex
            ? [
                {
                    memcmp: {
                        offset: 8, //need to prepend 8 bytes for anchor's disc
                        bytes: derivativeDex.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.futuresContract.all(filter);
        console.log('Found a total of', pdas.length, 'futures contract PDAs for derivative dex with pubkey', derivativeDex.toBase58());
        return pdas;
    }

    async fetchAllFuturesContractPDAsByCreator(creator: PublicKey) {
        const filter = creator
            ? [
                {
                    memcmp: {
                        offset: 40, //need to prepend 8 bytes for anchor's disc and 32 for pubkey
                        bytes: creator.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.futuresContract.all(filter);
        console.log('Found a total of', pdas.length, 'futures contract PDAs for creator with pubkey', creator.toBase58());
        return pdas;
    }

    async fetchAllFuturesContractPurchasePDAsByContract(futuresContract?: PublicKey) {
        const filter = futuresContract
            ? [
                {
                    memcmp: {
                        offset: 8, //need to prepend 8 bytes for anchor's disc
                        bytes: futuresContract.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.futuresContractPurchase.all(filter);
        console.log('Found a total of', pdas.length, 'futures contract purchase PDAs');
        return pdas;
    }

    async fetchAllFuturesContractPurchasePDAsByPurchaser(futuresPurchaser: PublicKey) {
        const filter = futuresPurchaser
            ? [
                {
                    memcmp: {
                        offset: 40, //need to prepend 8 bytes for anchor's disc and 32 for pubkey
                        bytes: futuresPurchaser.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.futuresContractPurchase.all(filter);
        console.log('Found a total of', pdas.length, 'futures contract purchase PDAs for purchaser with pubkey', futuresPurchaser.toBase58());
        return pdas;
    }

    async fetchAllFuturesContractPurchaseListingPDAs() {
        const pdas = await this.derivativeDexProgram.account.purchasedFuturesListing.all();
        console.log('Found a total of', pdas.length, 'futures contract purchase listing PDAs');
        return pdas;
    }

    async fetchFuturesContractPurchaseListingPDAByPurchase(futuresContractPurchase: PublicKey) {
        const filter = futuresContractPurchase
            ? [
                {
                    memcmp: {
                        offset: 8, //need to prepend 8 bytes for anchor's disc
                        bytes: futuresContractPurchase.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.purchasedFuturesListing.all(filter);
        return pdas;
    }

    async fetchAllSettlementContractPDAs(futuresContract?: PublicKey) {
        const filter = futuresContract
            ? [
                {
                    memcmp: {
                        offset: 8, //need to prepend 8 bytes for anchor's disc
                        bytes: futuresContract.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.settlementContract.all(filter);
        console.log('Found a total of', pdas.length, 'settlement contract PDAs');
        return pdas;
    }

    async fetchSettlementContractPDAByPurchase(futuresContractPurchase: PublicKey) {
        const filter = futuresContractPurchase
            ? [
                {
                    memcmp: {
                        offset: 40, //need to prepend 8 bytes for anchor's disc and 32 for pubkey
                        bytes: futuresContractPurchase.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.derivativeDexProgram.account.settlementContract.all(filter);
        return pdas;
    }

    // -------------------------------------------------------- execute ixs

    async initDerivativeDex(
        derivativeDex: Keypair,
        derivativeDexManager: PublicKey | Keypair,
        tradingFee: BN,
    ) {
        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex.publicKey);
        const [derivativeDexTreasury, dexTreasuryBump] = await findDerivativeDexTreasuryPDA(derivativeDex.publicKey);

        // Create Signers Array
        const signers = [derivativeDex];
        if (isKp(derivativeDexManager)) signers.push(<Keypair>derivativeDexManager);

        console.log('initializing derivative dex account with pubkey: ', derivativeDex.publicKey.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .initDerivativeDex(
                dexAuthBump,
                tradingFee,
            )
            .accounts({
                derivativeDex: derivativeDex.publicKey,
                derivativeDexManager: isKp(derivativeDexManager)? (<Keypair>derivativeDexManager).publicKey : <PublicKey>derivativeDexManager,
                derivativeDexAuthority: derivativeDexAuthority,
                derivativeDexTreasury: derivativeDexTreasury,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            derivativeDexTreasury,
            dexTreasuryBump,
            txSig
        }
    }

    async updateTradingFee(
        derivativeDex: PublicKey,
        derivativeDexManager: PublicKey | Keypair,
        newDerivativeDexTradingFee: BN,
    ) {
        // Create Signers Array
        const signers = [];
        if (isKp(derivativeDexManager)) signers.push(<Keypair>derivativeDexManager);

        console.log('updating derivative dex trading fee to: ', stringifyPKsAndBNs(newDerivativeDexTradingFee));

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .updateTradingFee(
                newDerivativeDexTradingFee
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexManager: isKp(derivativeDexManager)? (<Keypair>derivativeDexManager).publicKey : <PublicKey>derivativeDexManager,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            txSig
        }
    }

    async payoutFromTreasury(
        derivativeDex: PublicKey,
        derivativeDexManager: PublicKey | Keypair,
        receiver: PublicKey,
        minimumBalanceForRentExemption: BN
    ) {
        // Derive PDAs
        const [derivativeDexTreasury, dexTreasuryBump] = await findDerivativeDexTreasuryPDA(derivativeDex);

        // Create Signers Array
        const signers = [];
        if (isKp(derivativeDexManager)) signers.push(<Keypair>derivativeDexManager);

        console.log('paying out from treasury for derivative dex: ', derivativeDex.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .payoutFromTreasury(
                dexTreasuryBump,
                minimumBalanceForRentExemption,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexManager: isKp(derivativeDexManager)? (<Keypair>derivativeDexManager).publicKey : <PublicKey>derivativeDexManager,
                derivativeDexTreasury: derivativeDexTreasury,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexTreasury,
            dexTreasuryBump,
            txSig
        }
    }

    async closeDefunctListing(
        derivativeDex: PublicKey,
        derivativeDexManager: PublicKey | Keypair,
        purchasedFuturesListing: PublicKey,
    ) {
        // Derive PDAs
        const [derivativeDexTreasury, dexTreasuryBump] = await findDerivativeDexTreasuryPDA(derivativeDex);

        // Create Signers Array
        const signers = [];
        if (isKp(derivativeDexManager)) signers.push(<Keypair>derivativeDexManager);

        console.log('closing defunct listing account with pubkey: ', );

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .closeDefunctListing(
                dexTreasuryBump
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexManager: isKp(derivativeDexManager)? (<Keypair>derivativeDexManager).publicKey : <PublicKey>derivativeDexManager,
                derivativeDexTreasury: derivativeDexTreasury,
                purchasedFuturesListing: purchasedFuturesListing,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexTreasury,
            dexTreasuryBump,
            txSig
        }
    }

    async closeDerivativeDex(
        derivativeDex: PublicKey,
        derivativeDexManager: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [derivativeDexTreasury, dexTreasuryBump] = await findDerivativeDexTreasuryPDA(derivativeDex);

        // Create Signers Array
        const signers = [];
        if (isKp(derivativeDexManager)) signers.push(<Keypair>derivativeDexManager);

        console.log('closing derivative dex account with pubkey: ', derivativeDex.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .closeDerivativeDex(
                dexTreasuryBump
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexManager: isKp(derivativeDexManager)? (<Keypair>derivativeDexManager).publicKey : <PublicKey>derivativeDexManager,
                derivativeDexTreasury: derivativeDexTreasury,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexTreasury,
            dexTreasuryBump,
            txSig
        }
    }

    async createFuturesContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey | Keypair,
        futureSeed: PublicKey,
        futureTokenMint: PublicKey,
        futureSourceTokenAccount: PublicKey,
        tokenSwapRatiosVec: TokenSwapRatios[],
        listingAmount: BN,
        contractExpiresTs: BN,
    ) {
        const futuresCreatorKey = isKp(futureCreator) ? (<Keypair>futureCreator).publicKey : <PublicKey>futureCreator;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futuresCreatorKey, futureSeed);
        const [futureTokenAccount, futureTokenAccountBump] = await findTokenAccountPDA(futureTokenMint, futuresCreatorKey, futuresContract);

        // Create Signers Array
        const signers = [];
        if (isKp(futureCreator)) signers.push(<Keypair>futureCreator);

        console.log('creating futures contract account with pubkey: ', futuresContract.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .createFuturesContract(
                dexAuthBump,
                tokenSwapRatiosVec,
                listingAmount,
                contractExpiresTs
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: isKp(futureCreator) ? (<Keypair>futureCreator).publicKey : <PublicKey>futureCreator,
                futureSeed: futureSeed,
                futureTokenAccount: futureTokenAccount,
                futureTokenMint: futureTokenMint,
                futureSourceTokenAccount: futureSourceTokenAccount,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futureTokenAccount,
            futureTokenAccountBump,
            txSig
        }
    }

    async supplementFuturesContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey | Keypair,
        futureSeed: PublicKey,
        futureTokenMint: PublicKey,
        futureSourceTokenAccount: PublicKey,
        supplementalListingAmount: BN,
    ) {
        const futuresCreatorKey = isKp(futureCreator) ? (<Keypair>futureCreator).publicKey : <PublicKey>futureCreator;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futuresCreatorKey, futureSeed);
        const [futureTokenAccount, futureTokenAccountBump] = await findTokenAccountPDA(futureTokenMint, futuresCreatorKey, futuresContract);

        // Create Signers Array
        const signers = [];
        if (isKp(futureCreator)) signers.push(<Keypair>futureCreator);

        console.log('supplementing futures contract account with address ', futuresContract.toBase58(), 'for ', stringifyPKsAndBNs(supplementalListingAmount));

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .supplementFuturesContract(
                dexAuthBump,
                futuresContractBump,
                supplementalListingAmount
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: isKp(futureCreator)? (<Keypair>futureCreator).publicKey : <PublicKey>futureCreator,
                futureSeed: futureSeed,
                futureTokenAccount: futureTokenAccount,
                futureTokenMint: futureTokenMint,
                futureSourceTokenAccount: futureSourceTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futureTokenAccount,
            futureTokenAccountBump,
            txSig
        }
    }

    async withdrawUnsoldFuturesTokens(
        derivativeDex: PublicKey,
        futureCreator: PublicKey | Keypair,
        futureSeed: PublicKey,
        futureTokenMint: PublicKey,
        futureDestinationTokenAccount: PublicKey,
        receiver: PublicKey,
    ) {
        const futuresCreatorKey = isKp(futureCreator) ? (<Keypair>futureCreator).publicKey : <PublicKey>futureCreator;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futuresCreatorKey, futureSeed);
        const [futureTokenAccount, futureTokenAccountBump] = await findTokenAccountPDA(futureTokenMint, futuresCreatorKey, futuresContract);

        // Create Signers Array
        const signers = [];
        if (isKp(futureCreator)) signers.push(<Keypair>futureCreator);

        console.log('withdrawing unsold tokens from futures contract account with address: ', futuresContract.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .withdrawUnsoldFuturesTokens(
                dexAuthBump,
                futuresContractBump
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: isKp(futureCreator)? (<Keypair>futureCreator).publicKey : <PublicKey>futureCreator,
                futureSeed: futureSeed,
                futureTokenAccount: futureTokenAccount,
                futureTokenMint: futureTokenMint,
                futureDestinationTokenAccount: futureDestinationTokenAccount,
                receiver: receiver,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futureTokenAccount,
            futureTokenAccountBump,
            txSig
        }
    }

    async purchaseFuturesContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey | Keypair,
        futurePaymentTokenMint: PublicKey,
        futurePaymentSourceTokenAccount: PublicKey,
        purchaseAmount: BN
    ) {
        const futurePurchaserKey = isKp(futurePurchaser) ? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaserKey, futurePaymentTokenMint);
        const [futurePaymentTokenAccount, futurePaymentTokenAccountBump] = await findTokenAccountPDA(futurePaymentTokenMint, futurePurchaserKey, futuresContract);

        // Create Signers Array
        const signers = [];
        if (isKp(futurePurchaser)) signers.push(<Keypair>futurePurchaser);

        console.log('purchasing futures contract account with address: ', futuresContract.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .purchaseFuturesContract(
                dexAuthBump,
                futuresContractBump,
                purchaseAmount,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futurePurchaser: isKp(futurePurchaser)? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser,
                futuresContractPurchase: futuresContractPurchase,
                futurePaymentTokenAccount: futurePaymentTokenAccount,
                futurePaymentTokenMint: futurePaymentTokenMint,
                futurePaymentSourceTokenAccount: futurePaymentSourceTokenAccount,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            futurePaymentTokenAccount,
            futurePaymentTokenAccountBump,
            txSig
        }
    }

    async listPurchasedFuturesContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey | Keypair,
        futurePaymentTokenMint: PublicKey,
        futureTokenSwapRatiosVec: TokenSwapRatios[],
        listingAmount: BN,
        listingExpiresTs: BN,
    ) {
        const futurePurchaserKey = isKp(futurePurchaser) ? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaserKey, futurePaymentTokenMint);
        const [purchasedFuturesListing, purchasedFuturesListingBump] = await findPurchasedFuturesListingPDA(futuresContractPurchase);

        // Create Signers Array
        const signers = [];
        if (isKp(futurePurchaser)) signers.push(<Keypair>futurePurchaser);

        console.log('listing purchased futures contract account with address: ', futuresContractPurchase.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .listPurchasedFuturesContract(
                dexAuthBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                futureTokenSwapRatiosVec,
                listingAmount,
                listingExpiresTs,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: isKp(futurePurchaser)? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                purchasedFuturesListing: purchasedFuturesListing,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            purchasedFuturesListing,
            purchasedFuturesListingBump,
            txSig
        }
    }

    async supplementPurchasedFuturesContractListing(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey | Keypair,
        futurePaymentTokenMint: PublicKey,
        supplementalListingAmount: BN
    ) {
        const futurePurchaserKey = isKp(futurePurchaser) ? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaserKey, futurePaymentTokenMint);
        const [purchasedFuturesListing, purchasedFuturesListingBump] = await findPurchasedFuturesListingPDA(futuresContractPurchase);

        // Create Signers Array
        const signers = [];
        if (isKp(futurePurchaser)) signers.push(<Keypair>futurePurchaser);

        console.log('supplementing purchased futures contract listing account with address:',
                    futuresContractPurchase.toBase58(), 'for', stringifyPKsAndBNs(supplementalListingAmount));

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .supplementPurchasedFuturesListing(
                dexAuthBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                purchasedFuturesListingBump,
                supplementalListingAmount,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: isKp(futurePurchaser)? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                purchasedFuturesListing: purchasedFuturesListing,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            purchasedFuturesListing,
            purchasedFuturesListingBump,
            txSig
        }
    }

    async closePurchasedFuturesContractListing(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey | Keypair,
        futurePaymentTokenMint: PublicKey,
        receiver: PublicKey,
    ) {
        const futurePurchaserKey = isKp(futurePurchaser) ? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaserKey, futurePaymentTokenMint);
        const [purchasedFuturesListing, purchasedFuturesListingBump] = await findPurchasedFuturesListingPDA(futuresContractPurchase);

        // Create Signers Array
        const signers = [];
        if (isKp(futurePurchaser)) signers.push(<Keypair>futurePurchaser);

        console.log('closing purchased futures contract listing account with address: ', futuresContractPurchase.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .closePurchasedFuturesListing(
                dexAuthBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                purchasedFuturesListingBump,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: isKp(futurePurchaser)? (<Keypair>futurePurchaser).publicKey : <PublicKey>futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                purchasedFuturesListing: purchasedFuturesListing,
                receiver: receiver,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            purchasedFuturesListing,
            purchasedFuturesListingBump,
            txSig
        }
    }

    async purchasePurchasedFuturesContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey,
        futurePaymentTokenMint: PublicKey,
        listingPurchaser: PublicKey | Keypair,
        listingTokenMint: PublicKey,
        listingPurchaserTokenAccountSource: PublicKey,
        futurePurchaserTokenAccountDestination: PublicKey,
        listingPurchaseAmount: BN,
    ) {
        const listingPurchaserKey = isKp(listingPurchaser) ? (<Keypair>listingPurchaser).publicKey : <PublicKey>listingPurchaser;

        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaser, futurePaymentTokenMint);
        const [futurePaymentTokenAccount, futurePaymentTokenAccountBump] = await findTokenAccountPDA(futurePaymentTokenMint, futurePurchaser, futuresContract);
        const [listingPurchaserFuturePaymentTokenAccount, listingPurchaserFuturePaymentTokenAccountBump] = await findTokenAccountPDA(futurePaymentTokenMint, listingPurchaserKey, futuresContract);
        const [purchasedFuturesListing, purchasedFuturesListingBump] = await findPurchasedFuturesListingPDA(futuresContractPurchase);
        const [listingPurchaserFuturesContractPurchase, listingPurchaserFuturesContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, listingPurchaserKey, futurePaymentTokenMint);

        // Create Signers Array
        const signers = [];
        if (isKp(listingPurchaser)) signers.push(<Keypair>listingPurchaser);

        console.log('purchasing purchased futures contract listing account with address: ', futuresContractPurchase.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .purchasePurchasedFuturesContract(
                dexAuthBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                futurePaymentTokenAccountBump,
                purchasedFuturesListingBump,
                listingPurchaseAmount,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                futurePaymentTokenAccount: futurePaymentTokenAccount,
                listingPurchaserFuturePaymentTokenAccount: listingPurchaserFuturePaymentTokenAccount,
                purchasedFuturesListing: purchasedFuturesListing,
                listingPurchaser: isKp(listingPurchaser)? (<Keypair>listingPurchaser).publicKey : <PublicKey>listingPurchaser,
                listingTokenMint: listingTokenMint,
                listingPurchaserTokenAccountSource: listingPurchaserTokenAccountSource,
                futurePurchaserTokenAccountDestination: futurePurchaserTokenAccountDestination,
                listingPurchaserFuturesContractPurchase: listingPurchaserFuturesContractPurchase,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            futurePaymentTokenAccount,
            futurePaymentTokenAccountBump,
            listingPurchaserFuturePaymentTokenAccount,
            listingPurchaserFuturePaymentTokenAccountBump,
            purchasedFuturesListing,
            purchasedFuturesListingBump,
            listingPurchaserFuturesContractPurchase,
            listingPurchaserFuturesContractPurchaseBump,
            txSig
        }
    }

    async createSettlementContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey,
        futurePaymentTokenMint: PublicKey,
        signer: PublicKey | Keypair,
        purchasedTokenAmount: BN,
        paymentTokenAmount: BN,
    ) {
        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaser, futurePaymentTokenMint);
        const [settlementContract, settlementContractBump] = await findSettlementContractPDA(futuresContract, futuresContractPurchase);

        // Create Signers Array
        const signers = [];
        if (isKp(signer)) signers.push(<Keypair>signer);

        console.log('creating settlement contract account with address: ', settlementContract.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .createSettlementContract(
                dexAuthBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                purchasedTokenAmount,
                paymentTokenAmount
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                settlementContract: settlementContract,
                signer: isKp(signer)? (<Keypair>signer).publicKey : <PublicKey>signer,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            settlementContract,
            settlementContractBump,
            txSig
        }
    }

    async withdrawSettlementContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey,
        futurePaymentTokenMint: PublicKey,
        signer: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaser, futurePaymentTokenMint);
        const [settlementContract, settlementContractBump] = await findSettlementContractPDA(futuresContract, futuresContractPurchase);

        // Create Signers Array
        const signers = [];
        if (isKp(signer)) signers.push(<Keypair>signer);

        console.log('withdrawing offer for settlement contract account with address: ', settlementContract.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .withdrawSettlementContract(
                dexAuthBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                settlementContractBump
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                settlementContract: settlementContract,
                signer: isKp(signer)? (<Keypair>signer).publicKey : <PublicKey>signer,
                receiver: receiver,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            settlementContract,
            settlementContractBump,
            txSig
        }
    }

    async acceptSettlementContract(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey,
        futurePaymentTokenMint: PublicKey,
        futurePaymentTokenAccountPurchaser: PublicKey,
        futurePaymentTokenAccountCreator: PublicKey,
        futureTokenMint: PublicKey,
        futureTokenAccountCreator: PublicKey,
        futureTokenAccountPurchaser: PublicKey,
        signer: PublicKey | Keypair,
    ) {
        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [derivativeDexTreasury, dexTreasuryBump] = await findDerivativeDexTreasuryPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaser, futurePaymentTokenMint);
        const [futurePaymentTokenAccount, futurePaymentTokenAccountBump] = await findTokenAccountPDA(futurePaymentTokenMint, futurePurchaser, futuresContract);
        const [futureTokenAccount, futureTokenAccountBump] = await findTokenAccountPDA(futureTokenMint, futureCreator, futuresContract);
        const [settlementContract, settlementContractBump] = await findSettlementContractPDA(futuresContract, futuresContractPurchase);

        // Create Signers Array
        const signers = [];
        if (isKp(signer)) signers.push(<Keypair>signer);

        console.log('accepting settlement contract account with address: ', settlementContract.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .acceptSettlementContract(
                dexAuthBump,
                dexTreasuryBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                futurePaymentTokenAccountBump,
                futureTokenAccountBump,
                settlementContractBump
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                derivativeDexTreasury: derivativeDexTreasury,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                futurePaymentTokenAccount: futurePaymentTokenAccount,
                futurePaymentTokenAccountPurchaser: futurePaymentTokenAccountPurchaser,
                futurePaymentTokenAccountCreator: futurePaymentTokenAccountCreator,
                futureTokenMint: futureTokenMint,
                futureTokenAccount: futureTokenAccount,
                futureTokenAccountCreator: futureTokenAccountCreator,
                futureTokenAccountPurchaser: futureTokenAccountPurchaser,
                settlementContract: settlementContract,
                signer: isKp(signer)? (<Keypair>signer).publicKey : <PublicKey>signer,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            derivativeDexTreasury,
            dexTreasuryBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            futurePaymentTokenAccount,
            futurePaymentTokenAccountBump,
            futureTokenAccount,
            futureTokenAccountBump,
            settlementContract,
            settlementContractBump,
            txSig
        }
    }

    async settleFuturesContractPurchase(
        derivativeDex: PublicKey,
        futureCreator: PublicKey,
        futureSeed: PublicKey,
        futurePurchaser: PublicKey,
        futurePaymentTokenMint: PublicKey,
        futurePaymentTokenAccountCreator: PublicKey,
        futureTokenMint: PublicKey,
        futureTokenAccountPurchaser: PublicKey,
        signer: PublicKey | Keypair,
    ) {
        // Derive PDAs
        const [derivativeDexAuthority, dexAuthBump] = await findDerivativeDexAuthorityPDA(derivativeDex);
        const [derivativeDexTreasury, dexTreasuryBump] = await findDerivativeDexTreasuryPDA(derivativeDex);
        const [futuresContract, futuresContractBump] = await findFuturesContractPDA(derivativeDex, futureCreator, futureSeed);
        const [futuresContractPurchase, futuresContractPurchaseBump] = await findFuturesContractPurchasePDA(futuresContract, futurePurchaser, futurePaymentTokenMint);
        const [futurePaymentTokenAccount, futurePaymentTokenAccountBump] = await findTokenAccountPDA(futurePaymentTokenMint, futurePurchaser, futuresContract);
        const [futureTokenAccount, futureTokenAccountBump] = await findTokenAccountPDA(futureTokenMint, futureCreator, futuresContract);

        // Create Signers Array
        const signers = [];
        if (isKp(signer)) signers.push(<Keypair>signer);

        console.log('settling futures contract purchase with account address: ', futuresContractPurchase.toBase58());

        // Transaction
        const txSig = await this.derivativeDexProgram.methods
            .settleFuturesContractPurchase(
                dexAuthBump,
                dexTreasuryBump,
                futuresContractBump,
                futuresContractPurchaseBump,
                futurePaymentTokenAccountBump,
                futureTokenAccountBump,
            )
            .accounts({
                derivativeDex: derivativeDex,
                derivativeDexAuthority: derivativeDexAuthority,
                derivativeDexTreasury: derivativeDexTreasury,
                futuresContract: futuresContract,
                futureCreator: futureCreator,
                futureSeed: futureSeed,
                futuresContractPurchase: futuresContractPurchase,
                futurePurchaser: futurePurchaser,
                futurePaymentTokenMint: futurePaymentTokenMint,
                futurePaymentTokenAccount: futurePaymentTokenAccount,
                futurePaymentTokenAccountCreator: futurePaymentTokenAccountCreator,
                futureTokenMint: futureTokenMint,
                futureTokenAccount: futureTokenAccount,
                futureTokenAccountPurchaser: futureTokenAccountPurchaser,
                signer: isKp(signer)? (<Keypair>signer).publicKey : <PublicKey>signer,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            derivativeDexAuthority,
            dexAuthBump,
            derivativeDexTreasury,
            dexTreasuryBump,
            futuresContract,
            futuresContractBump,
            futuresContractPurchase,
            futuresContractPurchaseBump,
            futurePaymentTokenAccount,
            futurePaymentTokenAccountBump,
            futureTokenAccount,
            futureTokenAccountBump,
            txSig
        }
    }
}
