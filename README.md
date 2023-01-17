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

where the -k option is necessary and whose input requires the derivative dex account pubkey. The output to the terminal will look like: 

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

![Screenshot from 2023-01-16 00-40-04](https://user-images.githubusercontent.com/97003046/212606173-f3e2db1b-4488-442a-a3a5-c918ae813d5c.png)

There is quite a bit to parse here! The first thing to note is that the futures contract is a PDA account. Since for each derivative dex, any wallet can create any number of futures contracts, to ensure a unique futures contract account is generated each time, there must be a unique seed byte array. This is acheived by providing the seed pubkey. To automate this process from say, a front-end application, one can call KeyPair.generate() and provide the necessary pubkey. The pubkey will be stored in the futures contract's state account and storing the private key is not necessary.

Secondly, any SPL-Token amount (and Sol too) will always be listed in the token's smallest denomination. That is, the program recognizes an entry of 1 as 1 Lamport, not 1 Sol. As USDC has 6 decimals, the value 100,000,000 in the listing amount field is actually just 100 USDC (in human readable terms). And this brings us to the Token Swap Ratio of USDC:AURY.

In the posted price graphic it would appear that the speculator intends to secure a futures contract that sells 80 USDC for 100 AURY. However, recall that all SPL-Tokens are observed by the program in their smallest denomination, and thus 80 USDC = 80,000,000 and 100 AURY = 100,000,000,000. Factoring by 1,000,000 on both sides, we are left with a ratio of 80:100,000. This increased factor of 1000 for the AURY token results from the fact that AURY has 9 decimals, whereas all the other tokens previously considered have 6, hence having to move the decimal a further 3 places to the right. 

Now that the ratios are understood, we should really put them in terms of their smallest common denominator as follows: 

![Screenshot from 2023-01-16 00-51-46](https://user-images.githubusercontent.com/97003046/212607552-b8d5b9ef-66e0-46fe-979a-67bee8b86442.png)

Running the command

    dex-cli create-future

one shall receive an output to the terminal similar to the following:

![Screenshot from 2023-01-16 01-12-17](https://user-images.githubusercontent.com/97003046/212610084-64d64f7f-5981-4a83-92ac-a555c448cf92.png)

We can view the newly created futures contract state account by doing:

    dex-cli fetch-future-by-key -k Avoz6iYsQCnbtg6AxpnghGPAG8YGb244eEJeyi2aTPKk
    
where the option -k is necessary and requires the pubkey of the futures contract state account. The output from the terminal displays the futures contract state account with all of the requested rationalized Token Swap Ratios.

![Screenshot from 2023-01-16 01-21-57](https://user-images.githubusercontent.com/97003046/212611393-746f6c6f-6178-4967-8d02-d1a2e2f1e96a.png)

Moreover, the futureTokenAccount field lists the address of the PDA token account storing the contracted futures tokens. Running

    dex-cli fetch-token-account -t USDCrw1xMH2J8VqeTmn75h1GpiPA5mKt5CpR6hUcqrz -s F9QCcLfGbYHtsEt7jghfuRXq2QH3YjdGqyGdP5pQ3eHd
    
where -t and -s are the mint address and token account address respectively, one can see the token account state information including it's balance.

![Screenshot from 2023-01-16 09-19-13](https://user-images.githubusercontent.com/97003046/212699621-fc2a00e0-0b1d-459c-80aa-f444bd5e856d.png)

So the obvious question remains. And that is 'why go through all this trouble to establish a protocol based on these "rationalized Token Swap Ratios" in the first place?' Well, for one, it's 'trouble' for a human, but these types of calculations are exactly where computers are at their best. But that's not the real reason anyways. The real reason to build the protocol with such base complexity is because it allows the futures contracts to be fractionalized. 

That's right, any investor can come along and buy the whole or any portion of the futures contract as long as the established rationalized Token Swap Ratios are respected. Before moving to the purchase of futures contracts, I'll go ahead and set up three other futures contracts (for two new users and a second for the first user above). 

Executing the command 

    dex-cli fetch-all-futures -x 5Dk5f6Jdk15Ah4wftzZ72AxDRczrKM4vg3UC9ta8zPMR

one obtains the following output (data intentionally compressed) where one can see all four created futures contracts. 

![Screenshot from 2023-01-16 11-29-26](https://user-images.githubusercontent.com/97003046/212727287-e6a0bd58-12e4-4b24-a13d-9ab27c8a9a7e.png)

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

![Screenshot from 2023-01-16 14-29-06](https://user-images.githubusercontent.com/97003046/212753309-b4438ecc-7952-4b3a-8d86-0b4e80db9826.png)

Notice that the purchaser has configured the file to purchase from the futures contract with account pubkey Avoz6iYsQCnbtg6AxpnghGPAG8YGb244eEJeyi2aTPKk and will purchase the contract using the SRMwiToVEf5BgxXK7e6DmsYRyw24PT9aPQyQYCakUWW token. As this contract lists a USDC:SERUM Token Swap Ratio of 29:50, the field purchaseAmount must be an integer multiple of 29. The purchaser has entered 4,350,000 which is 4.35 USDC. 

I've also update the keypair path in the network configuration file to the keypair of the "purchaser."

Entering the command 

    dex-cli purchase-future
    
one will obtain a display to the terminal similar to the following: 

![Screenshot from 2023-01-16 14-43-49](https://user-images.githubusercontent.com/97003046/212755132-ad59f9df-0ef8-4f29-8807-9f666404b1cf.png)

One can then do

    dex-cli fetch-future-purchase-by-key -k GTYxfipyLXM3Hchq5rbVPXuSpTgXLNMY7TeMceJ7aj12

to obtain the futures contract purchase state account. The output to the terminal will look something like:

![Screenshot from 2023-01-16 15-54-12](https://user-images.githubusercontent.com/97003046/212764187-c9be3c9a-85c3-420b-a3e3-f04e120c3ffe.png)

As you can see, the PDA token account address holding the SERUM tokens as payment for the futures contract is displayed in the futurePaymentTokenAccount field and the future payment token amount of 7,500,000 = 150,000 * 50 is correct as the USDC:SRM Token Swap Ratio in the futures contract is 29:50. In this way, one can say that the purchaser purchased 150,000 units of the baseline ratio. Moreover, this futures contract purchase state account acts as a receipt of purchase of the futures contract.

Displaying again the futures contract for reference, 

![Screenshot from 2023-01-16 16-01-28](https://user-images.githubusercontent.com/97003046/212765099-d227e922-6642-462f-b7bb-b655fc2c9fb6.png)

we see that the futures contract state account has been updated to reflect the purchased amount of 7,500,000. This book-keeping mechanism ensures that no more than the listed amount in the futures contract can be retained in contract purchases.

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

we see the 3 futures contract purchase state accounts. 

![Screenshot from 2023-01-16 18-16-47](https://user-images.githubusercontent.com/97003046/212778874-ad0d181c-35f2-436b-8d86-0bd8fac4f644.png)

The futures contract listing can continue to sell in this fractionalized way to any number of users until all tokens are allocated to purchases. 

## Listing a Purchased Futures Contract

Suppose now one of the purchasers wants to liquidate all or some of their position on a certain futures contract purchase but does not want to wait until that contract's expiry. What to do? Well, the purchaser has the option of listing all or some of their purchased futures contract for sale. This listing can be bought in whole or in part, much like the original futures contract, allowing for fractionalized sales of purchased futures contract listings as well. This is due to the fact that the listing of the purchased futures contract will be provided with its own unique array of Token Swap Ratios, independent in mints and ratios of the ones present in the futures contract itself. 

However, in the case of a purchase of a futures contract purchase listing the token amount due to the lister is transferred instantly. In return, the lister's PDA-stored payment tokens (the ones used to pay for the futures contract itself) are transferred to another PDA for which the subsequent purchaser has authority. The original purchaser's futures contract purchase state account is then modified to reflect the changes (or closed in the case where it no longer has any tokens left associating it to the futures contract). A new futures contract purchase is created for the subsequent purchaser honouring the original terms of the contract. 

We will go through a demonstration of this second layer of fractionalized interaction.

First, we need to modify the configuration file (../config_devnet/listPurchasedFuturesConfig-devnet.ts). All of the information required can be found in the futures contract purchase state account of the purchase you want to list except for the futureExpiresTs field of the futures contract. The configuration file should look something like this: 

![Screenshot from 2023-01-16 19-17-21](https://user-images.githubusercontent.com/97003046/212783578-2a7dd6e6-30f9-4763-a488-d8a07112e6ba.png)

As you can see, I've placed one half of the futures contract purchased (5,000,000) into the listing and have made it so that the listing expires 1 second before the futures contract does. Moreover, do not forget that the ratios must be converted to account for the decimal place difference between the tokens. 

Don't forget to change the network configuration file to the appropriate keypair and do:

    dex-cli list-purchased-future

The output to the terminal should look like the following:

![Screenshot from 2023-01-16 19-49-14](https://user-images.githubusercontent.com/97003046/212786451-45e2465e-8006-4202-986c-73255cd052a7.png)

We can view the purchased futures contract listing state account by doing:

    dex-cli fetch-listing-by-key -k 3vTmxXqGH1vvdhtbsK9rkzZP4Ri82Z9Yp1eVm3gv5eq5

with output to the terminal looking like:

![Screenshot from 2023-01-16 20-14-00](https://user-images.githubusercontent.com/97003046/212788590-16b3a51d-f317-48f8-916f-dc9c0206da89.png)

Now, a futures contract purchase state account can have at most one listing associated to it, but this listing can be supplemented with remaining unlisted purchased futures contract tokens. Running 

    dex-cli supplement-future-listing -a 1000000

where the -a option is the supplemental listing amount, one obtains a confirmation message output to the terminal similar to: 

![Screenshot from 2023-01-16 20-23-20](https://user-images.githubusercontent.com/97003046/212789474-a1739c0a-d65c-497e-a227-3b3710201911.png)























