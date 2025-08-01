/// <reference types="vite/client" />

type Network = "devnet" | "testnet" | "mainnet";

interface ImportMetaEnv {
  readonly VITE_NETWORK?: Network;

  // Devnet
  readonly VITE_DEVNET_PACKAGE_ID: string;
  readonly VITE_DEVNET_REGISTRY_ID: string;
  readonly VITE_DEVNET_SHRINE_ID: string;

  // Testnet
  readonly VITE_TESTNET_PACKAGE_ID: string;
  readonly VITE_TESTNET_REGISTRY_ID: string;
  readonly VITE_TESTNET_SHRINE_ID: string;

  // Mainnet
  readonly VITE_MAINNET_PACKAGE_ID: string;
  readonly VITE_MAINNET_REGISTRY_ID: string;
  readonly VITE_MAINNET_SHRINE_ID: string;

  // Pinata / secrets
  readonly VITE_PINATA_JWT: string;
  readonly VITE_PINATA_API_KEY: string;
  readonly VITE_PINATA_API_SECRET: string;
  readonly VITE_PINATA_GATEWAY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
