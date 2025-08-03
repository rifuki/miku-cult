const activeNetwork = import.meta.env.VITE_NETWORK || "devnet";

function assertEnv(
  name: string,
  val: string | undefined,
  network: "devnet" | "testnet" | "mainnet",
): string {
  console.log(`Checking ${name}:`, {
    val,
    network,
    activeNetwork,
    isOptional: network !== activeNetwork || network === "mainnet",
  });

  const isOptional = network !== activeNetwork || network === "mainnet";
  if (!val || val === "0x0" || val === "") {
    if (isOptional) {
      return "0xPLACEHOLDER";
    }
    throw new Error(
      `Missing required env var for active network '${activeNetwork}': ${name}`,
    );
  }
  return val;
}

export const DEVNET_IDS = {
  packageId: assertEnv(
    "VITE_DEVNET_PACKAGE_ID",
    import.meta.env.VITE_DEVNET_PACKAGE_ID,
    "devnet", // Konteks: ini variabel devnet
  ),
  registryId: assertEnv(
    "VITE_DEVNET_REGISTRY_ID",
    import.meta.env.VITE_DEVNET_REGISTRY_ID,
    "devnet",
  ),
  shrineId: assertEnv(
    "VITE_DEVNET_SHRINE_ID",
    import.meta.env.VITE_DEVNET_SHRINE_ID,
    "devnet",
  ),
};

export const TESTNET_IDS = {
  packageId: assertEnv(
    "VITE_TESTNET_PACKAGE_ID",
    import.meta.env.VITE_TESTNET_PACKAGE_ID,
    "testnet", // Konteks: ini variabel testnet
  ),
  registryId: assertEnv(
    "VITE_TESTNET_REGISTRY_ID",
    import.meta.env.VITE_TESTNET_REGISTRY_ID,
    "testnet",
  ),
  shrineId: assertEnv(
    "VITE_TESTNET_SHRINE_ID",
    import.meta.env.VITE_TESTNET_SHRINE_ID,
    "testnet",
  ),
};

export const MAINNET_IDS = {
  packageId: assertEnv(
    "VITE_MAINNET_PACKAGE_ID",
    import.meta.env.VITE_MAINNET_PACKAGE_ID,
    "mainnet", // Konteks: ini variabel mainnet
  ),
  registryId: assertEnv(
    "VITE_MAINNET_REGISTRY_ID",
    import.meta.env.VITE_MAINNET_REGISTRY_ID,
    "mainnet",
  ),
  shrineId: assertEnv(
    "VITE_MAINNET_SHRINE_ID",
    import.meta.env.VITE_MAINNET_SHRINE_ID,
    "mainnet",
  ),
};
console.log("Active Network:", import.meta.env.VITE_NETWORK);
console.log("Testnet Package ID:", import.meta.env.VITE_TESTNET_PACKAGE_ID);
console.log("Testnet Regsitry ID:", import.meta.env.VITE_TESTNET_REGISTRY_ID);
console.log("Testnet Shrine ID:", import.meta.env.VITE_TESTNET_SHRINE_ID);
