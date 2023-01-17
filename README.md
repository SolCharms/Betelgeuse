# Betelgeuse 
 ### A Decentralized Exchange of Fractionalizable Derivatives of SPL-Tokens using Rationalized Token-Swap Ratios

## Disclaimer

The project, codenamed 'Betelgeuse' is un-audited open-source software. It was built from the ground up by a single developer over a 6 day period (Jan 10 2023 - Jan 16 2023) for submission in Solana's Sandstorm hackathon. Any use of this software is done so at your own risk and the developer induces zero liabilty in doing so. 

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


The network configuration (../config_devnet/networkConfig-devnet.ts) is necessary right away. We will first set up the configuration from the perspective of someone who will initialize and manage a derivative dex (later we will also do it from the perspective of other users). Two inputs are required:
- the clusterApiUrl
- the signerKeypair

Here's what mine looks like:

![Screenshot from 2023-01-15 19-39-42](https://user-images.githubusercontent.com/97003046/212576298-5fa459ce-78bb-4ad9-9650-94f2e3e15cf6.png)

## Initializing a Derivative DEX (Decentralized Exchange)

To initialize a derivative dex we need to have decided on only one parameter - what is the derivative dex trading fee in Lamports. This can be any integer value greater than or equal to zero, and will be collected from both contract creators (sellers) and contract engagers (purchasers) at the moment of contract settlement. 

Once decided upon (in this case I'll be using 5000 Lamports), we can initialize a derivative dex from the terminal with

    dex-cli init-dex -f 5000
   
where the -f option is necessary and represents the value of the derivative dex trading fee. The output to the terminal should be something like:

![Screenshot from 2023-01-15 19-51-31](https://user-images.githubusercontent.com/97003046/212576946-6f8f4df2-4bbe-4dee-a2e6-56d8ce04b386.png)

We can view the derivative dex state account at any time by using the command:

    dex-cli fetch-dex-by-key -k 5Dk5f6Jdk15Ah4wftzZ72AxDRczrKM4vg3UC9ta8zPMR

where the -k option is necessary and whose input requires the derivative dex account pubkey. The output to the terminal is the information contained in the derivative dex state account and will look like: 

![Screenshot from 2023-01-15 19-56-14](https://user-images.githubusercontent.com/97003046/212577261-a783ae85-1009-4084-9234-815525de0066.png)

If desired, the derivative dex trading fee can be changed at any time using 

    dex-cli update-trading-fee -x 5Dk5f6Jdk15Ah4wftzZ72AxDRczrKM4vg3UC9ta8zPMR -f 100000

with the -x requiring the derivative dex account pubkey and -f the fee as before. Here, you can see the confirmation output 

![Screenshot from 2023-01-15 20-01-03](https://user-images.githubusercontent.com/97003046/212577625-855070b3-509a-46cc-ac18-9f653ca08965.png)

and the updated derivative dex state account reflecting the change

![Screenshot from 2023-01-15 20-02-12](https://user-images.githubusercontent.com/97003046/212577689-93f2ccab-72e9-4b1c-bd8d-6f4c9c940676.png)

I've gone ahead and changed the fee back to 5000 Lamports. As an exercise, you should try and do the same.

## Creating a Futures Contract

To create a futures contract we first need to go back to the network configuration file and reconfigure it using the appropriate keypair. This is not stictly necessary, but I've minted and distributed a handful (or two) of SPL-tokens to play with to multiple wallets before starting the demo to simulate the full experience anyways. Generally, users will only have to set the network configuration once and forget about it. 

Here is the updated network configuration:

![Screenshot from 2023-01-15 20-20-16](https://user-images.githubusercontent.com/97003046/212579431-19dfde16-e745-4303-bcb6-301543548ebf.png)

Before we populate the fields of the futures creator configuration file (../config_devnet/futuresCreatorConfig-devnet.ts), we must first understand what it is we are trying to do, so I grabbed a list of some of Solana's most popular tokens (as of right now) and placed their current value (in USD) next to them.

![Screenshot from 2023-01-15 23-25-50](https://user-images.githubusercontent.com/97003046/212598541-346ee214-6d0e-4e3a-a924-6286f42830ad.png)

One of the many major use cases for a futures contract is speculation. Suppose an investor speculates that certain SPL-Tokens are under-valued and that at some point in the future these tokens will significantly appreciate in USD value. Suppose one of these tokens speculated to be under-valued is RAYDIUM.

At the current prices 1 RAYDIUM = 0.240401 USDC. Suppose the investor speculates that 1 RAYDIUM will be worth well north of 0.35 USDC, in say, 30 days and wants to set up a futures contract requesting that price. This is equivalent to saying 100 RAYDIUM = 35 USDC and in such a form, we have rationalized the coffecients of the Token Swap Ratio (i.e. they are integer-valued).

The investor can create a futures contract depositing any amount N of USDC (into a PDA token account) requesting a Token Swap Ratio of USDC to RAYDIUM of 35:100. However, the investor is not limited to a single request. If the investor believes that BONFIDA, SERUM, and AURORY are all also under-valued, the investor can create a futures contract requesting purchases in terms of Rationalized Token Swap Ratios for each of those tokens as well.

A potential futures contract in such a case would look like: 

![Screenshot from 2023-01-17 09-07-03](https://user-images.githubusercontent.com/97003046/212919829-25efb259-9fb9-4fbd-9e73-999f33acb25e.png)

There is quite a bit to parse here! The first thing to note is that the futures contract is a PDA account. Since for each derivative dex, any wallet can create any number of futures contracts, to ensure a unique futures contract account is generated each time, there must be a unique seed byte array. This is acheived by providing the seed pubkey. To automate this process from say, a front-end application, one can call KeyPair.generate() and provide the necessary pubkey. The pubkey will be stored in the futures contract's state account and storing the private key is not necessary.

Secondly, any SPL-Token amount (and Sol too) will always be listed in the token's smallest denomination. That is, the program recognizes an entry of 1 as 1 Lamport, not 1 Sol. As USDC has 6 decimals, the value 100,000,000 in the listing amount field is actually just 100 USDC (in human readable terms). And this brings us to the Token Swap Ratio of USDC:AURY.

From the posted relative price graphic it would appear that the speculator intends to secure a futures contract that sells 80 USDC for 100 AURY. And this is technically true. However, recall that all SPL-Tokens are observed by the program in their smallest denomination, and thus 80 USDC = 80,000,000 and 100 AURY = 100,000,000,000. Factoring by 1,000,000 on both sides, we are left with a ratio of 80:100,000. This increased factor of 1000 for the AURY token results from the fact that AURY has 9 decimals, whereas all the other tokens previously considered have 6, hence having to move the decimal a further 3 places to the right. 

Now that the ratios are understood, we should really put them in terms of their smallest common denominator as follows: 

![Screenshot from 2023-01-17 09-03-27](https://user-images.githubusercontent.com/97003046/212919006-08fb1040-2ec8-4b06-aeed-a4c7f1891268.png)

Running the command

    dex-cli create-future

one shall receive an output to the terminal similar to the following:

![Screenshot from 2023-01-17 09-08-10](https://user-images.githubusercontent.com/97003046/212920225-9252572f-b580-498f-9e15-60b0712de37f.png)

We can view the newly created futures contract state account by doing:

    dex-cli fetch-future-by-key -k 8uLgGNxt4iET2PqsA7vk1L3tPGjfpYXUCdVwfmxwjGCB
    
where the option -k is necessary and requires the pubkey of the futures contract state account. The output from the terminal displays the futures contract state account with all of the requested rationalized Token Swap Ratios.

![Screenshot from 2023-01-17 09-08-47](https://user-images.githubusercontent.com/97003046/212920287-67e9676e-dc22-4324-8138-d819bff775a0.png)

Moreover, the futureTokenAccount field lists the address of the PDA token account storing the contracted futures tokens. Running

    dex-cli fetch-token-account -t USDCrw1xMH2J8VqeTmn75h1GpiPA5mKt5CpR6hUcqrz -s 31ribcuaiVTbw7LYUau4bA7DEm9hDJfSFqwiVuMpTxGn
    
where -t and -s are the mint address and token account address respectively, one can see the token account state information including it's balance.

![Screenshot from 2023-01-17 09-10-54](https://user-images.githubusercontent.com/97003046/212920623-5042cfa4-3583-4dee-a25b-79313a4db56e.png)

So the obvious question remains. And that is 'why go through all this trouble to establish a protocol based on these "rationalized Token Swap Ratios" in the first place?' Well, for one, it's 'trouble' for a human, but these types of calculations are exactly where computers are at their best. But that's not the real reason anyways. The real reason to build the protocol with such base complexity is because it allows the futures contracts to be fractionalized. 

That's right, any investor can come along and buy the whole or any portion of the futures contract as long as the established rationalized Token Swap Ratios are respected. Before moving to the purchasing of futures contracts, I'll go ahead and set up other futures contracts (for two new users and a handful for the first user above). 

Executing the command 

    dex-cli fetch-all-futures -x 5Dk5f6Jdk15Ah4wftzZ72AxDRczrKM4vg3UC9ta8zPMR

one obtains the following output (data intentionally compressed) where one can see the created futures contracts. 

![Screenshot from 2023-01-17 09-14-13](https://user-images.githubusercontent.com/97003046/212921484-5bab2349-3c0b-4bbc-a4ae-8b1d520ebac3.png)

## Supplementing a Futures Contract

Additional tokens (of the same mint) can be added to a futures contract at any point up until the expiry timestamp. Similarly, unsold tokens can be withdrawn with the same constraint on time. However, the Token Swap Ratios cannot be changed. This is due to the fractional nature of the futures contract and the fact that these ratios will have been 'locked in' for any fractionalized purchase. To effectively achieve the same result, unsold futures contract tokens can be withdrawn and a new futures contract with different Token Swap Ratios can be created.

To add tokens to a futures contract do: 

    dex-cli supplement-future -c CPhNHFjrfRmZveTq9C9oPryKjy3oMhMQKRHcJBghSnCd -s HQcCKkzw6RWUuv34vkp586jehJwyszs5wN6Nz4PvseTG -a 1000000

where -c is the futures contract account address, -s is the source token account, and -a is the supplemental listing amount. These arguments are all optional and will be drawn from the futures creator config file if not provided. Here is the transaction confirmation message:

![Screenshot from 2023-01-16 13-57-13](https://user-images.githubusercontent.com/97003046/212749117-fc858466-6cdf-4d7a-b179-cec6564d5d51.png)

and the updated futures contract state account reflecting the change:

![Screenshot from 2023-01-16 14-01-42](https://user-images.githubusercontent.com/97003046/212749663-01220bac-cc8a-4b78-83c9-f8f511dca74e.png)

## Purchasing a Futures Contract

To purchase a futures contract (or some fractionalized portion of it), we must now configure the futures purchaser configuration file (../config_devnet/futuresPurchaserConfig-devnet.ts). A typical configuration file will look something like this:

![Screenshot from 2023-01-17 09-16-24](https://user-images.githubusercontent.com/97003046/212921974-b4e65720-2c38-481d-be9e-354e8fb6769a.png)

Notice that the purchaser has configured the file to purchase from the futures contract with account pubkey Avoz6iYsQCnbtg6AxpnghGPAG8YGb244eEJeyi2aTPKk and will purchase the contract using the SRMwiToVEf5BgxXK7e6DmsYRyw24PT9aPQyQYCakUWW token. As this contract lists a USDC:SERUM Token Swap Ratio of 29:50, the field purchaseAmount must be an integer multiple of 29. The purchaser has entered 4,350,000 which is 4.35 USDC. 

As a reminder I've updated the keypair path in the network configuration file to the keypair of the "purchaser."

Entering the command 

    dex-cli purchase-future
    
one will obtain a display to the terminal similar to the following: 

![Screenshot from 2023-01-17 09-17-45](https://user-images.githubusercontent.com/97003046/212922300-37d4db37-6641-492e-9cd9-192bd50926f8.png)

One can then do

    dex-cli fetch-future-purchase-by-key -k BRUPcafDjT34LCMjhnKcTADKpQY4ij7yajY1723RHY7

to obtain the futures contract purchase state account. The output to the terminal will look something like:

![Screenshot from 2023-01-17 09-18-36](https://user-images.githubusercontent.com/97003046/212922474-41e62583-db56-4ddc-8709-0e9b7efd05f5.png)

As you can see, the PDA token account address holding the SERUM tokens as payment for the futures contract is displayed in the futurePaymentTokenAccount field and the future payment token amount of 7,500,000 = 150,000 * 50 is correct as the USDC:SRM Token Swap Ratio in the futures contract is 29:50. In this way, one can say that the purchaser purchased 150,000 units of the baseline ratio. Moreover, this futures contract purchase state account acts as a receipt of purchase of the futures contract until settlement occurs.

Displaying again the futures contract for reference, 

![Screenshot from 2023-01-17 09-19-31](https://user-images.githubusercontent.com/97003046/212922686-3369d369-70fe-46c1-8853-cbeba1f9d90b.png)

we see that the futures contract state account has been updated to reflect the purchased amount of 4,350,000. This book-keeping mechanism ensures that no more than the listed amount in the futures contract can be retained in contract purchases.

A purchaser can also make another purchase of the same contract with a different token mint, provided it is one listed in the Token Swap Ratios. Reconfiguring the purchaser config file as follows:

![Screenshot from 2023-01-16 17-48-54](https://user-images.githubusercontent.com/97003046/212776394-10e510a8-96e1-4e29-8ca6-ed157c827454.png)

and submitting another purchase transaction with

    dex-cli purchase-future
    
A confirmation of the transaction to the terminal would appear as something that looks like:

![Screenshot from 2023-01-16 17-51-55](https://user-images.githubusercontent.com/97003046/212776772-8b3c73c5-e626-44ea-ac22-5aa2c94bf269.png)

From here we ca run

    dex-cli fetch-all-futures-purchases-by-purchaser -p GXgsr5Rf9fyif3Z59fWhvtkDx9Nrcm3ezzb9LMUzjVM3

with the -p option necessary and requiring the purchaser pubkey. 

![Screenshot from 2023-01-16 17-56-06](https://user-images.githubusercontent.com/97003046/212777087-76551243-5304-4f18-a2e3-6dc1122f33c3.png)

Appropriately, we see the two futures contract purchase state accounts. As there are still remaining tokens available in the futures contract, more users can make a purchase.

I've gone ahead and made 1 additional purchase for a different purchaser. Running the command

    dex-cli fetch-all-futures-purchases-by-contract -c Avoz6iYsQCnbtg6AxpnghGPAG8YGb244eEJeyi2aTPKk

we see the 3 futures contract purchase state accounts corresponding to the futures contract with account address Avoz6iYsQCnbtg6AxpnghGPAG8YGb244eEJeyi2aTPKk. 

![Screenshot from 2023-01-16 18-16-47](https://user-images.githubusercontent.com/97003046/212778874-ad0d181c-35f2-436b-8d86-0bd8fac4f644.png)

The futures contract listing can continue to sell in this fractionalized way to any number of users until all tokens are allocated to purchases. 

## Listing a Purchased Futures Contract

Suppose now one of the purchasers wants to liquidate all or some of their position on a certain futures contract purchase but does not want to wait until that contract's expiry. What to do? Well, the purchaser has the option of listing all or some of their purchased futures contract for sale. This listing can be bought in whole or in part, much like the original futures contract, allowing for fractionalized sales of purchased futures contract listings as well. This is due to the fact that the listing of the purchased futures contract will be provided with its own unique array of Token Swap Ratios, independent in mints and ratios of the ones present in the futures contract itself. 

However, in the case of a purchase of a futures contract purchase listing the token amount due to the lister is transferred instantly. In return, the appropriate amount of the lister's PDA-stored payment tokens (the ones used to pay for the futures contract itself) are transferred to another PDA for which the subsequent purchaser has authority. The original purchaser's futures contract purchase state account is then modified to reflect the changes (or closed in the case where it no longer has any tokens left associating it to the futures contract). A new futures contract purchase is created for the subsequent purchaser honouring the original terms of the contract. 

We will go through a demonstration of this second layer of fractionalized interaction.

First, we need to modify the configuration file (../config_devnet/listPurchasedFuturesConfig-devnet.ts). All of the information required can be found in the futures contract purchase state account of the purchase you want to list except for the futureExpiresTs field of the futures contract. The configuration file should look something like this: 

![Screenshot from 2023-01-16 19-17-21](https://user-images.githubusercontent.com/97003046/212783578-2a7dd6e6-30f9-4763-a488-d8a07112e6ba.png)

As you can see, I've placed one half of the futures contract purchased (5,000,000) into the listing and have made it so that the listing expires 1 second before the futures contract does. Moreover, do not forget that the ratios must be converted to account for the decimal place difference between the tokens. Although the futures contract purchase account pubkey is not provided, the combination of the futures contract account pubkey along with the payment token mint is unique and corresponds to one and only one futures contract purchase account despite the fact that a purchaser can have multiple futures contract purchase accounts for a single futures contract.

Don't forget to change the network configuration file to the appropriate keypair and do:

    dex-cli list-purchased-future

For a successful transaction, the output to the terminal should look like the following:

![Screenshot from 2023-01-16 19-49-14](https://user-images.githubusercontent.com/97003046/212786451-45e2465e-8006-4202-986c-73255cd052a7.png)

We can view the purchased futures contract listing state account by doing:

    dex-cli fetch-listing-by-key -k 3vTmxXqGH1vvdhtbsK9rkzZP4Ri82Z9Yp1eVm3gv5eq5

with output to the terminal looking like:

![Screenshot from 2023-01-16 20-14-00](https://user-images.githubusercontent.com/97003046/212788590-16b3a51d-f317-48f8-916f-dc9c0206da89.png)

I'll go ahead and repeat the process to make more listings.

## Supplementing a Futures Contract Purchase Listing

Now, a futures contract purchase state account can have at most one listing associated to it, but this listing can be supplemented with remaining unlisted purchased futures contract tokens. Running 

    dex-cli supplement-future-listing -a 1000000

where the -a option is the supplemental listing amount, one obtains a confirmation message output to the terminal similar to: 

![Screenshot from 2023-01-16 20-23-20](https://user-images.githubusercontent.com/97003046/212789474-a1739c0a-d65c-497e-a227-3b3710201911.png)

Running 

    dex-cli fetch-listing-by-key -k 3vTmxXqGH1vvdhtbsK9rkzZP4Ri82Z9Yp1eVm3gv5eq5

we observe that the purchased futures contract listing state acccount has been updated accordingly.

![Screenshot from 2023-01-16 21-31-16](https://user-images.githubusercontent.com/97003046/212796840-893660c9-a316-4877-9d6c-9fe7ca351a7a.png)

## Purchasing a Purchased Futures Contract Listing

To purchase part or all of a purchased futures contract listing we need to once again configure the parameters in the appropriate configuration file, this time (../config_devnet/purchasePurchasedFuturesContract-devnet.ts). All of the required information can be obtained from the futures contract purchase state account and its address can be obtained from the listing derired to be purchased. 

A typical configuration would like like the following: 

![Screenshot from 2023-01-17 01-15-01](https://user-images.githubusercontent.com/97003046/212823436-a9255269-022d-4fb1-909d-15b2bac603bf.png)

Running the command

    dex-cli purchase-future-listing

one sees, upon a successful transaction, a display on the console similar to:

![Screenshot from 2023-01-17 01-15-45](https://user-images.githubusercontent.com/97003046/212823546-ff627b91-6f68-45e3-a103-8cbee4d93b7a.png)











