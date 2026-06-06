"use client";

import { useCallback, useState } from "react";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { isAddress } from "viem";
import { baseSepolia } from "viem/chains";

import { executeClaimMusdc, parseClaimError } from "@/lib/musdc-faucet";

type ClaimStage = "idle" | "claiming" | "success" | "error";

export function useClaimMusdc(walletAddress?: string | null) {
  const { getClientForChain } = useSmartWallets();
  const [stage, setStage] = useState<ClaimStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const claim = useCallback(async () => {
    setError(null);
    setTxHash(null);

    if (!walletAddress || !isAddress(walletAddress)) {
      setStage("error");
      setError("Wallet is not connected.");
      return null;
    }

    try {
      const smartClient = await getClientForChain({ id: baseSepolia.id });
      if (!smartClient) {
        throw new Error(
          "Smart wallet not ready. Sign in with Privy and wait for the Base Sepolia smart wallet to link.",
        );
      }

      setStage("claiming");
      const hash = await executeClaimMusdc(walletAddress, smartClient);
      setTxHash(hash);
      setStage("success");
      return hash;
    } catch (caughtError) {
      setStage("error");
      setError(parseClaimError(caughtError));
      return null;
    }
  }, [getClientForChain, walletAddress]);

  const reset = useCallback(() => {
    setStage("idle");
    setError(null);
    setTxHash(null);
  }, []);

  return {
    claim,
    reset,
    stage,
    error,
    txHash,
    isClaiming: stage === "claiming",
    isSuccess: stage === "success",
  };
}
