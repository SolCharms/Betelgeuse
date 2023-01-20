export type DerivativeDex = {
  "version": "0.1.0",
  "name": "derivative_dex",
  "instructions": [
    {
      "name": "initDerivativeDex",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "derivativeDexManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "tradingFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTradingFee",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newDerivativeDexTradingFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "payoutFromTreasury",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        },
        {
          "name": "minimumBalanceForRentExemption",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeDefunctListing",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeDerivativeDex",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "tokenSwapRatiosVec",
          "type": {
            "vec": {
              "defined": "TokenSwapRatios"
            }
          }
        },
        {
          "name": "listingAmount",
          "type": "u64"
        },
        {
          "name": "contractExpiresTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "supplementFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "supplementalListingAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawUnsoldFuturesTokens",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureDestinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        }
      ]
    },
    {
      "name": "purchaseFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentSourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "purchaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "listPurchasedFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "tokenSwapRatiosVec",
          "type": {
            "vec": {
              "defined": "TokenSwapRatios"
            }
          }
        },
        {
          "name": "listingAmount",
          "type": "u64"
        },
        {
          "name": "listingExpiresTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "supplementPurchasedFuturesListing",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPurchasedFuturesListing",
          "type": "u8"
        },
        {
          "name": "supplementalListingAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closePurchasedFuturesListing",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPurchasedFuturesListing",
          "type": "u8"
        }
      ]
    },
    {
      "name": "purchasePurchasedFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listingPurchaserFuturePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listingPurchaser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "listingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listingPurchaserTokenAccountSource",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaserTokenAccountDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listingPurchaserFuturesContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPaymentTokenAccount",
          "type": "u8"
        },
        {
          "name": "bumpPurchasedFuturesListing",
          "type": "u8"
        },
        {
          "name": "listingPurchaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createSettlementContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "settlementContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "purchasedTokenAmount",
          "type": "u64"
        },
        {
          "name": "paymentTokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSettlementContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "settlementContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpSettlementContract",
          "type": "u8"
        }
      ]
    },
    {
      "name": "acceptSettlementContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccountPurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccountCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenAccountCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenAccountPurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "settlementContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPaymentToken",
          "type": "u8"
        },
        {
          "name": "bumpListedToken",
          "type": "u8"
        },
        {
          "name": "bumpSettlementContract",
          "type": "u8"
        }
      ]
    },
    {
      "name": "settleFuturesContractPurchase",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccountCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenAccountPurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPaymentToken",
          "type": "u8"
        },
        {
          "name": "bumpListedToken",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "derivativeDex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "derivativeDexManager",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexAuthority",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexAuthorityBumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "derivativeDexTreasury",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexTradingFee",
            "type": "u64"
          },
          {
            "name": "futuresContractsCount",
            "type": "u64"
          },
          {
            "name": "purchasedFuturesContractsListingsCount",
            "type": "u64"
          },
          {
            "name": "settlementContractCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "futuresContractPurchase",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "futuresContract",
            "type": "publicKey"
          },
          {
            "name": "futurePurchaser",
            "type": "publicKey"
          },
          {
            "name": "futureAmountPurchased",
            "type": "u64"
          },
          {
            "name": "futurePaymentTokenMint",
            "type": "publicKey"
          },
          {
            "name": "futurePaymentTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "futurePaymentTokenAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "futuresContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "derivativeDex",
            "type": "publicKey"
          },
          {
            "name": "futureCreator",
            "type": "publicKey"
          },
          {
            "name": "futureSeed",
            "type": "publicKey"
          },
          {
            "name": "futureTokenMint",
            "type": "publicKey"
          },
          {
            "name": "futureTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "futureListedAmount",
            "type": "u64"
          },
          {
            "name": "futurePurchasedAmount",
            "type": "u64"
          },
          {
            "name": "futureCreatedTs",
            "type": "u64"
          },
          {
            "name": "futureExpiresTs",
            "type": "u64"
          },
          {
            "name": "futureTokenSwapRatiosVec",
            "type": {
              "vec": {
                "defined": "TokenSwapRatios"
              }
            }
          }
        ]
      }
    },
    {
      "name": "purchasedFuturesListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "futuresContractPurchase",
            "type": "publicKey"
          },
          {
            "name": "listingAmount",
            "type": "u64"
          },
          {
            "name": "listingCreatedTs",
            "type": "u64"
          },
          {
            "name": "listingExpiresTs",
            "type": "u64"
          },
          {
            "name": "listingTokenSwapRatiosVec",
            "type": {
              "vec": {
                "defined": "TokenSwapRatios"
              }
            }
          }
        ]
      }
    },
    {
      "name": "settlementContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "futuresContract",
            "type": "publicKey"
          },
          {
            "name": "futuresContractPurchase",
            "type": "publicKey"
          },
          {
            "name": "purchasedTokenAmount",
            "type": "u64"
          },
          {
            "name": "paymentTokenAmount",
            "type": "u64"
          },
          {
            "name": "futureCreatorSignedBoolean",
            "type": "bool"
          },
          {
            "name": "futurePurchaserSignedBoolean",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TokenSwapRatios",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "acceptedTradeToken",
            "type": "publicKey"
          },
          {
            "name": "listingTokenRatioAmount",
            "type": "u64"
          },
          {
            "name": "tradeTokenRatioAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

export const IDL: DerivativeDex = {
  "version": "0.1.0",
  "name": "derivative_dex",
  "instructions": [
    {
      "name": "initDerivativeDex",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "derivativeDexManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "tradingFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTradingFee",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newDerivativeDexTradingFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "payoutFromTreasury",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        },
        {
          "name": "minimumBalanceForRentExemption",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeDefunctListing",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeDerivativeDex",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "tokenSwapRatiosVec",
          "type": {
            "vec": {
              "defined": "TokenSwapRatios"
            }
          }
        },
        {
          "name": "listingAmount",
          "type": "u64"
        },
        {
          "name": "contractExpiresTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "supplementFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "supplementalListingAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawUnsoldFuturesTokens",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureDestinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        }
      ]
    },
    {
      "name": "purchaseFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentSourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "purchaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "listPurchasedFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "tokenSwapRatiosVec",
          "type": {
            "vec": {
              "defined": "TokenSwapRatios"
            }
          }
        },
        {
          "name": "listingAmount",
          "type": "u64"
        },
        {
          "name": "listingExpiresTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "supplementPurchasedFuturesListing",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPurchasedFuturesListing",
          "type": "u8"
        },
        {
          "name": "supplementalListingAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closePurchasedFuturesListing",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPurchasedFuturesListing",
          "type": "u8"
        }
      ]
    },
    {
      "name": "purchasePurchasedFuturesContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listingPurchaserFuturePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "purchasedFuturesListing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listingPurchaser",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "listingTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listingPurchaserTokenAccountSource",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaserTokenAccountDestination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listingPurchaserFuturesContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPaymentTokenAccount",
          "type": "u8"
        },
        {
          "name": "bumpPurchasedFuturesListing",
          "type": "u8"
        },
        {
          "name": "listingPurchaseAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createSettlementContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "settlementContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "purchasedTokenAmount",
          "type": "u64"
        },
        {
          "name": "paymentTokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSettlementContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "settlementContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpSettlementContract",
          "type": "u8"
        }
      ]
    },
    {
      "name": "acceptSettlementContract",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccountPurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccountCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenAccountCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenAccountPurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "settlementContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPaymentToken",
          "type": "u8"
        },
        {
          "name": "bumpListedToken",
          "type": "u8"
        },
        {
          "name": "bumpSettlementContract",
          "type": "u8"
        }
      ]
    },
    {
      "name": "settleFuturesContractPurchase",
      "accounts": [
        {
          "name": "derivativeDex",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "derivativeDexAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "derivativeDexTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futuresContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureSeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futuresContractPurchase",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futurePaymentTokenAccountCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "futureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "futureTokenAccountPurchaser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpDexAuth",
          "type": "u8"
        },
        {
          "name": "bumpDexTreasury",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContract",
          "type": "u8"
        },
        {
          "name": "bumpFuturesContractPurchase",
          "type": "u8"
        },
        {
          "name": "bumpPaymentToken",
          "type": "u8"
        },
        {
          "name": "bumpListedToken",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "derivativeDex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "derivativeDexManager",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexAuthority",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexAuthorityBumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "derivativeDexTreasury",
            "type": "publicKey"
          },
          {
            "name": "derivativeDexTradingFee",
            "type": "u64"
          },
          {
            "name": "futuresContractsCount",
            "type": "u64"
          },
          {
            "name": "purchasedFuturesContractsListingsCount",
            "type": "u64"
          },
          {
            "name": "settlementContractCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "futuresContractPurchase",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "futuresContract",
            "type": "publicKey"
          },
          {
            "name": "futurePurchaser",
            "type": "publicKey"
          },
          {
            "name": "futureAmountPurchased",
            "type": "u64"
          },
          {
            "name": "futurePaymentTokenMint",
            "type": "publicKey"
          },
          {
            "name": "futurePaymentTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "futurePaymentTokenAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "futuresContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "derivativeDex",
            "type": "publicKey"
          },
          {
            "name": "futureCreator",
            "type": "publicKey"
          },
          {
            "name": "futureSeed",
            "type": "publicKey"
          },
          {
            "name": "futureTokenMint",
            "type": "publicKey"
          },
          {
            "name": "futureTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "futureListedAmount",
            "type": "u64"
          },
          {
            "name": "futurePurchasedAmount",
            "type": "u64"
          },
          {
            "name": "futureCreatedTs",
            "type": "u64"
          },
          {
            "name": "futureExpiresTs",
            "type": "u64"
          },
          {
            "name": "futureTokenSwapRatiosVec",
            "type": {
              "vec": {
                "defined": "TokenSwapRatios"
              }
            }
          }
        ]
      }
    },
    {
      "name": "purchasedFuturesListing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "futuresContractPurchase",
            "type": "publicKey"
          },
          {
            "name": "listingAmount",
            "type": "u64"
          },
          {
            "name": "listingCreatedTs",
            "type": "u64"
          },
          {
            "name": "listingExpiresTs",
            "type": "u64"
          },
          {
            "name": "listingTokenSwapRatiosVec",
            "type": {
              "vec": {
                "defined": "TokenSwapRatios"
              }
            }
          }
        ]
      }
    },
    {
      "name": "settlementContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "futuresContract",
            "type": "publicKey"
          },
          {
            "name": "futuresContractPurchase",
            "type": "publicKey"
          },
          {
            "name": "purchasedTokenAmount",
            "type": "u64"
          },
          {
            "name": "paymentTokenAmount",
            "type": "u64"
          },
          {
            "name": "futureCreatorSignedBoolean",
            "type": "bool"
          },
          {
            "name": "futurePurchaserSignedBoolean",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TokenSwapRatios",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "acceptedTradeToken",
            "type": "publicKey"
          },
          {
            "name": "listingTokenRatioAmount",
            "type": "u64"
          },
          {
            "name": "tradeTokenRatioAmount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
