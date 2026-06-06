"use client";

import { useCallback, useState } from "react";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { isAddress } from "viem";
import { baseSepolia } from "viem/chains";

import { usePrivySigner } from "@/hooks/use-privy-signer";
import { executeClaimMusdc, parseClaimError } from "@/lib/musdc-faucet";
import { usePredictionMarket } from "../../vendor/pronostico-apps/packages/prediction-market/hooks/usePredictionMarket";

type ClaimStage = "idle" | "claiming" | "success" | "error";

export function useClaimMusdc(walletAddress?: string | null) {
  const { getClientForChain, client: smartWalletClient } = useSmartWallets();
  const { signer, provider } = usePrivySigner();
  const { drip } = usePredictionMarket(provider ?? undefined, signer ?? undefined, Boolean(signer && provider));
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
      setStage("claiming");

      type FaucetClient = Parameters<typeof executeClaimMusdc>[1];
      let smartClient: FaucetClient | null = smartWalletClient
        ? (smartWalletClient as FaucetClient)
        : null;
      if (!smartClient) {
        try {
          smartClient = (await getClientForChain({ id: baseSepolia.id })) as FaucetClient;
        } catch {
          smartClient = null;
        }
      }

      if (smartClient) {
        const hash = await executeClaimMusdc(walletAddress, smartClient);
        setTxHash(hash);
        setStage("success");
        return hash;
      }

      if (signer) {
        const receipt = await drip();
        const hash = receipt.hash;
        window.dispatchEvent(new CustomEvent("faucet-claim-success"));
        setTxHash(hash);
        setStage("success");
        return hash;
      }

      throw new Error(
        "Smart wallet not ready. In the Privy dashboard, enable Smart Wallets and add Base Sepolia (chain 84532), then sign out and sign in again.",
      );
    } catch (caughtError) {
      setStage("error");
      setError(parseClaimError(caughtError));
      return null;
    }
  }, [drip, getClientForChain, signer, smartWalletClient, walletAddress]);

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
