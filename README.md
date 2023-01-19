# Betelgeuse 
 ### A Decentralized Exchange of Fractionalizable Derivatives of SPL-Tokens using Rationalized Token-Swap Ratios

## Disclaimer

The project, codenamed 'Betelgeuse' is un-audited open-source software. It was built from the ground up by a single developer over a 7 day period (Jan 10 2023 - Jan 17 2023) for submission in Solana's Sandstorm hackathon. Any use of this software is done so at your own risk and the developer induces zero liabilty in doing so. 

Furthermore, the speculative positions in this demo are purely hypothetical and intended for use as educational tools only. They are not to be construed as having any financial relevance whatsoever, nor insight into the financial markets, nor financial advice. 

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/ ).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/Betelgeuse/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile:

    alias dex-cli='ts-node ~/Development/Solana/Betelgeuse/src/cli/derivative-dex-cli.ts'

accounting for the fact that your path to the derivative-dex-cli.ts file may be slightly different depending on where you put the cloned repository.

The remainder of this demonstration assumes a familiarity with Solana's CLI.

## Configuration
In order to use the program we need to configure the .ts files in ../Betelgeuse/src/cli/config_devnet/

There are 6 configuration files and we will edit them as needed throughout the demonstration. They are:
- the network configuration
- the futures contract creator configuration
- the futures contract purchaser configuration
- the purchased futures contract lister configuration
- the purchased futures contract purchaser configuration
- the settlement contract configuration

The choice for using configuration files was two-fold. For one, since there are multiple public keys / numerical values required for many of the commands, and users can have a multitude of accounts of each type, storage files would be necessary anyways. And secondly, entering multiple options in the process of a command would require a tedious copying/pasting process which configuration files forego. Nonetheless, the command line interface built here tries to be as flexible as possible, forcing to use configuration files when it is absolutely in your best interest and otherwise giving you the flexibility to enter options manually.

The network configuration (../config_devnet/networkConfig-devnet.ts) is necessary right away. We will first set up the configuration from the perspective of someone who will initialize and manage a derivative dex (later we will also do it from the perspective of other users). Two inputs are required:
- the clusterApiUrl
- the signerKeypair

Here's what mine looks like:

![Screenshot from 2023-01-15 19-39-42](https://user-images.githubusercontent.com/97003046/212576298-5fa459ce-78bb-4ad9-9650-94f2e3e15cf6.png)

## Initializing a Derivative DEX (Decentralized Exchange)

To initialize a derivative dex we need to have decided on only one parameter - what is the derivative dex trading fee in Lamports. This can be any integer value greater than or equal to zero, and will be collected from both contract creators (sellers) and contract purchasers at the moment of contract settlement. 

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

Note that it may take a few seconds for the state account to be updated. 

I've gone ahead and changed the fee back to 5000 Lamports. As an exercise, you should try and do the same.

## Creating a Futures Contract

To create a futures contract we first need to go back to the network configuration file and reconfigure it using the appropriate keypair. This is not stictly necessary, but I've minted and distributed a handful (or two) of SPL-tokens to play with to multiple wallets before starting the demo to simulate the full experience anyways. Generally, users will only have to set the network configuration once and forget about it using their keypair for all of their various transactions. 

Here is the updated network configuration:

![Screenshot from 2023-01-15 20-20-16](https://user-images.githubusercontent.com/97003046/212579431-19dfde16-e745-4303-bcb6-301543548ebf.png)

Before we populate the fields of the futures creator configuration file (../config_devnet/futuresCreatorConfig-devnet.ts), we must first understand what it is we are trying to do, so I grabbed a list of some of Solana's most popular tokens (as of right now) and placed their current value (in USD) next to them.

![Screenshot from 2023-01-15 23-25-50](https://user-images.githubusercontent.com/97003046/212598541-346ee214-6d0e-4e3a-a924-6286f42830ad.png)

One of the many major use cases for a futures contract is speculation. Suppose an investor speculates that certain SPL-Tokens are under-valued and that at some point in the future these tokens will significantly appreciate in USD value. Suppose one of these tokens speculated to be under-valued is RAYDIUM.

At the current prices 1 RAYDIUM = 0.240401 USDC. Suppose the investor speculates that 1 RAYDIUM will be worth well north of 0.35 USDC, in say, 30 days and wants to set up a futures contract requesting that price. This is equivalent to saying 100 RAYDIUM = 35 USDC and in such a form, we have rationalized the coffecients of the Token Swap Ratio (i.e. they are integer-valued).

The investor can create a futures contract depositing any amount N of USDC (into a PDA token account) requesting a Token Swap Ratio of USDC to RAYDIUM of 35:100. However, the investor is not limited to a single token swap request. If the investor believes that BONFIDA, SERUM, and AURORY are all also under-valued, the investor can create a futures contract requesting purchases in terms of Rationalized Token Swap Ratios for each of those tokens as well.

A potential futures contract in such a case would look like:

![Screenshot from 2023-01-19 14-53-05](https://user-images.githubusercontent.com/97003046/213545945-76462dad-4c81-471a-9673-1337d1076892.png)

There is quite a bit to parse here! The first thing to note is that the futures contract is a PDA account. Since for each derivative dex, any wallet can create any number of futures contracts, to ensure a unique futures contract account is generated each time, there must be a unique seed byte array. This is acheived by providing the seed pubkey. To automate this process from say, a front-end application, one can call KeyPair.generate() and provide the necessary pubkey. The pubkey will be stored in the futures contract's state account and storing the private key is not necessary.

Secondly, any SPL-Token amount (and Sol too) will always be listed in the token's smallest denomination. That is, the program recognizes an entry of 1 as 1 Lamport, not 1 Sol. As USDC has 6 decimals, the value 100,000,000 in the listing amount field is actually just 100 USDC (in human readable terms). And this brings us to the Token Swap Ratio of USDC:AURY.

From the posted relative price graphic it would appear that the speculator intends to secure a futures contract that sells 80 USDC for 100 AURY. And this is technically true. However, recall that all SPL-Tokens are observed by the program in their smallest denomination, and thus 80 USDC = 80,000,000 and 100 AURY = 100,000,000,000. Factoring by 1,000,000 on both sides, we are left with a ratio of 80:100,000, not 80:100. This increased factor of 1000 for the AURY token results from the fact that AURY has 9 decimals, whereas all the other tokens previously considered have 6, hence having to move the decimal a further 3 places to the right. 

Now that the ratios are understood, we should really put them in terms of their smallest common denominator as follows: 

![Screenshot from 2023-01-19 14-51-09](https://user-images.githubusercontent.com/97003046/213545681-c692677e-cf7a-41b2-901b-18e4cb0d552f.png)

Running the command

    dex-cli create-future

one shall receive an output to the terminal similar to the following:

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

That's right, any investor can come along and buy the whole or any portion of the futures contract as long as the established rationalized Token Swap Ratios are respected. Before moving to the domonstration of purchasing futures contracts, I'll go ahead and set up another few futures contracts.

Executing the command 

    dex-cli fetch-all-futures -x 8U8LN6EsEZMXTzwKixyrs6VWZ52zoTmLfe3aRJ2TPkCC 
    
one obtains the following output (data intentionally compressed) where one can see all the created futures contracts associated to the derivative dex with the provided pubkey. 

![Screenshot from 2023-01-19 15-42-40](https://user-images.githubusercontent.com/97003046/213555416-96f892cb-f733-4c38-8eb5-54fbcd040d76.png)

Alternatively, one can do 

    dex-cli fetch-all-futures-by-creator -k F6ybdMYxfeC27nReLr5fXP51U6CWbPmWoors6jK8bt3c
    
to see all the created futures contracts for a particular creator.

![Screenshot from 2023-01-19 15-46-53](https://user-images.githubusercontent.com/97003046/213556118-9dd2eeeb-79f3-4f1f-acb2-64f651b6cb7e.png)

## Supplementing a Futures Contract

Additional tokens (of the same mint) can be added to a futures contract at any point up until the expiry timestamp. Similarly, unsold tokens can be withdrawn with the same constraint on time. However, the Token Swap Ratios cannot be changed. This is due to the fractional nature of the futures contract and the fact that these ratios will have been 'locked in' for any previous fractionalized purchase. To effectively achieve the same result, unsold futures contract tokens can be withdrawn and a new futures contract with different Token Swap Ratios can be created.

Let's add supplemental tokens to the futures contract with account address 4DEXcge8kCzAo6YHy8frLqyrvLFhskK3CHyovJ8ZV2d7 (nice coincidence with the first 4 characters there being the 4th futures contract created for this dex). Executing the command: 

    dex-cli supplement-future -c 4DEXcge8kCzAo6YHy8frLqyrvLFhskK3CHyovJ8ZV2d7 -s 6SyeP8wFbkwvw7bj6SLfyRWh6md73fkpBHHVNCAXCdcS -a 15000000

where -c is the futures contract account address, -s is the source token account, and -a is the supplemental listing amount. The first of these arguments is mandatory, but the rest are optional and will be drawn from the futures contract creator config file if not provided. Here is the transaction confirmation message:

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

As you can see, the PDA token account address holding the SERUM tokens as payment for the futures contract is displayed in the futurePaymentTokenAccount field and the future payment token amount of 7,500,000 = 150,000 * 50 is correct as the USDC:SRM Token Swap Ratio in the futures contract is 29:50. In this way, one can say that the purchaser purchased 150,000 units of the baseline ratio. Moreover, this futures contract purchase state account acts as a receipt of purchase of the futures contract until settlement occurs.

Displaying again the futures contract for reference, 

![Screenshot from 2023-01-19 16-14-43](https://user-images.githubusercontent.com/97003046/213560994-b72d2a3b-71c5-42b5-97eb-2154296bdb82.png)

we see that the futures contract state account has been updated to reflect the purchased amount of 4,350,000. This book-keeping mechanism ensures that no more than the listed amount in the futures contract can be retained in contract purchases.

A purchaser can also make another purchase of the same contract with a different token mint, provided it is one listed in the Token Swap Ratios. Reconfiguring the purchaser config file as follows:

![Screenshot from 2023-01-19 16-19-03](https://user-images.githubusercontent.com/97003046/213562970-5ab3d638-b28b-42c8-b26f-c7f388c05b2f.png)

and submitting another purchase transaction with

    dex-cli purchase-future
    
A confirmation of the transaction to the terminal would appear as something that looks like:

![Screenshot from 2023-01-19 16-19-42](https://user-images.githubusercontent.com/97003046/213563230-509d31e6-4a78-4dcc-a623-614704e7a598.png)

I'll go ahead and purchase a few more futures contracts in a fractionalized manner. From here we ca run

    dex-cli fetch-all-futures-purchases-by-purchaser -k GXgsr5Rf9fyif3Z59fWhvtkDx9Nrcm3ezzb9LMUzjVM3

to see all the purchaser's futures contract purchase state accounts (i.e. for all futures contracts the purchaser may have purchased from)

![Screenshot from 2023-01-19 16-31-33](https://user-images.githubusercontent.com/97003046/213566644-59e17714-efdd-42eb-9b07-45d730b865b4.png)

Or similarly, run the command

    dex-cli fetch-all-futures-purchases-by-contract -c FBWq6DY7Rg7SrgdSQuXqYKeCwpv6hRu1FcY6tNs6Psgg

to view the purchased futures contracts state accounts filtered by futures contract (-c). 



The futures contract listing can continue to sell in this fractionalized way to any number of users until all tokens are allocated to purchases. 

## Listing a Purchased Futures Contract

Suppose now one of the purchasers wants to liquidate all or some of their position on a certain futures contract purchase but does not want to wait until that contract's expiry. What to do? Well, the purchaser has the option of listing all or some of their purchased futures contract for sale. This listing can be bought in whole or in part, much like the original futures contract, allowing for fractionalized sales of purchased futures contract listings as well. This is due to the fact that the listing of the purchased futures contract will be provided with its own unique array of Token Swap Ratios, independent in mints and ratios of the ones present in the futures contract itself. 

However, in the case of a purchase of a futures contract purchase listing the token amount due to the lister is transferred instantly. In return, the appropriate amount of the lister's PDA-stored payment tokens (the ones used to pay for the futures contract itself) are transferred to another PDA for which the subsequent purchaser has authority. The original purchaser's futures contract purchase state account is then modified to reflect the changes (or closed in the case where it no longer has any tokens left associating it to the futures contract). A new futures contract purchase is created for the subsequent purchaser honouring the original terms of the contract. 

We will go through a demonstration of this second layer of fractionalized interaction.

First, we need to modify the configuration file (../config_devnet/listPurchasedFuturesConfig-devnet.ts). All of the information required can be found in the futures contract purchase state account of the purchase you want to list except for the futureExpiresTs field of the futures contract. The configuration file should look something like this: 

![Screenshot from 2023-01-17 16-15-57](https://user-images.githubusercontent.com/97003046/213014098-f294a0dd-dcb6-4866-9300-28448dd0693b.png)

As you can see, I've placed some portion of the futures contract purchased (650,000) into the listing and have made it so that the listing expires exactly when the futures contract does. Moreover, do not forget that the ratios must be converted to account for the decimal place difference between the tokens. Although the futures contract purchase account pubkey is not provided, the combination of the futures contract account pubkey along with the payment token mint is unique and corresponds to one and only one futures contract purchase account despite the fact that a purchaser can have multiple futures contract purchase accounts for a single futures contract.

Don't forget to change the network configuration file to the appropriate keypair and do:

    dex-cli list-purchased-future

For a successful transaction, the output to the terminal should look like the following:

![Screenshot from 2023-01-17 16-19-37](https://user-images.githubusercontent.com/97003046/213014671-a2946ce9-2f28-41d7-b4bc-7b406269f9e6.png)

We can view the purchased futures contract listing state account by doing:

    dex-cli fetch-listing-by-key -k 3vTmxXqGH1vvdhtbsK9rkzZP4Ri82Z9Yp1eVm3gv5eq5

with output to the terminal looking like:

![Screenshot from 2023-01-17 16-20-31](https://user-images.githubusercontent.com/97003046/213014780-27a4f6d8-5653-40bf-bcb5-fe184c98a1f7.png)

I'll go ahead and repeat the process to make more listings.

## Supplementing a Futures Contract Purchase Listing

Now, a futures contract purchase state account can have at most one listing associated to it, but this listing can be supplemented with remaining unlisted purchased futures contract tokens. Running 

    dex-cli supplement-future-listing -a 1000000

where the -a option is the supplemental listing amount, one obtains a confirmation message output to the terminal similar to: 

![Screenshot from 2023-01-16 20-23-20](https://user-images.githubusercontent.com/97003046/212789474-a1739c0a-d65c-497e-a227-3b3710201911.png)

Running 

    dex-cli fetch-listing-by-key -k 3vTmxXqGH1vvdhtbsK9rkzZP4Ri82Z9Yp1eVm3gv5eq5

we observe that the purchased futures contract listing state account has been updated accordingly.

![Screenshot from 2023-01-16 21-31-16](https://user-images.githubusercontent.com/97003046/212796840-893660c9-a316-4877-9d6c-9fe7ca351a7a.png)

## Purchasing a Purchased Futures Contract Listing

To purchase part or all of a purchased futures contract listing we need to once again configure the parameters in the appropriate configuration file, this time (../config_devnet/purchasePurchasedFuturesContract-devnet.ts). All of the required information can be obtained from the futures contract purchase state account and its address can be obtained from the listing derired to be purchased. 

A typical configuration would like like the following: 

![Screenshot from 2023-01-17 16-32-18](https://user-images.githubusercontent.com/97003046/213016698-18e120cd-d4af-4fc9-a29e-7d5006e302ac.png)

Running the command

    dex-cli purchase-future-listing

one sees, upon a successful transaction, a display on the console similar to:

![Screenshot from 2023-01-17 16-33-00](https://user-images.githubusercontent.com/97003046/213016858-84cbde32-12c7-4977-8a92-2903c5db475a.png)












