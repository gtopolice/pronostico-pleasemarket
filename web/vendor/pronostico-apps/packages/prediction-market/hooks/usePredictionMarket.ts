import { useState, useEffect, useCallback } from "react";
import { ethers, Signer, Provider } from "ethers";
import { PredictionMarketService } from "../services/PredictionMarketService";
import { UserFaucetInfo } from "../types";

export interface UsePredictionMarketResult {
  userService: PredictionMarketService | null;
  globalService: PredictionMarketService | null;
  loading: boolean;
  transferUSDC: (
    to: string,
    amount: bigint
  ) => Promise<ethers.ContractTransactionReceipt>;
  drip: () => Promise<ethers.ContractTransactionReceipt>;
  getUserFaucetInfo: (address: string) => Promise<UserFaucetInfo | null>;
  getFaucetBalance: () => Promise<bigint>;
  getUSDCBalance: (address: string) => Promise<bigint>;
}

export const usePredictionMarket = (
  provider?: Provider,
  signer?: Signer,
  enabled: boolean = true
): UsePredictionMarketResult => {
  const [userService, setUserService] =
    useState<PredictionMarketService | null>(null);
  const [globalService, setGlobalService] =
    useState<PredictionMarketService | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provider && signer) {
      setUserService(new PredictionMarketService(provider, signer));
    }
  }, [provider, signer]);

  useEffect(() => {
    if (provider) {
      setGlobalService(new PredictionMarketService(provider, undefined));
    }
  }, [provider]);

  const transferUSDC = async (
    to: string,
    amount: bigint
  ): Promise<ethers.ContractTransactionReceipt> => {
    if (!userService) throw new Error("Service not initialized");
    setLoading(true);
    try {
      const tx = await userService.transferUSDC(to, amount);
      return tx as ethers.ContractTransactionReceipt;
    } finally {
      setLoading(false);
    }
  };

  const drip = async (): Promise<ethers.ContractTransactionReceipt> => {
    if (!userService) throw new Error("Service not initialized");
    setLoading(true);
    try {
      const tx = await userService.drip();
      return tx as ethers.ContractTransactionReceipt;
    } finally {
      setLoading(false);
    }
  };

  const getUserFaucetInfo = useCallback(
    async (address: string): Promise<UserFaucetInfo | null> => {
      if (!globalService) return null;
      return await globalService.getUserFaucetInfo(address);
    },
    [globalService]
  );

  const getFaucetBalance = useCallback(async (): Promise<bigint> => {
    if (!globalService) return 0n;
    return await globalService.getFaucetBalance();
  }, [globalService]);

  const getUSDCBalance = useCallback(
    async (address: string): Promise<bigint> => {
      if (!globalService) return 0n;
      return await globalService.getUSDCBalance(address);
    },
    [globalService]
  );

  return {
    userService,
    globalService,
    loading,
    transferUSDC,
    drip,
    getUserFaucetInfo,
    getFaucetBalance,
    getUSDCBalance,
  };
};
