import { createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

import { DEVNET_IDS, TESTNET_IDS, MAINNET_IDS } from "@/config/constants";

export const { networkConfig, useNetworkVariable } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: DEVNET_IDS,
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: TESTNET_IDS,
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    variables: MAINNET_IDS,
  },
});
