const network = (import.meta.env.VITE_NETWORK ?? "devnet") as
  | "devnet"
  | "testnet"
  | "mainnet";

function pick<T>(dev: T, test: T, main: T): T {
  switch (network) {
    case "devnet":
      return dev;
    case "testnet":
      return test;
    case "mainnet":
      return main;
    default:
      return dev;
  }
}

function assertEnv(name: string, val: string): string {
  if (!val || val === "0x0") {
    throw new Error(`Missing or placeholder env var: ${name}`);
  }
  return val;
}

export const DEVNET_PACKAGE_ID = pick(
  import.meta.env.VITE_DEVNET_PACKAGE_ID,
  import.meta.env.VITE_TESTNET_PACKAGE_ID,
  import.meta.env.VITE_MAINNET_PACKAGE_ID,
);
export const DEVNET_REGISTRY_ID = pick(
  import.meta.env.VITE_DEVNET_REGISTRY_ID,
  import.meta.env.VITE_TESTNET_REGISTRY_ID,
  import.meta.env.VITE_MAINNET_REGISTRY_ID,
);
export const DEVNET_SHRINE_ID = pick(
  import.meta.env.VITE_DEVNET_SHRINE_ID,
  import.meta.env.VITE_TESTNET_SHRINE_ID,
  import.meta.env.VITE_MAINNET_SHRINE_ID,
);

// Validate early
assertEnv("PACKAGE_ID", DEVNET_PACKAGE_ID);
assertEnv("REGISTRY_ID", DEVNET_REGISTRY_ID);
assertEnv("SHRINE_ID", DEVNET_SHRINE_ID);
