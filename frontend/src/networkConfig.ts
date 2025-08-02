// src/networkConfig.ts
import { createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { DEVNET_IDS, TESTNET_IDS, MAINNET_IDS } from "@/config/constants";

export const { networkConfig, useNetworkVariable } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: DEVNET_IDS, // Use the devnet variables object
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: TESTNET_IDS, // Use the testnet variables object
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    variables: MAINNET_IDS, // Use the mainnet variables object
  },
});
