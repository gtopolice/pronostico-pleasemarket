import { createPublicClient, http, isAddress } from "viem";
import { baseSepolia } from "viem/chains";

import { BASE_SEPOLIA_RPC_URL } from "@/lib/base-sepolia-rpc";

const defaultFaucetAddress = "0xd23b0E459f656D61f65eA2949fF4347fc411b4a6";
const defaultFaucetCalldata = "0x9f678cca";

const faucetAddressEnv = process.env.NEXT_PUBLIC_MUSDC_FAUCET_ADDRESS;
const faucetCalldataEnv = process.env.NEXT_PUBLIC_MUSDC_FAUCET_CALLDATA;

export const MUSDC_FAUCET_ADDRESS = (() => {
  if (faucetAddressEnv && isAddress(faucetAddressEnv)) return faucetAddressEnv;
  return defaultFaucetAddress;
})();

export const MUSDC_FAUCET_CALLDATA = (() => {
  if (faucetCalldataEnv?.startsWith("0x")) return faucetCalldataEnv;
  return defaultFaucetCalldata;
})();

export function parseClaimError(error: unknown): string {
  if (!error) return "Unknown transaction error.";
  if (typeof error === "string") return error;

  const message =
    (error as { shortMessage?: string; message?: string }).shortMessage ??
    (error as { message?: string }).message ??
    "Unknown transaction error.";

  if (message.includes("User rejected") || message.includes("rejected")) {
    return "Transaction was rejected in wallet confirmation.";
  }

  return message;
}

type SmartWalletClient = {
  sendTransaction: (args: {
    to: `0x${string}`;
    data: `0x${string}`;
    chain: typeof baseSepolia;
  }) => Promise<`0x${string}`>;
};

export async function executeClaimMusdc(
  walletAddress: string,
  smartClient: SmartWalletClient,
): Promise<`0x${string}`> {
  if (!isAddress(walletAddress)) {
    throw new Error("Wallet is not connected.");
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC_URL),
  });

  const hash = await smartClient.sendTransaction({
    to: MUSDC_FAUCET_ADDRESS as `0x${string}`,
    data: MUSDC_FAUCET_CALLDATA as `0x${string}`,
    chain: baseSepolia,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") {
    throw new Error("Claim transaction failed on-chain.");
  }

  window.dispatchEvent(new CustomEvent("faucet-claim-success"));
  return hash;
}
