import type { ReactNode } from "react";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

import { networkConfig } from "@/networkConfig";

export default function SuiProvider({ children }: { children: ReactNode }) {
  return (
    <SuiClientProvider networks={networkConfig}>
      <WalletProvider autoConnect>{children}</WalletProvider>
    </SuiClientProvider>
  );
}
