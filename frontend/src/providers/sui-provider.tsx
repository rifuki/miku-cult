import type { ReactNode } from "react";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

import { networkConfig } from "@/networkConfig";

export default function SuiProvider({ children }: { children: ReactNode }) {
  type Network = "devnet" | "testnet" | "mainnet";
  const defaultNetwork = (import.meta.env.VITE_NETWORK || "testnet") as Network;

  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
      <WalletProvider autoConnect>{children}</WalletProvider>
    </SuiClientProvider>
  );
}
