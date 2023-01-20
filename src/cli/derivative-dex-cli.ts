import { DerivativeDexClient, findDerivativeDexAuthorityPDA, TokenSwapRatios } from '../derivative-dex';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as SPLToken from "@solana/spl-token";
import { default as fs } from 'fs/promises';
import { default as yargs } from 'yargs';
import * as anchor from '@coral-xyz/anchor';
import { IDL as DerivativeDexIDL } from '../types/derivative_dex';
import { DERIVATIVE_DEX_PROG_ID } from '../index';
import { stringifyPKsAndBNs } from '../prog-common';

// import {
//     findFuturesContractPDA
// } from "../derivative-dex/derivative-dex.pda"

import { networkConfig } from "../cli/config_devnet/networkConfig-devnet";
import { futuresCreatorConfig } from "../cli/config_devnet/futuresCreatorConfig-devnet";
import { futuresPurchaserConfig } from "../cli/config_devnet/futuresPurchaserConfig-devnet";
import { listPurchasedFuturesConfig } from "../cli/config_devnet/listPurchasedFuturesConfig-devnet";
import { purchasePurchasedFuturesConfig } from "../cli/config_devnet/purchasePurchasedFuturesContractConfig-devnet";
import { settlementContractConfig } from "../cli/config_devnet/settlementContractConfig-devnet";

// ----------------------------------------------- Legend ---------------------------------------------------------

// -a contribution amount (amount)
// -c futures contract account address (contract)
// -d destination (token) account address (destination)
// -f derivative dex trading fee (fee)
// -k pubkey of account being fetched (key)
// -l futures contract purchase listing account address (listing)
// -m derivative dex manager account address (manager)
// -o settlement contract account address (offer)
// -p futures contract purchase account address (purchase)
// -r receiver account address (receiver)
// -s token account address (spl-token)
// -t mint address (minT)
// -u unix timestamp (unix)
// -x derivative dex account address (deX)
// -z dryRun



const parser = yargs(process.argv.slice(2)).options({
    dryRun: {
        alias: 'z',
        type: 'boolean',
        default: false,
        description: 'set Dry Run flag'
    },
})



// --------------------------------------------- derivative_dex manager instructions ---------------------------------------------



// Initialize derivative dex account (payer = derivative dex manager)
    .command('init-dex', 'Initialize a derivative dex account', {
        dexTradingFee: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'the derivative dex trading fee'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDex = Keypair.generate();
                 const derivativeDexTradingFee: anchor.BN = new anchor.BN(argv.dexTradingFee);

                 if (!argv.dryRun) {
                     const derivativeDexInstance = await derivativeDexClient.initDerivativeDex(
                         derivativeDex,
                         wallet.payer,
                         derivativeDexTradingFee
                     );
                     console.log(stringifyPKsAndBNs(derivativeDexInstance));
                 } else {
                     console.log('Initializing derivative dex account with derivative dex trading fee',
                                 stringifyPKsAndBNs(derivativeDexTradingFee));
                 }
             })



// Update derivative dex trading fee
    .command('update-trading-fee', 'Update derivative dex trading fee', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        },
        newDexTradingFee: {
            alias: 'f',
            type: 'string',
            demandOption: true,
            description: 'new derivative dex trading fee'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDex = new PublicKey(argv.derivativeDexPubkey);
                 const newDexTradingFee: anchor.BN = new anchor.BN(argv.newDexTradingFee);

                 if (!argv.dryRun) {
                     const updateTradingFeeInstance = await derivativeDexClient.updateTradingFee(
                         derivativeDex,
                         wallet.payer,
                         newDexTradingFee
                     );
                     console.log(stringifyPKsAndBNs(updateTradingFeeInstance));
                 } else {
                     console.log('Updating trading fee of derivative dex account with pubkey', derivativeDex.toBase58(),
                                 'to: ', stringifyPKsAndBNs(newDexTradingFee));
                 }
             })



// Payout from treasury
    .command('payout-from-treasury', 'Payout from treasury', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const rentBytes: number = 16;

                 const derivativeDexKey = new PublicKey(argv.derivativeDexPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey? new PublicKey(argv.receiverPubkey) : wallet.publicKey;
                 const minimumBalanceForRentExemption: anchor.BN = new anchor.BN(await rpcConn.getMinimumBalanceForRentExemption(rentBytes));

                 console.log('Minimum balance for rent exemption for a data size of', rentBytes,
                             'bytes is: ', stringifyPKsAndBNs(minimumBalanceForRentExemption));

                 if (!argv.dryRun) {
                     const payoutInstance = await derivativeDexClient.payoutFromTreasury(
                         derivativeDexKey,
                         wallet.payer,
                         receiverKey,
                         minimumBalanceForRentExemption
                     );
                     console.log(stringifyPKsAndBNs(payoutInstance));
                 } else {
                     console.log('Paying out from treasury of derivative dex account with pubkey', derivativeDexKey.toBase58());
                 }
             })



// Close defunct listing
    .command('close-defunct-listing', 'Close a defunct purchased futures contract listing account', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        },
        listingPubkey: {
            alias: 'l',
            type: 'string',
            demandOption: true,
            description: 'purchased futures contract listing account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDexKey: PublicKey = new PublicKey(argv.derivativeDexPubkey);
                 const listingKey: PublicKey = new PublicKey(argv.listingPubkey);

                 if (!argv.dryRun) {
                     const closeDefunctListingInstance = await derivativeDexClient.closeDefunctListing(
                         derivativeDexKey,
                         wallet.payer,
                         listingKey,
                     );
                     console.log(stringifyPKsAndBNs(closeDefunctListingInstance));
                 } else {
                     console.log('Closing defunct purchased futures contract listing account with pubkey:', derivativeDexKey.toBase58());
                 }
             })



// Close derivative dex
    .command('close-dex', 'Close a derivative dex account', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDexKey: PublicKey = new PublicKey(argv.derivativeDexPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const closeDerivativeDexInstance = await derivativeDexClient.closeDerivativeDex(
                         derivativeDexKey,
                         wallet.payer,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(closeDerivativeDexInstance));
                 } else {
                     console.log('Closing derivative dex account with pubkey:', derivativeDexKey.toBase58());
                 }
             })



// ---------------------------------------------- futures contract creator instructions ------------------------------------------



// Create futures contract
// Must config futures contract state account parameters in futuresCreatorConfig-devnet.ts
    .command('create-future', 'Create a futures contract state account', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDexKey: PublicKey = futuresCreatorConfig.derivativeDex;
                 const seedKey: PublicKey = futuresCreatorConfig.seed;

                 const tokenMintKey: PublicKey = futuresCreatorConfig.tokenMint;
                 const sourceTokenAccount: PublicKey = futuresCreatorConfig.sourceTokenAccount;

                 const tokenSwapRatiosVec: TokenSwapRatios[] = futuresCreatorConfig.tokenSwapRatiosVec;
                 const listingAmount: anchor.BN = futuresCreatorConfig.listingAmount;
                 const contractExpiresTs: anchor.BN = futuresCreatorConfig.contractExpiresTs;

                 if (!argv.dryRun) {
                     const createFuturesContractInstance = await derivativeDexClient.createFuturesContract(
                         derivativeDexKey,
                         wallet.payer,
                         seedKey,
                         tokenMintKey,
                         sourceTokenAccount,
                         tokenSwapRatiosVec,
                         listingAmount,
                         contractExpiresTs
                     );
                     console.log(stringifyPKsAndBNs(createFuturesContractInstance));
                 } else {

                     console.log('Creating futures contract account with config parameters \n',
                                 JSON.stringify(stringifyPKsAndBNs(futuresCreatorConfig), null, 4));
                 }
             })



// Supplement Futures Contract
// Must provide all arguments or config futures contract state account parameters in futuresCreatorConfig-devnet.ts
    .command('supplement-future', 'Supplement a futures contract state account', {
        futuresContractPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'futures contract account pubkey'
        },
        sourceTokenAccount: {
            alias: 's',
            type: 'string',
            demandOption: false,
            description: 'source token account pubkey'
        },
        supplementalListingAmount: {
            alias: 'a',
            type: 'string',
            demandOption: false,
            description: 'futures contract supplemental listing amount'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractKey: PublicKey = new PublicKey(argv.futuresContractPubkey);
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;
                 const tokenMintKey: PublicKey = futuresContractAccount.futureTokenMint;

                 const sourceTokenAccount: PublicKey = argv.sourceTokenAccount ? new PublicKey(argv.sourceTokenAccount) : futuresCreatorConfig.sourceTokenAccount;
                 const supplementalListingAmount: anchor.BN = argv.supplementalListingAmount ? new anchor.BN(argv.supplementalListingAmount) : futuresCreatorConfig.listingAmount;

                 if (!argv.dryRun) {
                     const supplementFuturesContractInstance = await derivativeDexClient.supplementFuturesContract(
                         derivativeDexKey,
                         wallet.payer,
                         seedKey,
                         tokenMintKey,
                         sourceTokenAccount,
                         supplementalListingAmount
                     );
                     console.log(stringifyPKsAndBNs(supplementFuturesContractInstance));
                 } else {
                     console.log('Supplementing futures contract account with pubkey:', futuresContractKey.toBase58(), 'for: ',
                                 stringifyPKsAndBNs(supplementalListingAmount));
                 }
             })



// Withdraw Unsold Futures Contract Tokens
// Must provide all arguments or config futures contract state account parameters in futuresCreatorConfig-devnet.ts
    .command('withdraw-unsold-future', 'Withdraw unsold futures contract tokens', {
        futuresContractPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'futures contract account pubkey'
        },
        destinationTokenAccount: {
            alias: 'd',
            type: 'string',
            demandOption: false,
            description: 'destination token account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractKey: PublicKey = new PublicKey(argv.futuresContractPubkey)
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;
                 const tokenMintKey: PublicKey = futuresContractAccount.futureTokenMint;

                 const destinationTokenAccountKey: PublicKey = argv.destinationTokenAccount ? new PublicKey(argv.destinationTokenAccount) : futuresCreatorConfig.sourceTokenAccount;
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const withdrawFuturesContractInstance = await derivativeDexClient.withdrawUnsoldFuturesTokens(
                         derivativeDexKey,
                         wallet.payer,
                         seedKey,
                         tokenMintKey,
                         destinationTokenAccountKey,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(withdrawFuturesContractInstance));
                 } else {
                     console.log('Withdrawing unsold futures contract tokens from futures contract account with pubkey:', futuresContractKey.toBase58());
                 }
             })



// Purchase Futures Contract
// Must config futures contract purchase state account parameters in futuresPurchaserConfig-devnet.ts
    .command('purchase-future', 'Purchase futures contract', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractKey = futuresPurchaserConfig.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const paymentTokenMintKey: PublicKey = futuresPurchaserConfig.paymentTokenMint;
                 const sourcePaymentTokenAccountKey: PublicKey = futuresPurchaserConfig.sourcePaymentTokenAccount;
                 const purchaseAmount: anchor.BN = futuresPurchaserConfig.purchaseAmount;

                 if (!argv.dryRun) {
                     const purchaseFuturesContractInstance = await derivativeDexClient.purchaseFuturesContract(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         wallet.payer,
                         paymentTokenMintKey,
                         sourcePaymentTokenAccountKey,
                         purchaseAmount,
                     );
                     console.log(stringifyPKsAndBNs(purchaseFuturesContractInstance));
                 } else {
                     console.log('Purchasing futures contract with config parameters: \n',
                                 JSON.stringify(stringifyPKsAndBNs(futuresPurchaserConfig), null, 4));
                 }
             })



// ----------------------------------------- purchased futures contract listing instructions -------------------------------------



// List purchased futures contract
// Must config list futures contract purchase state account parameters in listPurchasedFuturesConfig-devnet.ts
    .command('list-purchased-future', 'List purchased futures contract', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseKey = listPurchasedFuturesConfig.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey = futuresContractPurchaseAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const paymentTokenMintKey: PublicKey = futuresContractPurchaseAccount.futurePaymentTokenMint ;

                 const tokenSwapRatiosVec: TokenSwapRatios[] = listPurchasedFuturesConfig.tokenSwapRatiosVec;
                 const listingAmount: anchor.BN = listPurchasedFuturesConfig.listingAmount;
                 const listingExpiresTs: anchor.BN = listPurchasedFuturesConfig.listingExpiresTs;

                 if (!argv.dryRun) {
                     const listPurchasedFuturesContractInstance = await derivativeDexClient.listPurchasedFuturesContract(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         wallet.payer,
                         paymentTokenMintKey,
                         tokenSwapRatiosVec,
                         listingAmount,
                         listingExpiresTs,
                     );
                     console.log(stringifyPKsAndBNs(listPurchasedFuturesContractInstance));
                 } else {
                     console.log('Listing purchased futures contract with config parameters: \n',
                                 JSON.stringify(stringifyPKsAndBNs(listPurchasedFuturesConfig), null, 4));
                 }
             })



// Supplement purchased futures contract listing
// Must config list futures contract purchase state account parameters in listPurchasedFuturesConfig-devnet.ts
    .command('supplement-listing', 'Supplement purchased futures contract listing', {
        listingPubkey: {
            alias: 'l',
            type: 'string',
            demandOption: true,
            description: 'purchased futures contract listing account pubkey'
        },
        supplementalListingAmount: {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'purchased futures contract supplemental listing amount'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const purchasedFuturesContractListingKey: PublicKey = new PublicKey(argv.listingPubkey);
                 const purchasedFuturesContractListingAccount = await derivativeDexClient.fetchPurchasedFuturesContractListingAccount(purchasedFuturesContractListingKey);

                 const futuresContractPurchaseKey: PublicKey = purchasedFuturesContractListingAccount.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey: PublicKey = futuresContractPurchaseAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const paymentTokenMintKey = futuresContractPurchaseAccount.futurePaymentTokenMint;

                 const supplementalListingAmount: anchor.BN = new anchor.BN(argv.supplementalListingAmount);

                 if (!argv.dryRun) {
                     const supplementPurchasedFuturesContractListingInstance = await derivativeDexClient.supplementPurchasedFuturesContractListing(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         wallet.payer,
                         paymentTokenMintKey,
                         supplementalListingAmount,
                     );
                     console.log(stringifyPKsAndBNs(supplementPurchasedFuturesContractListingInstance));
                 } else {
                     console.log('Supplementing purchased futures contract listing for', supplementalListingAmount);
                 }
             })



// Close purchased futures contract listing
// Must config list futures contract purchase state account parameters in listPurchasedFuturesConfig-devnet.ts
    .command('close-listing', 'Close purchased futures contract listing', {
        listingPubkey: {
            alias: 'l',
            type: 'string',
            demandOption: true,
            description: 'purchased futures contract listing account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account for reclaimed rent lamports'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const purchasedFuturesContractListingKey: PublicKey = new PublicKey(argv.listingPubkey);
                 const purchasedFuturesContractListingAccount = await derivativeDexClient.fetchPurchasedFuturesContractListingAccount(purchasedFuturesContractListingKey);

                 const futuresContractPurchaseKey: PublicKey = purchasedFuturesContractListingAccount.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey: PublicKey = futuresContractPurchaseAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const paymentTokenMintKey: PublicKey = futuresContractPurchaseAccount.futurePaymentTokenMint;

                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const closePurchasedFuturesContractListingInstance = await derivativeDexClient.closePurchasedFuturesContractListing(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         wallet.payer,
                         paymentTokenMintKey,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(closePurchasedFuturesContractListingInstance));
                 } else {
                     console.log('Closing purchased futures contract listing with pubkey: ', purchasedFuturesContractListingKey.toBase58());
                 }
             })



// Purchase purchased futures contract
// Must config purchase purchased futures contract state account parameters in purchasePurchasedFuturesConfig-devnet.ts
    .command('purchase-listing', 'Purchase purchased futures contract listing', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const purchasedFuturesContractListingKey: PublicKey = purchasePurchasedFuturesConfig.futuresContractPurchaseListing;
                 const purchasedFuturesContractListingAccount = await derivativeDexClient.fetchPurchasedFuturesContractListingAccount(purchasedFuturesContractListingKey);

                 const futuresContractPurchaseKey: PublicKey = purchasedFuturesContractListingAccount.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey: PublicKey = futuresContractPurchaseAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const futurePurchaser: PublicKey = futuresContractPurchaseAccount.futurePurchaser;
                 const futurePaymentTokenMint: PublicKey = futuresContractPurchaseAccount.futurePaymentTokenMint;

                 const listingTokenMint: PublicKey = purchasePurchasedFuturesConfig.listingTokenMint;
                 const listingPurchaserTokenAccountSource: PublicKey = purchasePurchasedFuturesConfig.listingPurchaserTokenAccountSource;
                 const listingPurchaseAmount: anchor.BN = purchasePurchasedFuturesConfig.listingPurchaseAmount;

                 const futurePurchaserTokenAccountDestination: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     listingTokenMint,
                     futurePurchaser
                 );

                 if (!argv.dryRun) {
                     const purchasePurchasedFuturesContractInstance = await derivativeDexClient.purchasePurchasedFuturesContract(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         futurePurchaser,
                         futurePaymentTokenMint,
                         wallet.payer,
                         listingTokenMint,
                         listingPurchaserTokenAccountSource,
                         futurePurchaserTokenAccountDestination,
                         listingPurchaseAmount
                     );
                     console.log(stringifyPKsAndBNs(purchasePurchasedFuturesContractInstance));
                 } else {
                     console.log('Purchasing purchased futures contract listing with config parameters: \n',
                                 JSON.stringify(stringifyPKsAndBNs(purchasePurchasedFuturesConfig), null, 4));
                 }
             })



// Create settlement contract
// Must config settlement contract state parameters in Config-devnet.ts
    .command('create-settlement', 'Create a settlement contract account PDA', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseKey: PublicKey = settlementContractConfig.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey: PublicKey = futuresContractPurchaseAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const futurePurchaserKey: PublicKey = futuresContractPurchaseAccount.futurePurchaser;
                 const futurePaymentTokenMint: PublicKey = futuresContractPurchaseAccount.futurePaymentTokenMint;

                 const purchaseTokenAmount: anchor.BN = settlementContractConfig.purchaseTokenAmount;
                 const paymentTokenAmount: anchor.BN = settlementContractConfig.paymentTokenAmount;

                 if (!argv.dryRun) {
                     const createSettlementInstance = await derivativeDexClient.createSettlementContract(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         futurePurchaserKey,
                         futurePaymentTokenMint,
                         wallet.payer,
                         purchaseTokenAmount,
                         paymentTokenAmount
                     );
                     console.log(stringifyPKsAndBNs(createSettlementInstance));
                 } else {
                     console.log('Creating settlement contract with config parameters: \n',
                                 JSON.stringify(stringifyPKsAndBNs(settlementContractConfig), null, 4));
                 }
             })



// Withdraw settlement contract
    .command('withdraw-settlement', 'Withdraw a settlement contract account PDA', {
        settlementContract: {
            alias: 'o',
            type: 'string',
            demandOption: true,
            description: 'offered settlement contract account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account pubkey for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const settlementContractKey: PublicKey = new PublicKey(argv.settlementContract);
                 const settlementContractAccount = await derivativeDexClient.fetchSettlementContractAccount(settlementContractKey);

                 const futuresContractPurchaseKey: PublicKey = settlementContractAccount.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey: PublicKey = settlementContractAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;

                 const futurePurchaserKey: PublicKey = futuresContractPurchaseAccount.futurePurchaser;
                 const futurePaymentTokenMint: PublicKey = futuresContractPurchaseAccount.futurePaymentTokenMint;

                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const withdrawSettlementInstance = await derivativeDexClient.withdrawSettlementContract(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         futurePurchaserKey,
                         futurePaymentTokenMint,
                         wallet.payer,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(withdrawSettlementInstance));
                 } else {
                     console.log('Withdrawing settlement contract offer with pubkey: ', settlementContractKey.toBase58());
                 }
             })



// Accept settlement contract
    .command('accept-settlement', 'Accept a settlement contract offer', {
        settlementContract: {
            alias: 'o',
            type: 'string',
            demandOption: true,
            description: 'offered settlement contract account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const settlementContractKey: PublicKey = new PublicKey(argv.settlementContract);
                 const settlementContractAccount = await derivativeDexClient.fetchSettlementContractAccount(settlementContractKey);

                 const futuresContractPurchaseKey: PublicKey = settlementContractAccount.futuresContractPurchase;
                 const futuresContractPurchaseAccount = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey: PublicKey = settlementContractAccount.futuresContract;
                 const futuresContractAccount = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContractAccount.derivativeDex;
                 const creatorKey: PublicKey = futuresContractAccount.futureCreator;
                 const seedKey: PublicKey = futuresContractAccount.futureSeed;
                 const futureTokenMint: PublicKey = futuresContractAccount.futureTokenMint;

                 const futurePurchaserKey: PublicKey = futuresContractPurchaseAccount.futurePurchaser;
                 const futurePaymentTokenMint: PublicKey = futuresContractPurchaseAccount.futurePaymentTokenMint;

                 const futurePaymentTokenAccountPurchaser: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     futurePaymentTokenMint,
                     futurePurchaserKey
                 );

                 const futurePaymentTokenAccountCreator: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     futurePaymentTokenMint,
                     creatorKey
                 );

                 const futureTokenAccountCreator: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     futureTokenMint,
                     creatorKey
                 );

                 const futureTokenAccountPurchaser: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     futureTokenMint,
                     futurePurchaserKey
                 );

                 if (!argv.dryRun) {
                     const acceptSettlementInstance = await derivativeDexClient.acceptSettlementContract(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         futurePurchaserKey,
                         futurePaymentTokenMint,
                         futurePaymentTokenAccountPurchaser,
                         futurePaymentTokenAccountCreator,
                         futureTokenMint,
                         futureTokenAccountCreator,
                         futureTokenAccountPurchaser,
                         wallet.payer
                     );
                     console.log(stringifyPKsAndBNs(acceptSettlementInstance));
                 } else {
                     console.log('Accepting settling contract offer with pubkey: ', settlementContractKey.toBase58());
                 }
             })




// Settle futures contract purchase
    .command('settle-contract', 'Settle a futures contract purchase', {
        futuresContractPurchase: {
            alias: 'p',
            type: 'string',
            demandOption: true,
            description: 'futures contract purchase account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseKey: PublicKey = new PublicKey(argv.futuresContractPurchase);
                 const futuresContractPurchase = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                 const futuresContractKey = futuresContractPurchase.futuresContract;
                 const futuresContract = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                 const derivativeDexKey: PublicKey = futuresContract.derivativeDex;
                 const creatorKey: PublicKey = futuresContract.futureCreator;
                 const seedKey: PublicKey = futuresContract.futureSeed;
                 const futureTokenMint: PublicKey = futuresContract.futureTokenMint;

                 const futurePurchaser: PublicKey = futuresContractPurchase.futurePurchaser;
                 const futurePaymentTokenMint: PublicKey = futuresContractPurchase.futurePaymentTokenMint;

                 const futurePaymentTokenAccountCreator: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     futurePaymentTokenMint,
                     creatorKey
                 );

                 const futureTokenAccountPurchaser: PublicKey = await SPLToken.Token.getAssociatedTokenAddress(
                     SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                     SPLToken.TOKEN_PROGRAM_ID,
                     futureTokenMint,
                     futurePurchaser
                 );

                 if (!argv.dryRun) {
                     const settleContractInstance = await derivativeDexClient.settleFuturesContractPurchase(
                         derivativeDexKey,
                         creatorKey,
                         seedKey,
                         futurePurchaser,
                         futurePaymentTokenMint,
                         futurePaymentTokenAccountCreator,
                         futureTokenMint,
                         futureTokenAccountPurchaser,
                         wallet.payer
                     );
                     console.log(stringifyPKsAndBNs(settleContractInstance));
                 } else {
                     console.log('Settling purchased futures contract');
                 }
             })



// -------------------------------------------------- PDA account fetching instructions ------------------------------------------



// Fetch all derivative dex PDAs for a given manager and display their account info
// Pass in manager pubkey or will default to pubkey of keypair path in networkConfig.ts
    .command('fetch-all-dexes', 'Fetch all derivative dex PDA accounts info', {
        managerPubkey: {
            alias: 'm',
            type: 'string',
            demandOption: false,
            description: 'derivative dex manager pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const managerKey: PublicKey = argv.managerPubkey ? new PublicKey(argv.managerPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     console.log('Fetching all derivative dex PDAs for manager with pubkey:', managerKey.toBase58());
                     const dexPDAs = await derivativeDexClient.fetchAllDerivativeDexPDAs(managerKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= dexPDAs.length; num++) {
                         console.log('Derivative dex account', num, ':');
                         console.dir(stringifyPKsAndBNs(dexPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n derivative dex PDAs for manager pubkey:', managerKey.toBase58());
                 }
             })



// Fetch derivative dex PDA by Pubkey
// Derivative dex account pubkey required in command
    .command('fetch-dex-by-key', 'Fetch derivative dex PDA account info by pubkey', {
        derivativeDexPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDexKey: PublicKey = new PublicKey(argv.derivativeDexPubkey);

                 if (!argv.dryRun) {

                     const dexPDA = await derivativeDexClient.fetchDerivativeDexAccount(derivativeDexKey);

                     console.log('Displaying account info for derivative dex with pubkey: ', derivativeDexKey.toBase58());
                     console.dir(stringifyPKsAndBNs(dexPDA), {depth: null});

                 } else {
                     console.log('Found derivative dex PDA for pubkey:', derivativeDexKey.toBase58());
                 }
             })



// Fetch all future contract PDAs
// Derivative dex account pubkey required in command
    .command('fetch-all-futures', 'Fetch all futures contract PDA accounts info', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDexKey: PublicKey = new PublicKey(argv.derivativeDexPubkey);

                 if (!argv.dryRun) {
                     console.log('Fetching all futures contract PDAs for derivative dex account with pubkey:', derivativeDexKey.toBase58());
                     const futuresPDAs = await derivativeDexClient.fetchAllFuturesContractPDAs(derivativeDexKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= futuresPDAs.length; num++) {
                         console.log('Futures contract PDA account', num, ':');
                         console.log(stringifyPKsAndBNs(futuresPDAs[num - 1]));
                         //console.dir(stringifyPKsAndBNs(futuresPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n futures contract PDAs for derivative dex with pubkey:', derivativeDexKey.toBase58());
                 }
             })



// Fetch all future contract PDAs by creator
// Pass in creator pubkey or will default to pubkey of keypair path in networkConfig.ts
    .command('fetch-all-futures-by-creator', 'Fetch all futures contract PDA accounts info for a certain creator', {
        creatorPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: false,
            description: 'futures contract creator account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const creatorKey: PublicKey = argv.creatorPubkey ? new PublicKey(argv.creatorPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {

                     const futurePDAs = await derivativeDexClient.fetchAllFuturesContractPDAsByCreator(creatorKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= futurePDAs.length; num++) {
                         console.log('Futures contract purchase PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(futurePDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n futures contract PDA accounts for creator with pubkey:', creatorKey.toBase58());
                 }
             })



// Fetch futures contract PDA by Pubkey
    .command('fetch-future-by-key', 'Fetch futures contract PDA account info by pubkey', {
        futuresContractPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'futures contract account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractKey: PublicKey = new PublicKey(argv.futuresContractPubkey);

                 if (!argv.dryRun) {

                     const futurePDA = await derivativeDexClient.fetchFuturesContractAccount(futuresContractKey);

                     console.log('Displaying account info for futures contract with pubkey: ', futuresContractKey.toBase58());
                     console.dir(stringifyPKsAndBNs(futurePDA), {depth: null});

                 } else {
                     console.log('Found futures contract PDA accounts for pubkey:', futuresContractKey.toBase58());
                 }
             })



// Fetch all futures contract purchase PDAs
    .command('fetch-all-futures-purchases', 'Fetch all futures contract purchase PDA accounts info', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 if (!argv.dryRun) {
                     console.log('Fetching all futures contract purchase PDAs.');
                     const purchasePDAs = await derivativeDexClient.fetchAllFuturesContractPurchasePDAsByContract();

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= purchasePDAs.length; num++) {
                         console.log('Futures contract purchase PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(purchasePDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n futures contract purchase PDAs.');
                 }
             })



// Fetch all futures contract purchase PDAs by futures contract
// Futures contract account pubkey required in command
    .command('fetch-all-futures-purchases-by-contract', 'Fetch all futures contract purchase PDA accounts info for a certain futures contract', {
        futuresContractPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'futures contract account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractKey: PublicKey = new PublicKey(argv.futuresContractPubkey);

                 if (!argv.dryRun) {
                     console.log('Fetching all futures contract purchase PDAs for futures contract account with pubkey:', futuresContractKey.toBase58());
                     const purchasePDAs = await derivativeDexClient.fetchAllFuturesContractPurchasePDAsByContract(futuresContractKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= purchasePDAs.length; num++) {
                         console.log('Futures contract purchase PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(purchasePDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n futures contract purchase PDAs for futures contract with account pubkey:', futuresContractKey.toBase58());
                 }
             })



// Fetch all futures contract purchase PDAs by purchaser
// Futures contract purchaser pubkey required in command
    .command('fetch-all-futures-purchases-by-purchaser', 'Fetch all futures contract purchase PDA accounts info for a certain purchaser', {
        purchaserPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'purchased futures contract purchaser pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const purchaserKey: PublicKey = new PublicKey(argv.purchaserPubkey);

                 if (!argv.dryRun) {
                     console.log('Fetching all futures contract purchase PDAs for purchaser with pubkey:', purchaserKey.toBase58());
                     const purchasePDAs = await derivativeDexClient.fetchAllFuturesContractPurchasePDAsByPurchaser(purchaserKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= purchasePDAs.length; num++) {
                         console.log('Futures contract purchase PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(purchasePDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n futures contract purchase PDAs for purchaser with pubkey:', purchaserKey.toBase58());
                 }
             })



// Fetch futures contract purchase PDA by key
// Futures contract purchase account pubkey required in command
    .command('fetch-futures-purchase-by-key', 'Fetch futures contract purchase PDA account info by pubkey', {
        futuresContractPurchase: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'futures contract purchase account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseKey: PublicKey = new PublicKey(argv.futuresContractPurchase);

                 if (!argv.dryRun) {

                     const purchasePDA = await derivativeDexClient.fetchFuturesContractPurchaseAccount(futuresContractPurchaseKey);

                     console.log('Displaying account info for futures contract purchase with pubkey: ', futuresContractPurchaseKey.toBase58());
                     console.dir(stringifyPKsAndBNs(purchasePDA), {depth: null});

                 } else {
                     console.log('Found futures contract purchase PDA for pubkey:', futuresContractPurchaseKey.toBase58());
                 }
             })



// Fetch all purchased futures contract listing PDA accounts
    .command('fetch-all-listings', 'Fetch all futures contract purchase listing PDA accounts', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 if (!argv.dryRun) {
                     console.log('Fetching all purchased futures contract listing PDAs.');
                     const listingPDAs = await derivativeDexClient.fetchAllFuturesContractPurchaseListingPDAs();

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= listingPDAs.length; num++) {
                         console.log('Futures contract purchase listing PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(listingPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n futures contract purchase PDAs.');
                 }
             })



// Fetch futures contract purchase listing PDA by futures contract purchase
// Futures contract purchase pubkey required in command
    .command('fetch-listing-by-purchase', 'Fetch futures contract purchase listing PDA account info for a certain futures contract purchase', {
        futuresContractPurchase: {
            alias: 'p',
            type: 'string',
            demandOption: true,
            description: 'futures contract purchase pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseKey: PublicKey = new PublicKey(argv.futuresContractPurchase);

                 if (!argv.dryRun) {
                     const listingPDA = await derivativeDexClient.fetchFuturesContractPurchaseListingPDAByPurchase(futuresContractPurchaseKey);

                     console.log('Displaying account info for futures contract purchase listing PDA for futures contract purchase account with pubkey: ', futuresContractPurchaseKey.toBase58());
                     console.dir(stringifyPKsAndBNs(listingPDA[0]), {depth: null});

                 } else {
                     console.log('Found futures contract purchase listing PDA for futures contract purchase account with pubkey:', futuresContractPurchaseKey.toBase58());
                 }
             })



// Fetch purchased futures contract listing PDA account by key
// Futures contract purchase listing account pubkey required in command
    .command('fetch-listing-by-key', 'Fetch futures contract purchase PDA account info by pubkey', {
        listingPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'futures contract purchase listing account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseListingKey: PublicKey = new PublicKey(argv.listingPubkey);

                 if (!argv.dryRun) {

                     const listingPDA = await derivativeDexClient.fetchPurchasedFuturesContractListingAccount(futuresContractPurchaseListingKey);

                     console.log('Displaying account info for purchased futures contract listing with pubkey: ', futuresContractPurchaseListingKey.toBase58());
                     console.dir(stringifyPKsAndBNs(listingPDA), {depth: null});

                 } else {
                     console.log('Found purchased futures contract listing PDA for pubkey:', futuresContractPurchaseListingKey.toBase58());
                 }
             })



// Fetch all settlement contracts
    .command('fetch-all-settlements', 'Fetch all settlement contract PDA accounts info', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 if (!argv.dryRun) {
                     console.log('Fetching all settlement contract PDAs.');
                     const settlementPDAs = await derivativeDexClient.fetchAllSettlementContractPDAs();

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= settlementPDAs.length; num++) {
                         console.log('Settlement contract PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(settlementPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n settlement contract PDAs.');
                 }
             })



// Fetch all settlement contracts by futures contract
// Futures contract account pubkey required in command
    .command('fetch-all-settlements-by-contract', 'Fetch all settlement contract PDA accounts info for a certain futures contract', {
        futuresContractPubkey: {
            alias: 'c',
            type: 'string',
            demandOption: true,
            description: 'futures contract account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractKey: PublicKey = new PublicKey(argv.futuresContractPubkey);

                 if (!argv.dryRun) {
                     console.log('Fetching all settlement contract PDAs.');
                     const settlementPDAs = await derivativeDexClient.fetchAllSettlementContractPDAs(futuresContractKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= settlementPDAs.length; num++) {
                         console.log('Settlement contract PDA account', num, ':');
                         console.dir(stringifyPKsAndBNs(settlementPDAs[num - 1]), {depth: null});
                     }

                 } else {
                     console.log('Found a total of n settlement contract PDAs for futures contract account with pubkey: ', futuresContractKey.toBase58());
                 }
             })



// Fetch settlement contract by futures contract purchase
    .command('fetch-settlement-by-purchase', 'Fetch settlement contract PDA account info for a certain futures contract purchase', {
        futuresContractPurchase: {
            alias: 'p',
            type: 'string',
            demandOption: true,
            description: 'futures contract purchase account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const futuresContractPurchaseKey: PublicKey = new PublicKey(argv.futuresContractPurchase);

                 if (!argv.dryRun) {
                     console.log('Fetching all settlement contract PDAs.');
                     const settlementPDA = await derivativeDexClient.fetchSettlementContractPDAByPurchase(futuresContractPurchaseKey);


                     console.log('Displaying account info for settlement contract PDA for futures contract purchase account with pubkey: ', futuresContractPurchaseKey.toBase58());
                     console.dir(stringifyPKsAndBNs(settlementPDA[0]), {depth: null});


                 } else {
                     console.log('Found settlement contract PDA for futures contract purchase account with pubkey: ', futuresContractPurchaseKey.toBase58());
                 }
             })



// Fetch settlement contract PDA by key
// Settlement contract account pubkey required in command
    .command('fetch-settlement-by-key', 'Fetch settlement contract PDA account info by pubkey', {
        settlementContractPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'settlement contract account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const settlementContractKey: PublicKey = new PublicKey(argv.settlementContractPubkey);

                 if (!argv.dryRun) {

                     const settlementPDA = await derivativeDexClient.fetchSettlementContractAccount(settlementContractKey);

                     console.log('Displaying account info for settlement contract with pubkey: ', settlementContractKey.toBase58());
                     console.dir(stringifyPKsAndBNs(settlementPDA), {depth: null});

                 } else {
                     console.log('Found settlement contract PDA for pubkey:', settlementContractKey.toBase58());
                 }
             })



// Fetch PDA token account
// Token mint and token account pubkeys required in command
    .command('fetch-token-account', 'Fetch token account info by pubkey', {
        tokenMint: {
            alias: 't',
            type: 'string',
            demandOption: true,
            description: 'mint address of spl-token'
        },
        tokenAccount: {
            alias: 's',
            type: 'string',
            demandOption: true,
            description: 'pubkey of associated spl-token account'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );


                 const mintKey: PublicKey = new PublicKey(argv.tokenMint);
                 const tokenAccountKey: PublicKey = new PublicKey(argv.tokenAccount);

                 if (!argv.dryRun) {

                     const tokenAccountPDA = await derivativeDexClient.fetchTokenAccount(mintKey, tokenAccountKey);

                     console.log('Displaying account info for token account PDA with pubkey: ', tokenAccountKey.toBase58());
                     console.dir(stringifyPKsAndBNs(tokenAccountPDA), {depth: null});

                 } else {
                     console.log('Found token account PDA for pubkey:', tokenAccountKey.toBase58());
                 }
             })



// Fetch derivative dex authority PDA
// Derivative dex account pubkey required in command
    .command('fetch-dex-auth', 'Fetch merchant authority PDA pubkey', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        }
    },
             async (argv) => {

                 const derivativeDexKey: PublicKey = new PublicKey(argv.derivativeDexPubkey);

                 if (!argv.dryRun) {

                     const [dexAuthKey, _dexAuthKeyBump] = await findDerivativeDexAuthorityPDA(derivativeDexKey);

                     console.log('Derivative dex authority key is: ', dexAuthKey.toBase58());

                 } else {
                     console.log('Found derivative dex authority key for derivative dex account with pubkey: ', derivativeDexKey.toBase58());
                 }
             })



// Fetch treasury balance
// Derivative dex account pubkey required in command
    .command('fetch-treasury-balance', 'Fetch derivative dex account treasury balance', {
        derivativeDexPubkey: {
            alias: 'x',
            type: 'string',
            demandOption: true,
            description: 'derivative dex account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const derivativeDexClient: DerivativeDexClient = new DerivativeDexClient(
                     rpcConn,
                     wallet,
                     DerivativeDexIDL,
                     DERIVATIVE_DEX_PROG_ID,
                 );

                 const derivativeDexKey: PublicKey = new PublicKey(argv.derivativeDexPubkey);

                 if (!argv.dryRun) {

                     const treasuryBalance = await derivativeDexClient.fetchTreasuryBalance(derivativeDexKey)

                     console.log('Displaying treasury balance for derivative dex account with pubkey: ', derivativeDexKey.toBase58());
                     console.log(stringifyPKsAndBNs(treasuryBalance));

                 } else {
                     console.log('Found treasury balance for derivative dex account with pubkey:', derivativeDexKey.toBase58());
                 }
             })














































// ------------------------------------------------ misc ----------------------------------------------------------
    .usage('Usage: $0 [-d] -c [config_file] <command> <options>')
    .help();



async function loadWallet(fileName: string): Promise<Keypair> {
    let walletBytes = JSON.parse((await fs.readFile(fileName)).toString());
    let privKeyBytes = walletBytes.slice(0,32);
    let keypair = Keypair.fromSeed(Uint8Array.from(privKeyBytes));
    return keypair
}



// Let's go!
(async() => {
    await parser.argv;
    process.exit();
})();
