# Betelgeuse 
 ### A Decentralized Exchange of Fractionalizable Derivatives of SPL-Tokens using Rationalized Token-Swap Ratios

## Disclaimer

The project, codenamed 'Betelgeuse' is un-audited open-source software. It was built from the ground up by a single developer over a 7 day period (Jan 10 2023 - Jan 17 2023) for submission in Solana's Sandstorm hackathon. Any use of this software is done so at your own risk and the developer induces zero liabilty in doing so. (Edit: Indeed, see the Program Improvements / Debugging section at the end of this readme to grasp how much was learned just in the process of this demonstration).

Furthermore, the speculative positions in this demo are purely hypothetical and intended for use as educational tools only. They are not to be construed as having any financial relevance whatsoever, nor insight into the financial markets, nor financial advice. 

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/ ).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/Betelgeuse/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile:

    alias dex-cli='ts-node ~/Development/Solana/Betelgeuse/src/cli/derivative-dex-cli.ts'

accounting for the fact that your path to the derivative-dex-cli.ts file may be slightly different depending on where you put the cloned repository.

The remainder of this demonstration assumes a familiarity with Solana's CLI. You will need to create filesystem wallet keypairs and minted and distributed tokens to various wallet addresses to follow the tutorial completely.

## Configuration
In order to use the program we need to configure the .ts files in ../Betelgeuse/src/cli/config_devnet/

There are 6 configuration files and we will edit them as needed throughout the demonstration. They are:
- the network configuration
- the futures contract creator configuration
- the futures contract purchaser configuration
- the purchased futures contract lister configuration
- the purchased futures contract purchaser configuration
- the settlement contract configuration

The choice for using configuration files was two-fold. For one, since there are multiple public keys / numerical values required for many of the commands, and users can have a multitude of accounts of each type, storage files would be necessary anyways. And secondly, entering multiple options in the process of a command would require a tedious copying/pasting process which configuration files forego. Nonetheless, the command line interface built here tries to be as flexible as possible, forcing you to use configuration files when it is absolutely in your best interest and otherwise giving you the flexibility to enter options manually.

The network configuration (../config_devnet/networkConfig-devnet.ts) is necessary right away. We will first set up the configuration from the perspective of someone who will initialize and manage a derivative dex (later we will also do it from the perspective of other users). Two inputs are required:
- the clusterApiUrl
- the signerKeypair

Here's what mine looks like:

![Screenshot from 2023-01-15 19-39-42](https://user-images.githubusercontent.com/97003046/212576298-5fa459ce-78bb-4ad9-9650-94f2e3e15cf6.png)

## Initializing a Derivative DEX (Decentralized Exchange)

To initialize a derivative dex we need to have decided on only one parameter - what is the derivative dex trading fee in Lamports. This can be any integer value greater than or equal to zero, and will be collected from both contract creators (sellers) and contract purchasers at various instruction calls.

Once decided upon (in this case I'll be using 5000 Lamports), we can initialize a derivative dex from the terminal with

    dex-cli init-dex -f 5000
   
where the -f option is necessary and represents the value of the derivative dex trading fee. The output to the terminal should be something like:

![Screenshot from 2023-01-19 14-27-16](https://user-images.githubusercontent.com/97003046/213541027-0088ca4a-9ac2-40f2-8991-1336d9465cdc.png)

We can view the derivative dex state account at any time by using the command:

    dex-cli fetch-dex-by-key -k 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC

where the -k option is necessary and whose input requires the derivative dex account pubkey. The output to the terminal is the information contained in the derivative dex state account and will look like: 

![Screenshot from 2023-01-19 14-29-55](https://user-images.githubusercontent.com/97003046/213541566-69a8d3c8-0496-47fb-ae47-e3bfb6864da4.png)

If desired, the derivative dex trading fee can be changed at any time using 

    dex-cli update-trading-fee -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC -f 100000

with the -x requiring the derivative dex account pubkey and -f the fee as before. Here, you can see the confirmation output 

![Screenshot from 2023-01-19 14-32-23](https://user-images.githubusercontent.com/97003046/213542111-abb8ef0e-cb4f-4e24-9e8b-4f95b55744a9.png)

and the updated derivative dex state account reflecting the change

![Screenshot from 2023-01-19 14-33-06](https://user-images.githubusercontent.com/97003046/213542273-a3c59eb0-2042-4c75-ab02-b121887b6f29.png)

Note that it may take a few seconds for the state account to be updated and this applies to any transaction. 

I've gone ahead and changed the fee back to 5000 Lamports. As an exercise, you should try and do the same.

The derivative dex authority pubkey can be fetched by inputting into the terminal 

    dex-cli fetch-dex-auth -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC
    
returning an output of just the requested authority pubkey

![Screenshot from 2023-01-19 22-37-19](https://user-images.githubusercontent.com/97003046/213612465-a4b9485d-644c-419d-b173-5e7c5300d907.png)

## Creating a Futures Contract

To create a futures contract we first need to go back to the network configuration file and reconfigure it using the appropriate keypair. This is not stictly necessary, but I've minted and distributed a handful (or two) of SPL-tokens to play with to multiple wallets before starting the demo to simulate the full experience anyways. Generally, users will only have to set the network configuration once and forget about it using their keypair for all of their various transactions. 

Here is the updated network configuration:

![Screenshot from 2023-01-15 20-20-16](https://user-images.githubusercontent.com/97003046/212579431-19dfde16-e745-4303-bcb6-301543548ebf.png)

Before we populate the fields of the futures creator configuration file (../config_devnet/futuresCreatorConfig-devnet.ts), we must first understand what it is we are trying to do, so I grabbed a list of some of Solana's most popular tokens (as of right now) and placed their current value (in USD) next to them.

![Screenshot from 2023-01-15 23-25-50](https://user-images.githubusercontent.com/97003046/212598541-346ee214-6d0e-4e3a-a924-6286f42830ad.png)

One of the many major use cases for a futures contract is speculation. Suppose an investor speculates that certain SPL-Tokens are under-valued and that at some point in the future these tokens will significantly appreciate in USD value. Suppose one of these tokens speculated to be under-valued is RAYDIUM.

At the current prices 1 RAYDIUM = 0.240401 USDC. Suppose the investor speculates that 1 RAYDIUM will be worth well north of 0.35 USDC, in say, 30 days and wants to set up a futures contract requesting that price. This is equivalent to saying 100 RAYDIUM = 35 USDC and in such a form, we have rationalized the coffecients of the Token Swap Ratio (i.e. they are integer-valued).

The investor can create a futures contract depositing any amount N of USDC (into a PDA token account) requesting a Token Swap Ratio of USDC to RAYDIUM of 35:100. However, the investor is not limited to a single token swap request. If the investor believes that BONFIDA, SERUM, and AURORY are all also under-valued, the investor can create a futures contract requesting purchases in terms of Rationalized Token Swap Ratios for each of those tokens as well.

A potential futures contract configuration file in such a case would look like:

![Screenshot from 2023-01-19 14-53-05](https://user-images.githubusercontent.com/97003046/213545945-76462dad-4c81-471a-9673-1337d1076892.png)

There is quite a bit to parse here! The first thing to note is that the futures contract is a PDA account. Since for each derivative dex, any wallet can create any number of futures contracts, to ensure a unique futures contract account is generated each time, there must be a unique seed byte array. This is acheived by providing the seed pubkey. To automate this process from say, a front-end application, one can call KeyPair.generate() and provide the necessary pubkey. The pubkey will be stored in the futures contract's state account and storing the private key is not necessary.

Secondly, any SPL-Token amount (and Sol too) will always be listed in the token's smallest denomination. That is, the program recognizes an entry of 1 as 1 Lamport, not 1 Sol. As USDC has 6 decimals, the value 100,000,000 in the listing amount field is actually just 100 USDC (in human readable terms). And this brings us to the Token Swap Ratio of USDC:AURY.

From the posted relative price graphic above it would appear that the speculator intends to secure a futures contract that sells 80 USDC for 100 AURY. And this is technically true. However, recall that all SPL-Tokens are observed by the program in their smallest denomination, and thus 80 USDC = 80,000,000 and 100 AURY = 100,000,000,000. Factoring by 1,000,000 on both sides, we are left with a ratio of 80:100,000, not 80:100. This increased factor of 1000 for the AURY token results from the fact that AURY has 9 decimals, whereas all the other tokens previously considered have 6, hence having to move the decimal a further 3 places to the right. 

Now that the ratios are understood, we should really put them in terms of their smallest common denominator as follows: 

![Screenshot from 2023-01-19 14-51-09](https://user-images.githubusercontent.com/97003046/213545681-c692677e-cf7a-41b2-901b-18e4cb0d552f.png)

Running the command

    dex-cli create-future

one shall, if the transaction is successful, receive an output to the terminal similar to the following:

![Screenshot from 2023-01-19 15-00-00](https://user-images.githubusercontent.com/97003046/213547234-29acb0b6-e995-419f-a97a-df18cc8e7794.png)

We can view the newly created futures contract state account by doing:

    dex-cli fetch-future-by-key -k FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg
    
where the option -k is necessary and requires the pubkey of the futures contract state account. The output from the terminal displays the futures contract state account with all of the requested rationalized Token Swap Ratios.

![Screenshot from 2023-01-19 15-01-03](https://user-images.githubusercontent.com/97003046/213547412-feee7d8c-b68e-4308-854e-46ecd9660a9e.png)

Moreover, the futureTokenAccount field lists the address of the PDA token account storing the contracted futures tokens. Running

    dex-cli fetch-token-account -t USDCrw1xMH2J8VqeTmn75h1GpiPA5mKt5CpR6hUcqrz -s 7jQwLSMyR6rDeVHu1StFJxgW9amxw6HycZxEnYz2693B
    
where -t and -s are the mint address and token account address respectively, one can see the token account state information including it's balance.

![Screenshot from 2023-01-19 15-02-57](https://user-images.githubusercontent.com/97003046/213547791-24b8da42-7d41-4840-85d6-6941083794c5.png)

So the obvious question remains. And that is 'why go through all this trouble to establish a protocol based on these "rationalized Token Swap Ratios" in the first place?' Well, for one, it's 'trouble' for a human, but these types of calculations are exactly where computers are at their best. But that's not the real reason anyways. The real reason to build the protocol with such base complexity is because it allows the futures contracts to be fractionalized. 

That's right, any investor can come along and buy the whole or any portion of the futures contract as long as the established rationalized Token Swap Ratios are respected. Before moving on to the demonstrations of supplementing and purchasing futures contracts, I'll go ahead and set up another few futures contracts.

Executing the command 

    dex-cli fetch-all-futures -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC 
    
one obtains the following output (data intentionally compressed) where one can see all the created futures contracts associated to the derivative dex with the provided pubkey. 

![Screenshot from 2023-01-19 15-42-40](https://user-images.githubusercontent.com/97003046/213555416-96f892cb-f733-4c38-8eb5-54fbcd040d76.png)

Alternatively, one can do 

    dex-cli fetch-all-futures-by-creator -k F6ybdMYxfeC27nReLr5fXP51U6CWbPmWoors6jK8bt3c
    
to see all the created futures contracts for a particular creator.

![Screenshot from 2023-01-19 15-46-53](https://user-images.githubusercontent.com/97003046/213556118-9dd2eeeb-79f3-4f1f-acb2-64f651b6cb7e.png)

## Supplementing a Futures Contract

Additional tokens (of the same mint) can be added to a futures contract at any point up until the expiry timestamp. However, the Token Swap Ratios cannot be changed. This is due to the fractional nature of the futures contract and the fact that these ratios will have been 'locked in' for any previous fractionalized purchase. To effectively achieve the same result, unsold futures contract tokens can be withdrawn and a new futures contract with different Token Swap Ratios can be created.

Let's add supplemental tokens to the futures contract with account address 4DEXcge8kCzAo6YHy8frLqyrvLFhskK3CHyovJ8ZV2d7 (nice coincidence with the first 4 characters there being accurately representative of the 4th futures contract created for this dex). Executing the command: 

    dex-cli supplement-future -c 4DEXcge8kCzAo6YHy8frLqyrvLFhskK3CHyovJ8ZV2d7 -s 6SyeP8wFbkwvw7bj6SLfyRWh6md73fkpBHHVNCAXCdcS -a 15000000

where -c is the futures contract account address, -s is the creator's source token account, and -a is the supplemental listing amount. The first of these arguments is mandatory, but the rest are optional and will be drawn from the futures contract creator config file if not provided. Here is the transaction confirmation message:

![Screenshot from 2023-01-19 15-55-48](https://user-images.githubusercontent.com/97003046/213557749-e4b04a8b-e5a1-49e9-8df1-7c5fcbe03f93.png)

and the updated futures contract state account reflecting the change:

![Screenshot from 2023-01-19 15-57-29](https://user-images.githubusercontent.com/97003046/213558027-39c2b687-2f86-4edc-8d5c-629637991cd1.png)

## Purchasing a Futures Contract

To purchase a futures contract (or some fractionalized portion of it), we must now configure the futures purchaser configuration file (../config_devnet/futuresPurchaserConfig-devnet.ts). A typical configuration file will look something like this:

![Screenshot from 2023-01-19 16-08-47](https://user-images.githubusercontent.com/97003046/213559875-c145d802-b054-4460-a23d-4506a6f64636.png)

Notice that the purchaser has configured the file to purchase from the futures contract with account pubkey FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg and will purchase the contract using the SRMwiToVEf5BgxXK7e6DmsYRyw24PT9aPQyQYCakUWW token. As this contract lists a USDC:SERUM Token Swap Ratio of 29:50, the field purchaseAmount must be an integer multiple of 29. The purchaser has entered 4,350,000 which is 4.35 USDC. 

As a reminder I've updated the keypair path in the network configuration file to the keypair of the "purchaser."

Entering the command 

    dex-cli purchase-future
    
one will obtain a display to the terminal similar to the following: 

![Screenshot from 2023-01-19 16-10-47](https://user-images.githubusercontent.com/97003046/213560177-42557041-38cc-4581-b8b9-289a047da0f3.png)

One can then do

    dex-cli fetch-futures-purchase-by-key -k 8F42nUhYWt7hP88RxJD8Y3DSwwyo55mxxoL7DPneP3bb

to obtain the futures contract purchase state account. The output to the terminal will look something like:

![Screenshot from 2023-01-19 16-12-21](https://user-images.githubusercontent.com/97003046/213560459-3061b6c7-8871-4821-a668-91c139f8bf4a.png)

As you can see, the PDA token account address holding the SERUM tokens as payment for the futures contract is displayed in the futurePaymentTokenAccount field and the future payment token amount of 7,500,000 = 150,000 * 50 is correct as the USDC:SRM Token Swap Ratio in the futures contract is 29:50. In this way, one can say that the purchaser has purchased 150,000 units of the baseline ratio. Moreover, this futures contract purchase state account acts as a receipt of purchase of the futures contract until settlement occurs.

Displaying again the futures contract for reference, 

![Screenshot from 2023-01-19 16-14-43](https://user-images.githubusercontent.com/97003046/213560994-b72d2a3b-71c5-42b5-97eb-2154296bdb82.png)

we see that the futures contract state account has been updated to reflect the purchased amount of 4,350,000. This book-keeping mechanism ensures that no more than the listed amount in the futures contract can be retained in contract purchases.

A purchaser can also make another purchase of the same contract with a different token mint, provided it is one listed in the Token Swap Ratios. Reconfiguring the purchaser config file as follows:

![Screenshot from 2023-01-19 16-19-03](https://user-images.githubusercontent.com/97003046/213562970-5ab3d638-b28b-42c8-b26f-c7f388c05b2f.png)

and submitting another purchase transaction with

    dex-cli purchase-future
    
A confirmation of the transaction to the terminal would appear as something that looks like:

![Screenshot from 2023-01-19 16-19-42](https://user-images.githubusercontent.com/97003046/213563230-509d31e6-4a78-4dcc-a623-614704e7a598.png)

I'll go ahead and purchase a few more futures contracts in a fractionalized manner. From here we can run

    dex-cli fetch-all-futures-purchases-by-purchaser -k GXgsr5Rf9fyif3Z59fWhvtkDx9Nrcm3ezzb9LMUzjVM3

to see all the purchaser's futures contract purchase state accounts

![Screenshot from 2023-01-19 16-31-33](https://user-images.githubusercontent.com/97003046/213566644-59e17714-efdd-42eb-9b07-45d730b865b4.png)

Notice the same purchaser, but different futures contracts. 

Similarly, we can instead run the command

    dex-cli fetch-all-futures-purchases-by-contract -c FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg

to view the purchased futures contracts state accounts filtered by futures contract. 

![Screenshot from 2023-01-19 17-35-32](https://user-images.githubusercontent.com/97003046/213577588-f2c1325f-e60c-4ef4-b976-f4e835f82892.png)

Notice the same futures contract, but different purchasers.

And finally one can run 

    dex-cli fetch-all-futures-purchases

which will return every futures purchase state account for every dex that exists in the program.

The futures contract can continue to sell in this fractionalized way, to any number of users, until all tokens are allocated to purchases. 

## Listing a Purchased Futures Contract

Suppose now one of the purchasers wants to liquidate all or some of their position on a certain futures contract purchase but does not want to wait until that contract's expiry. What to do? Well, the purchaser has the option of listing all or some of their purchased futures contract for sale. This listing can be bought in whole or in part, much like the original futures contract, allowing for fractionalized sales of purchased futures contract listings as well. This is due to the fact that the listing of the purchased futures contract will be provided with its own unique array of Token Swap Ratios, independent in mints and ratios of the ones present in the futures contract itself, although they will be ratios of the token mint listed in the original futures contract. 

However, in the case of a purchase of a futures contract purchase listing the token amount due to the lister is transferred instantly. In return, the appropriate amount of the lister's PDA-stored payment tokens (the ones used to pay for the futures contract itself) are transferred to another PDA for which the subsequent purchaser has authority. The original purchaser's futures contract purchase state account is then modified to reflect the changes (or closed in the case where it no longer has any tokens left associating it to the futures contract). A new futures contract purchase account is created for the subsequent purchaser honouring the original terms of the futures contract. 

We will go through a demonstration of this second layer of fractionalized interaction.

First, we need to modify the configuration file (../config_devnet/listPurchasedFuturesConfig-devnet.ts). All of the information required can be found in the futures contract purchase state account of the purchase you want to list except for the futureExpiresTs field of the futures contract. The configuration file should look something like this: 

![Screenshot from 2023-01-19 17-50-51](https://user-images.githubusercontent.com/97003046/213579801-30159b17-95f3-4e42-a127-36da39ac549d.png)

As you can see, I've placed some portion (2,000,000) of the futures contract amount purchased (4,000,000) into the listing and have made it so that the listing expires exactly when the futures contract does. Moreover, do not forget that the ratios must be converted to account for the decimal place difference between the tokens and that the ratios are in terms of the token listed in the futures contract (in this case USDC), not the token used to purchase it (FIDA). This is because by listing your future contract purchase, you are auctioning off the futures token you are entitled to, not the payment token, which you no longer are. 

Don't forget to change the network configuration file to the appropriate keypair and do:

    dex-cli list-purchased-future

For a successful transaction, the output to the terminal should look something like the following:

![Screenshot from 2023-01-19 18-00-00](https://user-images.githubusercontent.com/97003046/213581113-3180406e-2afc-4cf8-8c76-5c0f4417c4ed.png)

We can view the purchased futures contract listing state account by doing:

    dex-cli fetch-listing-by-key -k 9rMEPz7RmG8v5xfZKWuN4zhTXtXNFnfduKXKkwZfhaRg

with the -k option requiring the pubkey of the purchased futures contract listing and the output to the terminal should look like:

![Screenshot from 2023-01-19 18-02-01](https://user-images.githubusercontent.com/97003046/213581401-dfb00888-bb63-44b3-9193-de1de265bd31.png)

I'll go ahead and repeat the process to make another listing.

![Screenshot from 2023-01-19 18-39-28](https://user-images.githubusercontent.com/97003046/213586140-2044ec39-beca-4435-8516-f31c43d30f1c.png)

## Supplementing a Futures Contract Purchase Listing

Now, a futures contract purchase state account can have at most one listing associated to it (which is all you'll ever need), but this listing can be supplemented with remaining unlisted purchased futures contract tokens. Running 

    dex-cli supplement-listing -l 5Vgjsb66DvM3m36WqjmQcAYefDmTZRGLoJT9K3XpS1ue -a 1000000

where the -l option is the purchased futures contract listing state account and the -a option is the supplemental listing amount, and both are necessary. One obtains a confirmation message output to the terminal similar to: 

![Screenshot from 2023-01-19 18-38-00](https://user-images.githubusercontent.com/97003046/213585959-7bf16c90-d739-416b-a577-58f2db9a3f75.png)

Running 

    dex-cli fetch-listing-by-purchase -p BNMKfc7tz48mcWk1KPCaJrF6i5kz719xE1t7XBcnuus2

we observe that the purchased futures contract listing state account has been updated accordingly (listing amount now 2,000,000).

![Screenshot from 2023-01-19 18-41-31](https://user-images.githubusercontent.com/97003046/213586390-3a58ad76-289a-4c77-9527-888afd066cfe.png)

## Purchasing a Purchased Futures Contract Listing

To purchase all or part of a purchased futures contract listing we need to once again configure the parameters in the appropriate configuration file, this time (../config_devnet/purchasePurchasedFuturesContract-devnet.ts). All of the required information can be obtained from the futures contract purchase listing state account. 

A typical configuration would like like the following: 

![Screenshot from 2023-01-19 18-48-53](https://user-images.githubusercontent.com/97003046/213587187-3e711f09-0662-4609-8912-e77a5da4a10a.png)

Note that the listing purchase amount (in USDC) must be a multiple of both the listing token ratio amount in the USDC:SCRAP Token Swap Ratio (300:1) from the purchased futures contract listing AND a multiple of the listing token ratio amount in the USDC:FIDA Token Swap Ratio (1:2) from the original futures contract as well. This is because FIDA is the payment token being used for the purchase of the futures contract. Since the purchase of a futures contract purchase listing is essentially a payment of SCRAP for a reserved amount of FIDA put into a PDA account and used to secure the contract, then the appropriate way to exchange the correct amounts of these tokens relatively is through their respective relations to USDC.

Although this may seem complex, one can use the fact that: 

    for any integers a,b,c, one has: a|c and b|c if and only if lcm(a,b) | c

Thus, it suffices to calculate the least common multiple of the two listing token ratio amounts and take any multiple of that (the lcm). Integer arithmetic is not only very easy for computer programs, but nearly instantaneous. A front-end application can be designed to handle this easily and the user would only be limited by the fact that purchase increments would necessarily be increments based on the size of the lcm. In the demonstrated case, we have lcm(1, 300) = 300, and so 1,200,000 was chosen as an arbitrary multiple of 300. Note that 300 USDC is 0.0003 to a human, a small enough increment size.

Running the command

    dex-cli purchase-listing

one sees, upon a successful transaction, a display on the console similar to:

![Screenshot from 2023-01-19 19-17-31](https://user-images.githubusercontent.com/97003046/213590478-6827d7db-e079-417e-97bb-02352bab64b6.png)

Here is the newly created future contract purchase account for the listing purchaser:

![Screenshot from 2023-01-19 19-19-50](https://user-images.githubusercontent.com/97003046/213590770-fdce8d24-4a88-4570-b513-5ca22e9945d9.png)

Notice the payment token for the 1,200,000 USDC purchased is FIDA and the 1:2 ratio as per the original futures contract. The listing seller's future contract purchase account

![Screenshot from 2023-01-19 19-22-28](https://user-images.githubusercontent.com/97003046/213591043-07d6ace7-f10d-492f-972e-ed69d470dc35.png)

now reflects the fact that 1,200,000 = 2,000,000 - 800,000 USDC was sold. The future payment token amount is now 1,600,000 as required (again, the rest transferred to a PDA associated to the listing purchaser's future contract purchase account).

Here is the transaction signature: 2HxbHh96tcT1kF67usunV2Asoav5rWzRUwWonhvdz56WMdvQ4gf5aNWdjNkn3D9kJk5DNNT8wt3hV727DT7xzXvz which can be used to analyze the token transfers. For those who do not wish to work out the math, here is a summary:

USDC: 1,200,000 which is just 1.2 to a human reader, no transfers, just contractual obligations

FIDA: 2,400,000 resulting from 1:2 Token Swap Ratio with USDC which is just 2.4 to a human from one PDA to another (lister's to purchaser's)

SCRAP: 4000 resulting from the 300:1 Token Swap Ratio with USDC which is just 4 to a human from purchaser to lister (direct transfer).

And that's it.

## Closing a Purchased Futures Contract Listing

Suppose that at some point the futures contract purchaser no longer wishes to list their futures contract purchase. Then, the futures contract purchase listing can be brought down anytime (even if the futures contract expiry timestamp has passed) as long as the futures contract purchase state account for which the listing is associated to still exists. Note that, because of this there are cases where listing accounts can go defunct, although this is harmless as they are not associated to any token holdings, just the proposition to sell an account which does, but which itself must no longer exist (the reason for the listing being defunct in the first place). 

To close a listing enter the command:

    dex-cli close-listing -l 5Vgjsb66DvM3m36WqjmQcAYefDmTZRGLoJT9K3XpS1ue

where -l is necessary and is the futures contract purchase listing state account pubkey. A successful transaction will output something similar to the following:

![Screenshot from 2023-01-19 20-11-57](https://user-images.githubusercontent.com/97003046/213596784-dd149f26-0d6b-4001-87b1-6df6996d37c5.png)

Running the command: 

    dex-cli fetch-all-listings

we see that only one listing still remains:

![Screenshot from 2023-01-19 20-13-30](https://user-images.githubusercontent.com/97003046/213596957-54bbbec9-14e6-4d13-a7b3-e9781ef1d11e.png)

Note that the previous command has no filter and will fetch every listing from every dex in existence within the program.

## Settling a Futures Contract Purchase (Outright Settlement)

Both the futures contract creator and the futures contract purchaser can settle the purchased futures contract they are mutually engaged in at any point after the original futures contract has reached it's expiry timestamp. Thus, the final transaction involving the transfer of all funds in contractual agreement is permissionless. 

Displaying one of the futures contract purchases accounts again for reference:

![Screenshot from 2023-01-20 00-16-13](https://user-images.githubusercontent.com/97003046/213622515-b80f9d40-27eb-475f-8b1b-050db55c91e5.png)

Setting the keypair in the network config to be the keypair of the futures contract purchaser, we can run the command

    dex-cli settle-contract -p B3QWjipPb5Y9qftmZYMtA36P7vbn4jqfaoeuKw4Cy6xg

where the -p option is mandatory and requires the futures contract purchase account pubkey. A successful transaction will appear like:

![Screenshot from 2023-01-20 00-22-38](https://user-images.githubusercontent.com/97003046/213623274-078ae757-1302-4dbe-8893-849e53bdc845.png)

with transaction signature: 2jKPgJ2ACzaDb3g8469LHqR6rW61DVWGdVhXEvSaHoFRr3uR2yJrdm5kH2PNcNAR9CFU7J1eaCdCSJgAanLR4jeY showing that the appropriate token amounts were transferred from the PDA token accounts to the corresponding participant wallets. 

Displaying another futures contract purchase account:

![Screenshot from 2023-01-20 11-37-51](https://user-images.githubusercontent.com/97003046/213753719-834ddf74-2ebe-4c93-9736-3b80e481cf93.png)

and setting the keypair in the network config to be the creator of the futures contract this account was purchased from, we will now demonstrate that settling contract purchases also works from the perspective of the creator. Running again the settle-contract command with the appropriate futures contract purchase account pubkey

    dex-cli settle-contract -p 3shBqFW82dqseEU99Qi6BAuXyNkLRmL67Ukx9aSDKuMr
    
a succesful transaction will output to the terminal something similar to

![Screenshot from 2023-01-20 11-41-37](https://user-images.githubusercontent.com/97003046/213754446-9c239aa9-6b0a-414f-a790-88a9db9a7777.png)

with transaction signature: 57LR5crebL7LA28ChunpXKd5ko3seMnkCaCKGiFGw5EP8t9VjdWy5Tn9n8vFXfir2BdpkxwxRih7wjH1wF79LWdS to again verify the appropriate token transfers occurred. Notice also that the signer pubkey matches the pubkey of the creator of the futures contract.

In this way, no funds can ever be held hostage in the event of an unfavorable outcome for one of the participants.

## Creating a Settlement Contract (Negotiated Settlement)

In continuing with the original example (USDC:SRM contracted at 29:50), suppose that it turns out that at the time of contract expiry the relative value of USDC:SRM is 29:44. Now, the futures contract creator and the futures contract purchaser could just settle the contract and swap the contractual agreed upon amounts of 4,350,000 USDC and 7,500,000 SRM. However, if both parties want to take on new positions with their respective tokens, then settling the futures contract purchase 'as is' and swapping back at the new price is unneccessary and redundant. 

What can be done is that either participant can create a settlement contract to offer the other participant, giving them the option of accepting the settlement contract in place of settling the futures contract purchase itself. In this case, since the expiry timestamp has passed, a fair settlement contract would be the exact difference. Since the strength of SRM relative to USDC has improved (29 USDC trading for only 44 SRM rather than 50), the participant receiving the SRM tokens has come out on top, i.e. the futures contract creator. 

Since 4,350,000 USDC is now only worth 6,600,000 SRM, the futures contract purchaser has effectively lost 900,000 SRM in the deal. Thus, the futures contract creator can offer the futures contract purchaser a settlement contract in which the purchaser just has to pay the creator the 900,000 SRM difference.

What's more is that settlement contracts can be created and accepted even before futures contracts have expired. However, there is still a limitation. Since all available funds are stored in PDA token accounts at the outset of every contract's initiation, a settlement contract cannot be created asking for token amounts to be transferred that are larger than what is in reserve, even though certain positions may lead to this result (say one token's value crashes relative to another). In such a case, a transfer of funds by settling the purchase outright is necessary.

We will demonstrate the case described above. Recall the futures contract and take note of its expiry timestamp: 

![Screenshot from 2023-01-19 21-32-17](https://user-images.githubusercontent.com/97003046/213605521-b6265e8e-db21-44fc-ae54-d974a89ddcad.png)

And the futures contract purchase:

![Screenshot from 2023-01-19 21-33-46](https://user-images.githubusercontent.com/97003046/213605712-1d204507-3067-4c15-89f6-56cfb4af9fd4.png)

The futures contract creator configures the configration file (../config_devnet/settlementContractConfig-devnet.ts) as follows:

![Screenshot from 2023-01-19 21-41-22](https://user-images.githubusercontent.com/97003046/213606573-e5be9b35-aeed-4f80-b650-07751d3ac944.png)

Inputting 

    dex-cli create-settlement

a successful transaction will look something like: 

![Screenshot from 2023-01-19 21-47-06](https://user-images.githubusercontent.com/97003046/213607215-4cbe313f-75f3-46af-9f61-950713905438.png)

Running the command

    dex-cli fetch-settlement-by-key -k 7BxtGefHkFUKmMAsvr2cf2LSsg7jViviqiKT8d8PWdr6

we see the settlement contract which has been signed by the futures contract creator.

![Screenshot from 2023-01-19 21-49-27](https://user-images.githubusercontent.com/97003046/213607515-f3d441c9-aef6-4c69-b435-0257149d19fd.png)

## Accepting a Settlement Contract

To accept the settlement contrat, the futures contract purchaser (following the case above, but the roles can also be reversed) can do: 

    dex-cli accept-settlement -o 7BxtGefHkFUKmMAsvr2cf2LSsg7jViviqiKT8d8PWdr6

where the -o option is necessary and is the pubkey of the settlement contract offered. Here is the transaction signature display: 

![Screenshot from 2023-01-19 21-58-34](https://user-images.githubusercontent.com/97003046/213608573-a8ccd321-d855-4e4b-8c92-8598237f4932.png)

And the transaction signature itself: 5NXn6osKhKvuk2SkMvTEVbLrcDphNCMthVzMdkWgcRUzcRUQuc13yzETXPDNJRPCi8nBPpSbF6Y4GNF1fRfbppPx where you can see the appropriate token transfers occur and the accounts which are no longer necessary (PDA future payment token account, the settlement contract, and the futures contract purchase state account) are closed and their rent reserve lamports returned to their original payer.

Note the fields future listed amount and future purchased amount of the futures contract state account: 

![Screenshot from 2023-01-19 22-05-51](https://user-images.githubusercontent.com/97003046/213609301-80216b4b-863c-4637-81b3-79381bb989be.png)

have decreased by the appropriate amount of 4,350,000 (USDC) as this amount is no longer contractually purchased and has, in fact, been returned to the creator's wallet.

## Withdrawing a Settlement Contract

I've gone ahead and created another settlement contract which can be viewed by doing:

    dex-cli fetch-settlement-by-purchase -p 2JmGt2ioy5yPxtBXZZxmmHEatd8iw5UggPBdCX4iPYda

where the -p option is necessary and requires the futures contract purchase account pubkey. In this way, a settlement contract may be fetched by providing a futures contract purchase account pubkey rather than only by the pubkey of the settlement contract itself. Here is the settlement contract state account: 

![Screenshot from 2023-01-19 22-23-25](https://user-images.githubusercontent.com/97003046/213611056-9c896593-302f-42b9-948a-d6c27501cc99.png)

To withdraw a settlement do 

    dex-cli withdraw-settlement -o 27UA4ysAndq3ojNAemyJd4WBiV2xu4bTSQZhXJPgYz34

where again the -o option is necessary and is the pubkey of the settlement contract offered. Here is what a successful transaction appears like:

![Screenshot from 2023-01-19 22-27-27](https://user-images.githubusercontent.com/97003046/213611458-ffa806b9-d0e0-4f64-9b5c-62a2ae5cf911.png)

and note that there are no longer any settlement accounts:

    dex-cli fetch-all-settlements

producing

![Screenshot from 2023-01-19 22-29-05](https://user-images.githubusercontent.com/97003046/213611678-5dc8bd94-227d-49fd-b614-1f221eb546c9.png)

Note that the previous command has no filter and will fetch every settlement contract from every dex in existence within the program.

## Withdrawing Unsold Futures Contract Tokens

I've gone ahead and settled all remaining futures contract purchases. There are now four remaining futures contracts, each of which has a remaining purchased amount of 0. 

![Screenshot from 2023-01-20 12-14-24](https://user-images.githubusercontent.com/97003046/213762161-c1d1a1c2-f4b4-40af-a4f0-5bee2ddb054a.png)

As the expiry timestamp has passed, these contracts can no longer be purchased, and therefore, no longer serve a purpose. The creators of these futures contracts can reclaim their deposited futures tokens and close the futures contract state accounts to retrieve their rent-exempt lamports.

Setting the appropriate keypair in the network config and running 

    dex-cli withdraw-unsold-future -c 2f9fchBRauBgRuCYkhga616Pdb38RRQQWoyHiovJaeuT -d HQcCKkzw6RWUuv34vkp586jehJwyszs5wN6Nz4PvseTG

with the -c option being the futures contract account pubkey and -d the destination token account pubkey, one receives an output similar to:

![Screenshot from 2023-01-20 12-22-54](https://user-images.githubusercontent.com/97003046/213763819-6f65d6b9-a4ac-4c8f-93a6-0b5e59265140.png)

In the case that the future purchased amount of the futures contract is 0, the contract is closed. Otherwise, the listed amount and the purchased amount should coincide (as all unsold tokens have been withdrawn) and the contract remains open. Again, withdrawing unsold tokens from a futures contract can be done at any time, before and after the contract's expiry timestamp, and has no effect on any contracual obligations with existing futures contract purchases. 

I'll go ahead and withdraw all unsold tokens effectively closing all of the remaining futures contract state accounts. Fetching the dex by running

    dex-cli fetch-all-dexes -m Aq5BZaiKJahxYExRoxgcyky2WKvCMDKThn4KbqEJfMkq

where -m is optional and requires the derivative dex manager pubkey, we examine the derivative dex state account: 

![Screenshot from 2023-01-20 13-01-20](https://user-images.githubusercontent.com/97003046/213773605-8564c5df-5f07-444e-9a30-753835c1e3a4.png)

and see that the futures contract count is now zero.

## Closing Defunct Listings

From the previous image, we also see that a futures contract purchase listing still remains even though there are no longer any futures contracts and thus, no futures contract purchases. The derivative dex manager can close defunct listings by running

    dex-cli close-defunct-listing -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC -l 9rMEPz7RmG8v5xfZKWuN4zhTXtXNFnfduKXKkwZfhaRg
    
where -x is the derivative dex account pubkey and -l the listing account pubkey. A successful transaction outputs something like: 

![Screenshot from 2023-01-20 13-27-25](https://user-images.githubusercontent.com/97003046/213777925-3041dd6c-8b57-4d92-b830-4e84ccdbff88.png)

and the derivative dex state account now reflects the fact that the defunct listing is closed.

![Screenshot from 2023-01-20 13-29-06](https://user-images.githubusercontent.com/97003046/213778206-d86c981e-3a8c-48fd-98ab-843bcce0347b.png)

## Derivative Dex Management

The derivative dex's treasury account balance can be fetched by inputting

    dex-cli fetch-treasury-balance -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC

The balance is output to the terminal as:

![Screenshot from 2023-01-20 13-34-54](https://user-images.githubusercontent.com/97003046/213779127-c6218184-276f-4b0e-8795-a03c56ae65f8.png)

The derivative dex manager can then collect acquired funds from the treasury by doing

    dex-cli payout-from-treasury -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC -r Aq5BZaiKJahxYExRoxgcyky2WKvCMDKThn4KbqEJfMkq

where the -r is the receiver pubkey for the reclaimed lamports and is an optional argument. If not provided, the receiver pubkey defaults to the manager pubkey.

![Screenshot from 2023-01-20 13-39-36](https://user-images.githubusercontent.com/97003046/213779881-952b1668-33f8-4ae5-969e-b6833d617156.png)

Note that not all funds are collected from the treasury account. Indeed, a minimum rent-exempt balance of 1,002,240 is subtracted from the payout and is left in the treasury account.

Finally, the derivative dex state account can be closed so long as the three PDA counts of the dex are all 0. This is achieved by running:

    dex-cli close-dex -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC
    
As such, the dex, the treasury and the authority PDAs are all closed and the rent-reserve lamports are reclaimed by the dex manager.

## Full List of Commands

Here is a list of all the program's CLI commands:

![Screenshot from 2023-01-20 13-55-59](https://user-images.githubusercontent.com/97003046/213782580-b98639ea-9d55-469b-ae0b-6d7605e6e23c.png)

and a list describing the arguments:

![Screenshot from 2023-01-20 13-57-43](https://user-images.githubusercontent.com/97003046/213782825-162a9d4c-57b6-4b33-89ee-8346a9c5a893.png)


## Program Improvements / Debugging

1. Implement unit tests and programmed end-to-end tests. 

2. Renaming of certain structs and instructions. Simplify the nomenclature to clean up the code.

3. Update the listing contract state account to include the listing creator's address. In this way, defunct listings can be closed by the listing creator. As of right now, the manager was selected because there is no way of verifying ownership of the listing other than through ownership of the futures contract purchase which the listing was created for. As the futures contract purchase account would be closed, ultimately the reason for the listing being defunct in the first place, both accessing the close-listing instruction and verifying ownership of the listing become impossible.

4. A small provision, but one that was overlooked, is to ensure values entered for futures amount, purchase amount, listing amount, and token swap ratios are never zero. Although, as the only harm that can occur from this is that useless accounts will be created costing the user rent-exempt lamports, it is in the user's self interest not to do so. 

5. Settlement contracts can also go defunct as they too rely, by virtue of seed generation, on the futures contract purchase accounts for which they were created to settle. As one participant may offer a settlement contract and the other participant ignore this offer and settle the purchase outright, this scenario is a possibility. An instruction which closes defunct settlement contracts is necessary and which considers the solution provided to point 3 above.

6. A mechanism to allow the modification of the Token Swap Ratios field in a futures contract purchase listing is an upgrade that would be nice to have rather than make the user unlist and list again with new ratios. Unlike the Token Swap Ratios of futures contracts which are locked in once a purchase occurs, the Token Swap Ratios of futures contract purchase listings are not. This is because purchases of futures contract purchase listings involve an instantaneous settlement and the amount of the futures contract purchased is removed from the listing at that time. There are no reseved amounts and thus, the listing effectively only cares about future purchases from it and not past ones. Thus, the Token Swap Ratios of each subsequent purchase from it are entirely independent of each other and should be updatable. 

7. At the present time, multiple purchases of a futures contract using the same token mint (either directly or by purchasing futures contract purchase listings) is not possible. This is a necessity moving forward and a list of proposed solutions to this has been recorded and will be explored.

8. The fee collection mechanisms in the settle contract and accept settlement instructions were disabled due to a bug causing 'sum of account balances mismatch.' This is likely due to the fact that the futures contract creator and purchaser account pubkeys were each provided as non-signing pubkeys and a third key (one of the aforementioned two) was provided as a signer. As multiple create, transfer, and close account CPI's would change the balances of both accounts, then a payment of the dex trading fee from the signer would create a different balance for one of those accounts (depending on who the signer was). The solution is to structure the instruction with one instance of the signer account being mutable, not both it and its provided non-signer instance. 

## Future Implementations

1. More Derivatives. As of the current build, the only types of derivatives the program is built to offer are Futures Contracts. A logical next step would be to add functionality to offer other types of derivatives, in particular, Options Contracts.

2. More asset classes. At the moment, the program is built to handle a single asset class: SPL-Tokens. In the future, an expansion into other types of asset classes which can be associated a market-value; NFT-collection average listing or floor price, a Web3 company's fully diluted valuation, real world commodities which have their market value accurately represented on the blockchain, or eventually, any oracle.

3. A front-end application. To get user engagement a front-end application is an absolute necessity. 




