import { createNetworkConfig } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

import {
  DEVNET_PACKAGE_ID,
  DEVNET_REGISTRY_ID,
  DEVNET_SHRINE_ID,
} from "@/config/constants";

export const { networkConfig, useNetworkVariable } = createNetworkConfig({
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: {
      packageId: DEVNET_PACKAGE_ID,
      registryId: DEVNET_REGISTRY_ID,
      shrineId: DEVNET_SHRINE_ID,
    },
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      packageId: "0xNONE",
      registryId: "0xNONE",
      shrineId: "0xNONE",
    },
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    variables: {
      packageId: "0xNONE",
      registryId: "0xNONE",
      shrineId: "0xNONE",
    },
  },
});
