import type { ReactNode } from "react";

import QueryProvider from "./query-provider";
import SuiProvider from "./sui-provider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SuiProvider>{children}</SuiProvider>
    </QueryProvider>
  );
}
