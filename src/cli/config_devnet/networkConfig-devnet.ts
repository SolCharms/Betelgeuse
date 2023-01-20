type NetworkConfig = {
    clusterApiUrl: string,
    signerKeypair: string
}

// // Derivative Dex Seller Account
// export const networkConfig: NetworkConfig =
//     {
//         clusterApiUrl: "https://api.devnet.solana.com",
//         signerKeypair: "/home/SolCharms/.config/solana/devnet-derivative-dex/seller_1.json"
//     }

// // Derivative Dex Purchaser Account
// export const networkConfig: NetworkConfig =
//     {
//         clusterApiUrl: "https://api.devnet.solana.com",
//         signerKeypair: "/home/SolCharms/.config/solana/devnet-derivative-dex/purchaser_1.json"
//     }

// Derivative Dex Manager Account
export const networkConfig: NetworkConfig =
    {
        clusterApiUrl: "https://api.devnet.solana.com",
        signerKeypair: "/home/SolCharms/.config/solana/devnet-derivative-dex/derivative_dex_manager.json"
    }
