# Betelgeuse 
 ### A Decentralized Exchange of Fractionalizable Derivatives of SPL-Tokens using Rationalized Token-Swap Ratios

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/ ).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/Betelgeuse/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile:

    alias dex-cli='ts-node ~/Development/Solana/Betelgeuse/src/cli/derivative-dex-cli.ts'

The remainder of this demonstration assumes a familiarity with Solana's CLI.

## Configuration
We need to configure the .ts files in ../Betelgeuse/src/cli/config_devnet/

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

Before we populate the fields of the futures creator configuration file, we must first understand what it is we are trying to do, so I grabbed a list of some of Solana's most popular tokens (as of right now) and placed their current value (in USD) next to them.

![Screenshot from 2023-01-15 23-25-50](https://user-images.githubusercontent.com/97003046/212598541-346ee214-6d0e-4e3a-a924-6286f42830ad.png)

One of the many major use cases for a futures contract is speculation. Suppose an investor speculates that certain SPL-Tokens are under-valued and that at some point in the future these tokens will significantly appreciate in USD value. Suppose one of these tokens speculated to be under-valued is RAYDIUM.

At the current prices 1 RAYDIUM = 0.240401 USDC. Suppose the investor speculates that 1 RAYDIUM will be worth well north of 0.35 USDC, in say, 30 days and wants to set up a futures contract requesting that price. This is equivalent to saying 100 RAYDIUM = 35 USDC and in such a form, we have rationalized the coffecients of the Token Swap Ratio (i.e. they are integer-valued).

The investor can create a futures contract depositing any amount N of USDC (into a PDA token account) requesting a Token Swap Ratio of USDC to RAYDIUM of 35:100. However, the investor is not limited to a single request. If the investor believes that BONFIDA, SERUM, and AURORY are all also under-valued, the investor can create a futures contract requesting purchases in terms of Rationalized Token Swap Ratios for each of those tokens.

A potential futures contract in such a case would look like: 

![Screenshot from 2023-01-16 00-40-04](https://user-images.githubusercontent.com/97003046/212606173-f3e2db1b-4488-442a-a3a5-c918ae813d5c.png)

There is quite a bit to parse here! The first thing to note is that the futures contract is a PDA account. Since for each derivative dex, any wallet can create any number of futures contracts, to ensure a unique futures contract account is generated each time, there must be a unique seed byte array. This is acheived by providing the seed pubkey. To automate this process from say, a front-end application, one can call KeyPair.generate() and provide the necessary pubkey. The pubkey will be stored in the futures contract's state account and storing the private key is not necessary.

Secondly, any SPL-Token amount (and Sol too) will always be listed in the token's smallest denomination. That is, the program recognizes an entry of 1 as 1 Lamport, not 1 Sol. As USDC has 6 decimals, the value 100,000,000 in the listing amount field is actually just 100 USDC (in human terms). And this brings us to the TokenSwapRatio of USDC:AURY.

In the posted price graphic it would appear that the speculator intends to secure a futures contract that sells 80 USDC for 100 AURY. However, recall that all SPL-Tokens are observed by the program in their smallest denomination, and thus 80 USDC = 80,000,000 and 100 AURY = 100,000,000,000. Factoring by 1,000,000 on both sides, we are left with a ratio of 80:100,000. This increased factor of 1000 results from the fact that AURY has 9 decimals, whereas all the other tokens previously considered have 6, hence having to move the decimal a further 3 places to the right. 

Now that the ratios are understood, we should really put them in terms of their smallest common denominator as follows: 

![Screenshot from 2023-01-16 00-51-46](https://user-images.githubusercontent.com/97003046/212607552-b8d5b9ef-66e0-46fe-979a-67bee8b86442.png)

Running the command

    dex-cli create-future

one shall receive an output to the terminal similar to the following:

![Screenshot from 2023-01-16 01-12-17](https://user-images.githubusercontent.com/97003046/212610084-64d64f7f-5981-4a83-92ac-a555c448cf92.png)

We can view the newly created futures contract state account by doing:

    dex-cli fetch-future-by-key -k Avoz6iYsQCnbtg6AxpnghGPAG8YGb244eEJeyi2aTPKk
    
where the option -k is necessary and requires the pubkey of the futures contract state account. The output from the terminal displays the futures contract with all of the requested rationalized Token Swap Ratios.

![Screenshot from 2023-01-16 01-21-57](https://user-images.githubusercontent.com/97003046/212611393-746f6c6f-6178-4967-8d02-d1a2e2f1e96a.png)

So the obvious question remains. And that is 'why go through all this trouble to establish a protocol based on these "rationalized Token Swap Ratios" in the first place?' Well, for one, it's 'trouble' for a human, but these types of calculations are exactly where computers are at their best. But that's not the real reason anyways. The real reason to build the protocol with such base complexity is because it allows the futures contracts to be fractionalized. 

That's right, any investor can come along and buy the whole or any portion of the futures contract as long as the established rationalized Token Swap Ratios are respected. 













