const DEFAULT_TX_EXPLORER_BASE = "https://sepolia.basescan.org/tx/";

export function txExplorerUrl(txHash: string): string {
  const base = (
    process.env.NEXT_PUBLIC_BLOCK_EXPLORER_BASE ?? DEFAULT_TX_EXPLORER_BASE
  ).replace(/\/?$/, "/");
  return `${base}${txHash.replace(/^\/+/, "")}`;
}
