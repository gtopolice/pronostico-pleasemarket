/** Public Base Sepolia RPC; override via NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL at build time. */
export const BASE_SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL?.trim() || "https://sepolia.base.org";

export function isTestnetFaucetEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_ENABLE_TESTNET_FAUCET ?? "true";
  return raw.toLowerCase() !== "false";
}
