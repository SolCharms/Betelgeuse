# Betelgeuse 
 ### A Decentralized Exchange of Fractionalizable Derivatives of SPL-Tokens using Rationalized Token-Swap Ratios

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/ ).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/Betelgeuse/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile:

    alias dex-cli='ts-node ~/Development/Solana/Betelgeuse/src/cli/derivative-dex-cli.ts'

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

To initialize a derivative dex we need to have decided on only one parameter - what is the derivative dex trading fee in Lamports. This can be any integer value greater than or equal to zero, and will be collected from both contract creators (sellers) and contract engagers (purchasers) at the moment of settlement of the contract. 

Once decided upon, in this case I'll be using 5000 Lamports, we can initialize a derivative dex from the terminal with

    dex-cli init-dex -f 5000
   
where the -f option is necessary and represents the value of the derivative dex trading fee. The output to the terminal should be something like:

![Screenshot from 2023-01-15 19-51-31](https://user-images.githubusercontent.com/97003046/212576946-6f8f4df2-4bbe-4dee-a2e6-56d8ce04b386.png)

We can view the derivative dex state account at any time by using the command:

    dex-cli fetch-dex-by-key -x 5Dk5f6Jdk15Ah4wftzZ72AxDRczrKM4vg3UC9ta8zPMR

where the -x option is necessary and whose input requires the derivative dex account pubkey. The output to the terminal will look like: 

![Screenshot from 2023-01-15 19-56-14](https://user-images.githubusercontent.com/97003046/212577261-a783ae85-1009-4084-9234-815525de0066.png)

If desired, the derivative dex trading fee can be changed using 

    dex-cli update-trading-fee -x 5Dk5f6Jdk15Ah4wftzZ72AxDRczrKM4vg3UC9ta8zPMR -f 100000

with the -x and -f options as before. Here, you can see the confirmation output 

![Screenshot from 2023-01-15 20-01-03](https://user-images.githubusercontent.com/97003046/212577625-855070b3-509a-46cc-ac18-9f653ca08965.png)

and the updated derivative dex state account reflecting the change

![Screenshot from 2023-01-15 20-02-12](https://user-images.githubusercontent.com/97003046/212577689-93f2ccab-72e9-4b1c-bd8d-6f4c9c940676.png)

I've gone ahead and changed the fee back to 5000 Lamports. As an exercise, you should try and do the same.

## Creating a Futures Contract

To create a futures contract we first need to go back to the network configuration file and reconfigure it using the appropriate keypair. This is not stictly necessary, but I've minted and distributed a handful (or two) of SPL-tokens to play with to multiple wallets before starting the demo to simulate the full experience anyways. Generally, users will only have to set the network configuration once and forget about it. 

Here is the updated network configuration:

![Screenshot from 2023-01-15 20-20-16](https://user-images.githubusercontent.com/97003046/212579431-19dfde16-e745-4303-bcb6-301543548ebf.png)




















