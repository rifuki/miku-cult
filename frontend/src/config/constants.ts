export const DEVNET_PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID;
export const DEVNET_REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID;
export const DEVNET_SHRINE_ID = import.meta.env.VITE_SHRINE_ID;

if (!DEVNET_PACKAGE_ID || !DEVNET_SHRINE_ID)
  throw new Error(
    "Missing environment variables: VITE_PACKAGE_ID or VITE_SHRINE_ID",
  );
