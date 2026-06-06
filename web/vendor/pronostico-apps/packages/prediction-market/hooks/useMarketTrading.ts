import { useMemo } from "react";
import { Signer, Provider } from "ethers";
import { usePredictionMarket } from "./usePredictionMarket";
import { useMarketTradingV3 } from "./useMarketTradingV3";
import { useMarketTradingV4 } from "./useMarketTradingV4";
import { MarketData } from "../types";

interface UseMarketTradingProps {
  poolAddress?: string | null;
  conditionId?: string | null;
  yesTokenId?: string | null;
  noTokenId?: string | null;
  title?: string;
  signer?: Signer | null;
  provider?: Provider | null;
  enabled?: boolean;
  cpmmAddress?: string | null;
  cpmmMarketId?: bigint | null;
  /** Defaults to "V3" for backward compatibility */
  contractVersion?: "V1" | "V2" | "V3" | "V4";
}

/**
 * Unified market trading hook — delegates to V3 or V4 based on contractVersion.
 * Detection logic:
 *  - contractVersion === "V4" → useMarketTradingV4
 *  - everything else → useMarketTradingV3 (V1/V2 treated as V3, which gracefully handles missing features)
 */
export function useMarketTrading({
  poolAddress,
  conditionId,
  yesTokenId,
  noTokenId,
  title = "",
  signer,
  provider,
  enabled = true,
  cpmmAddress,
  cpmmMarketId,
  contractVersion,
}: UseMarketTradingProps) {
  const { drip, getUserFaucetInfo, getFaucetBalance } = usePredictionMarket(
    provider || undefined,
    signer || undefined,
    enabled
  );

  const isV4 = contractVersion === "V4";

  // Only enable the matching hook — both V3 and V4 hooks have auto-refresh effects
  // that would fire unnecessarily if always enabled
  const v3Trading = useMarketTradingV3({
    cpmmAddress,
    marketId: cpmmMarketId,
    signer,
    provider,
    enabled: enabled && !isV4,
  });

  const v4Trading = useMarketTradingV4({
    cpmmAddress,
    marketId: cpmmMarketId,
    signer,
    provider,
    enabled: enabled && isV4,
  });

  const trading = isV4 ? v4Trading : v3Trading;

  const marketData = useMemo<MarketData | null>(() => {
    if (!conditionId || !poolAddress) return null;
    return {
      market_id: conditionId,
      title,
      pool: poolAddress,
      conditionId,
      yesTokenId: yesTokenId || "",
      noTokenId: noTokenId || "",
    };
  }, [conditionId, poolAddress, yesTokenId, noTokenId, title]);

  const buyTokens = async (
    outcome: "yes" | "no",
    amount: string,
    budget?: string
  ) => {
    return trading.buyShares(outcome, amount, budget || "0");
  };

  const sellTokens = buyTokens;

  const claimReward = async (outcome?: "yes" | "no") => {
    if (!outcome) throw new Error("Outcome required for claim");
    return trading.redeemShares(outcome);
  };

  return {
    marketData,
    buyTokens,
    sellTokens,
    claimReward,
    calculateCost: trading.calculateCost,
    calculatePayout: trading.calculateCost,
    calculateAmountForBudget: trading.calculateAmountForBudget,
    calculatePotentialWin: trading.calculatePotentialWin,
    isLoading: trading.isLoading,
    error: trading.error,
    balances: trading.balances,
    stats: trading.stats,
    refreshBalances: trading.refreshBalances,
    refreshPoolStats: trading.refreshPoolStats,
    drip,
    getUserFaucetInfo,
    getFaucetBalance,
  };
}
