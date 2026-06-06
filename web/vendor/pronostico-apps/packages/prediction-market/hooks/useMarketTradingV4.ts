import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ethers, Signer, Provider } from "ethers";
import { PredictionMarketService } from "../services/PredictionMarketService";
import { contractsV4 } from "../constants/contracts";
import { CPMM_V4_ABI, ERC20_ABI } from "../constants/abis";
import { AppMessageCode, AppError } from "../../common";
import { createReadOnlyProvider } from "../utils/rpc-provider";
const MIN_PURCHASE_USDC = 1_000000n; // 1 USDC minimum (6-decimal)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface UseMarketTradingV4Props {
  /** Address of the specific CPMM contract holding the market */
  cpmmAddress?: string | null;
  /** On-chain market ID within that CPMM contract */
  marketId?: bigint | null;
  signer?: Signer | null;
  provider?: Provider | null;
  enabled?: boolean;
}

interface PoolStatsV4 {
  priceYes: number;
  priceNo: number;
  sharesYes: bigint;
  sharesNo: bigint;
  probabilityYes: number;
  probabilityNo: number;
  poolYes: bigint;
  poolNo: bigint;
}

interface BalancesV4 {
  eth: string;
  usdc: string;
  yes: bigint;
  no: bigint;
}

/**
 * useMarketTradingV4
 *
 * Dedicated trading hook for CPMM V4 markets (per-market CPMM, factory, roles, kill, fee pool).
 *
 * Key differences from V3:
 *  - Uses CPMM_V4_ABI (has getTotalCollateral, no markets() public getter)
 *  - Uses CPMMRouter V4 (no referrer param)
 *  - Supports fee pool, kill mechanics (forward-looking)
 */
export function useMarketTradingV4({
  cpmmAddress,
  marketId,
  signer,
  provider,
  enabled = true,
}: UseMarketTradingV4Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppMessageCode | null>(null);
  const [stats, setStats] = useState<PoolStatsV4 | null>(null);
  const [statsError, setStatsError] = useState<Error | null>(null);
  const [balances, setBalances] = useState<BalancesV4>({
    eth: "0",
    usdc: "0",
    yes: 0n,
    no: 0n,
  });

  // Always use public RPC for read-only calls — avoids Privy wallet rate limits
  const resolvedProvider = useMemo(() => {
    return createReadOnlyProvider();
  }, []);

  // ── Load Cache on Mount ───────────────────────────────────────────────────
  useEffect(() => {
    const loadCache = async () => {
      if (!signer) return;
      try {
        const address = await signer.getAddress();
        const storedStr = localStorage.getItem("pronostico-balances-storage");
        if (storedStr) {
          const stored = JSON.parse(storedStr);
          const state = stored?.state || {};

          setBalances(prev => {
            if (prev.usdc !== "0" || prev.eth !== "0") return prev;

            const cachedUsdc = state.usdcBalance?.[address] || "0";
            const cachedEth = state.ethBalance?.[address] || "0";

            let yes = 0n;
            let no = 0n;
            if (marketId != null) {
              const shares = state.marketShares?.[address]?.[marketId.toString()];
              if (shares) {
                yes = BigInt(shares.yes || "0");
                no = BigInt(shares.no || "0");
              }
            }

            return {
              eth: cachedEth,
              usdc: cachedUsdc,
              yes,
              no
            };
          });
        }
      } catch (e) {
        console.error("[useMarketTradingV4] Failed to load balance cache", e);
      }
    };
    loadCache();
  }, [signer, marketId]);

  // ── Service (V4-aware) ────────────────────────────────────────────────────
  const service = useMemo(() => {
    return new PredictionMarketService(
      resolvedProvider,
      signer || undefined,
      "V4"
    );
  }, [resolvedProvider, signer]);

  // ── Contract instances (read-only, V4 ABI) ────────────────────────────────
  const cpmmContract = useMemo(() => {
    if (!cpmmAddress) return null;
    return new ethers.Contract(cpmmAddress, CPMM_V4_ABI, resolvedProvider);
  }, [cpmmAddress, resolvedProvider]);

  // ── Pool Stats ────────────────────────────────────────────────────────────
  const refreshPoolStats = useCallback(async () => {
    if (!cpmmContract || marketId == null) return;

    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // V4: getTotalCollateral is a first-class method on the contract
        const [totalCollateralOnChain, sYes, sNo, poolYes, poolNo] = await Promise.all([
          cpmmContract.getTotalCollateral(marketId),
          cpmmContract.totalShares(marketId, 0),
          cpmmContract.totalShares(marketId, 1),
          cpmmContract.outcomePools(marketId, 0),
          cpmmContract.outcomePools(marketId, 1),
        ]);

        console.log("[useMarketTradingV4] Market info:", { marketId, totalCollateral: totalCollateralOnChain?.toString() });
        console.log("[useMarketTradingV4] Total shares:", {
          sYes: sYes?.toString(),
          sNo: sNo?.toString(),
        });
        console.log("[useMarketTradingV4] Outcome pools:", {
          poolYes: poolYes?.toString(),
          poolNo: poolNo?.toString(),
        });

        const [priceYesFromContract, priceNoFromContract] = await Promise.all([
          cpmmContract.getMarketPrice(marketId, 0),
          cpmmContract.getMarketPrice(marketId, 1),
        ]);

        console.log("[useMarketTradingV4] Raw prices from contract:", {
          priceYesFromContract: priceYesFromContract?.toString(),
          priceNoFromContract: priceNoFromContract?.toString(),
        });

        const totalShares = (sYes as bigint) + (sNo as bigint);

        const priceYesRaw = priceYesFromContract ? Number(priceYesFromContract) : 0;
        const priceNoRaw = priceNoFromContract ? Number(priceNoFromContract) : 0;
        const priceYes = priceYesRaw / 1e18;
        const priceNo = priceNoRaw / 1e18;

        let probabilityYes = 0.5;
        let probabilityNo = 0.5;
        if (totalShares > 0n) {
          const sYesNum = Number(sYes) / 1e18;
          const sNoNum = Number(sNo) / 1e18;
          probabilityYes = sYesNum / (sYesNum + sNoNum);
          probabilityNo = sNoNum / (sYesNum + sNoNum);
          console.log("[useMarketTradingV4] Probability from shares:", {
            probabilityYes,
            probabilityNo,
            sYesNum,
            sNoNum,
            totalShares: Number(totalShares) / 1e18,
          });
        }

        console.log("[useMarketTradingV4] Price calc:", {
          priceYes,
          priceNo,
        });

        setStats({
          priceYes: priceYes,
          priceNo: priceNo,
          probabilityYes: probabilityYes,
          probabilityNo: probabilityNo,
          sharesYes: (sYes as bigint) ?? 0n,
          sharesNo: (sNo as bigint) ?? 0n,
          poolYes: (poolYes as bigint) ?? 0n,
          poolNo: (poolNo as bigint) ?? 0n,
        });

        return;
      } catch (err: any) {
        const isRetryable =
          err?.code === "NETWORK_ERROR" ||
          err?.code === "TIMEOUT" ||
          err?.message?.includes("429") ||
          err?.message?.includes("too many requests") ||
          err?.message?.includes("rate limit") ||
          err?.status === 429;

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
          console.warn(
            `[useMarketTradingV4] RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
            err
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (attempt >= MAX_RETRIES) {
          console.error(
            "[useMarketTradingV4] Failed to refresh pool stats after all retries:",
            err
          );
        } else {
          console.warn(
            "[useMarketTradingV4] Failed to refresh pool stats (non-retryable):",
            err
          );
        }

        setStatsError(err);
        return;
      }
    }
  }, [cpmmContract, marketId]);

  // ── Balances ──────────────────────────────────────────────────────────────
  const refreshBalances = useCallback(async () => {
    if (!signer) return;

    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const address = await signer.getAddress();
        const usdcContract = new ethers.Contract(
          contractsV4.usdcAddr,
          ERC20_ABI,
          resolvedProvider
        );

        const [ethBal, usdcBal, sYes, sNo] = await Promise.all([
          resolvedProvider.getBalance(address),
          usdcContract.balanceOf(address),
          cpmmContract?.sharesOf(marketId, address, 0),
          cpmmContract?.sharesOf(marketId, address, 1),
        ]);

        const ethStr = ethers.formatUnits(ethBal, 18);
        const usdcStr = ethers.formatUnits(usdcBal, 6);
        const yesBn = (sYes as bigint) || 0n;
        const noBn = (sNo as bigint) || 0n;

        setBalances({
          eth: ethStr,
          usdc: usdcStr,
          yes: yesBn,
          no: noBn,
        });

        // Update cache
        try {
          const storedStr = localStorage.getItem("pronostico-balances-storage");
          let stored = { state: { usdcBalance: {} as any, ethBalance: {} as any, marketShares: {} as any }, version: 0 };
          if (storedStr) {
            try {
              stored = JSON.parse(storedStr);
            } catch {
              stored = { state: { usdcBalance: {}, ethBalance: {}, marketShares: {} }, version: 0 };
            }
          }

          stored.state.usdcBalance = stored.state.usdcBalance || {};
          stored.state.ethBalance = stored.state.ethBalance || {};
          stored.state.marketShares = stored.state.marketShares || {};

          stored.state.usdcBalance[address] = usdcStr;
          stored.state.ethBalance[address] = ethStr;

          if (marketId != null) {
            if (!stored.state.marketShares[address]) stored.state.marketShares[address] = {};
            stored.state.marketShares[address][marketId.toString()] = { yes: yesBn.toString(), no: noBn.toString() };
          }
          localStorage.setItem("pronostico-balances-storage", JSON.stringify(stored));
          window.dispatchEvent(new Event("storage"));
        } catch (e) {
          console.error("[useMarketTradingV4] Failed to update balance cache", e);
        }

        return;

      } catch (err: any) {
        const isRetryable =
          err?.code === "NETWORK_ERROR" ||
          err?.code === "TIMEOUT" ||
          err?.message?.includes("429") ||
          err?.message?.includes("too many requests") ||
          err?.message?.includes("rate limit") ||
          err?.status === 429;

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000);
          console.warn(
            `[useMarketTradingV4] Balances RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
            err
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (attempt >= MAX_RETRIES) {
          console.error(
            "[useMarketTradingV4] Failed to refresh balances after all retries:",
            err
          );
        } else {
          console.warn(
            "[useMarketTradingV4] Failed to refresh balances (non-retryable):",
            err
          );
        }

        return;
      }
    }
  }, [signer, resolvedProvider, marketId, cpmmContract]);

  // ── Auto-refresh on mount / dependency change ─────────────────────────────
  const lastRefreshRef = useRef(0);
  useEffect(() => {
    if (!enabled || !cpmmAddress || marketId == null) return;
    if (!resolvedProvider) return;

    const now = Date.now();
    if (now - lastRefreshRef.current < 5000) return;
    lastRefreshRef.current = now;

    refreshPoolStats().then(() => {
      if (signer) refreshBalances();
    });
  }, [enabled, cpmmAddress, marketId, signer, resolvedProvider, refreshPoolStats, refreshBalances]);

  // ── Quote (off-chain estimate) ────────────────────────────────────────────
  const getQuote = useCallback(
    async (outcomeId: 0 | 1, shares: bigint): Promise<bigint> => {
      if (!cpmmAddress || marketId == null || shares === 0n) return 0n;

      const MAX_RETRIES = 3;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await service.getQuote(
            cpmmAddress,
            marketId,
            outcomeId,
            shares
          );
        } catch (err: any) {
          const isRetryable =
            err?.code === "NETWORK_ERROR" ||
            err?.code === "TIMEOUT" ||
            err?.message?.includes("429") ||
            err?.message?.includes("too many requests") ||
            err?.message?.includes("rate limit") ||
            err?.message?.includes("Failed to fetch") ||
            err?.status === 429;

          if (isRetryable && attempt < MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            console.warn(
              `[useMarketTradingV4] getQuote RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
              err
            );
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          console.error("[useMarketTradingV4] getQuote failed:", err);
          return 0n;
        }
      }
      return 0n;
    },
    [service, cpmmAddress, marketId]
  );

  const calculateCost = useCallback(
    async (outcome: "yes" | "no", sharesAmount: string): Promise<string> => {
      if (!sharesAmount || parseFloat(sharesAmount) <= 0) return "0.00";
      try {
        const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
        const sharesWei = ethers.parseEther(sharesAmount);
        const cost = await getQuote(outcomeId, sharesWei);
        return (Number(cost) / 1e6).toFixed(6);
      } catch {
        return "0.00";
      }
    },
    [getQuote]
  );

  const calculateAmountForBudget = useCallback(
    async (outcome: "yes" | "no", budget: string): Promise<string> => {
      if (!cpmmAddress || marketId == null || !budget || parseFloat(budget) <= 0) return "0.00";

      const MAX_RETRIES = 1;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
          const budgetValue = parseFloat(budget);
          const budgetWei = BigInt(Math.floor(budgetValue * 1e6));

          const minBudgetWithFees = MIN_PURCHASE_USDC / 10000n;
          const adjustedBudgetWei = budgetWei <= minBudgetWithFees
            ? minBudgetWithFees + (minBudgetWithFees * 50n) / 10000n
            : budgetWei;

          if (adjustedBudgetWei !== budgetWei) {
            console.log(`[useMarketTradingV4] Budget ${budgetValue} below minimum, adjusted to ${Number(adjustedBudgetWei) / 1e6} USDC`);
          }

          const sharesWei = await cpmmContract?.getAmountOut(marketId, outcomeId, adjustedBudgetWei);

          if (!sharesWei || sharesWei === 0n) return "0.00";

          let costWei: bigint | undefined;
          try {
            costWei = await cpmmContract?.getCost(marketId, outcomeId, sharesWei);
          } catch (costErr) {
            console.warn("[useMarketTradingV4] getCost reverted, using budget as estimate:", costErr);
            costWei = adjustedBudgetWei;
          }
          const costUSDC = Number(costWei ?? 0n) / 1e6;

          const adjustedBudgetValue = Number(adjustedBudgetWei) / 1e6;
          if (costUSDC > adjustedBudgetValue * 1.005) {
            console.warn(`[useMarketTradingV4] Budget insufficient: cost ${costUSDC} > adjusted budget ${adjustedBudgetValue * 1.005}`);
            return "0.00";
          }

          return ethers.formatEther(sharesWei);
        } catch (err: any) {
          const isRetryable =
            err?.code === "NETWORK_ERROR" ||
            err?.code === "TIMEOUT" ||
            err?.message?.includes("429") ||
            err?.message?.includes("too many requests") ||
            err?.message?.includes("rate limit") ||
            err?.message?.includes("Failed to fetch") ||
            err?.status === 429;

          if (isRetryable && attempt < MAX_RETRIES) {
            console.warn(
              `[useMarketTradingV4] calculateAmountForBudget RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying:`,
              err
            );
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          console.error("[useMarketTradingV4] calculateAmountForBudget failed:", err);
          return "0.00";
        }
      }
      return "0.00";
    },
    [cpmmAddress, marketId, cpmmContract]
  );

  /**
   * Projects the potential reward in USDC if the outcome wins.
   * V4 Formula: Principal + (Shares / TotalShares) * LosingPool
   * Uses getTotalCollateral (available in V4 ABI) for the losing pool calculation.
   */
  const calculatePotentialWin = useCallback(
    async (outcome: "yes" | "no", budget: string): Promise<string> => {
      if (!cpmmContract || marketId == null || !budget || parseFloat(budget) <= 0) return "0.00";

      const MAX_RETRIES = 1;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
          const budgetValueDecimal = parseFloat(budget);

          // V4: getTotalCollateral is a direct method
          const [totalCollateralWei, currentSharesWei, currentOutcomePoolWei] = await Promise.all([
            cpmmContract.getTotalCollateral(marketId),
            cpmmContract.totalShares(marketId, outcomeId),
            cpmmContract.outcomePools(marketId, outcomeId)
          ]);

          const currentLosingPool = totalCollateralWei - (currentOutcomePoolWei as bigint);

          const sharesWeiString = await calculateAmountForBudget(outcome, budget);
          const sharesWei = ethers.parseEther(sharesWeiString);

          if (sharesWei === 0n) return "0.00";

          const budgetUSDC = BigInt(Math.floor(budgetValueDecimal * 1e6));
          const projectedTotalShares = (currentSharesWei as bigint) + sharesWei;

          const profitWei = (sharesWei * currentLosingPool) / projectedTotalShares;
          const projectedWinWei = budgetUSDC + profitWei;

          return (Number(projectedWinWei) / 1e6).toFixed(2);
        } catch (err: any) {
          const isRetryable =
            err?.code === "NETWORK_ERROR" ||
            err?.code === "TIMEOUT" ||
            err?.message?.includes("429") ||
            err?.message?.includes("too many requests") ||
            err?.message?.includes("rate limit") ||
            err?.message?.includes("Failed to fetch") ||
            err?.status === 429;

          if (isRetryable && attempt < MAX_RETRIES) {
            console.warn(
              `[useMarketTradingV4] calculatePotentialWin RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying:`,
              err
            );
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          console.error("[useMarketTradingV4] calculatePotentialWin failed:", err);
          return "0.00";
        }
      }
      return "0.00";
    },
    [cpmmContract, marketId, calculateAmountForBudget]
  );

  // ── Buy ───────────────────────────────────────────────────────────────────
  const buyShares = async (
    outcome: "yes" | "no",
    sharesAmount: string,
    userBudget: string = "0",
    slippageBps: number = 200
  ): Promise<string> => {
    if (!signer || !cpmmAddress || marketId == null) {
      throw new AppError(
        AppMessageCode.MARKET_DATA_MISSING,
        "Faltan datos de mercado o conexión V4"
      );
    }

    const userBudgetWei = BigInt(Math.floor(parseFloat(userBudget) * 1e6));
    const minBudgetWithFees = MIN_PURCHASE_USDC + (MIN_PURCHASE_USDC * 300n) / 10000n;
    const slippageBufferBps = 200;
    let effectiveBudgetWei = userBudgetWei;
    if (effectiveBudgetWei <= minBudgetWithFees) {
      effectiveBudgetWei = minBudgetWithFees + (minBudgetWithFees * BigInt(slippageBufferBps)) / 10000n;
      console.log(`[useMarketTradingV4] Budget adjusted from ${Number(userBudgetWei) / 1e6} to ${Number(effectiveBudgetWei) / 1e6} USDC (${slippageBufferBps / 100}% buffer)`);
    }

    setIsLoading(true);
    setError(null);

    try {
      const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
      const sharesWei = ethers.parseEther(sharesAmount);

      console.log(`🔍 [useMarketTradingV4] Getting cost quote for ${sharesAmount} shares of outcome ${outcomeId}...`);
      const baseCost = await getQuote(outcomeId, sharesWei);
      if (baseCost === 0n) {
        throw new AppError(AppMessageCode.BUY_TOKENS_FAILED, "Quote returned 0 — market may be inactive");
      }

      const slippageBpsLocal = 200;
      const maxCostFromQuote = baseCost + (baseCost * BigInt(slippageBpsLocal)) / 10000n;

      const minBudgetBuffer = (effectiveBudgetWei * 50n) / 10000n;
      const maxCost = maxCostFromQuote > effectiveBudgetWei + minBudgetBuffer
        ? maxCostFromQuote
        : effectiveBudgetWei + minBudgetBuffer;

      console.log(`💵 [useMarketTradingV4] Base cost: ${Number(baseCost) / 1e6} USDC, maxCost (${slippageBpsLocal}%): ${Number(maxCost) / 1e6} USDC, user budget: ${Number(effectiveBudgetWei) / 1e6} USDC`);

      // V4 service handles buyShares without referrer param
      const receipt = await service.buyShares(
        cpmmAddress,
        marketId,
        outcomeId,
        sharesWei,
        maxCost
      );

      console.log(`✅ [useMarketTradingV4] Buy confirmed: ${receipt.hash}`);

      setBalances((prev) => ({
        ...prev,
        yes: outcome === "yes" ? prev.yes + sharesWei : prev.yes,
        no: outcome === "no" ? prev.no + sharesWei : prev.no,
      }));

      await sleep(2500);
      await Promise.all([refreshBalances(), refreshPoolStats()]);

      return receipt.hash;
    } catch (err: any) {
      console.error("❌ [useMarketTradingV4] buyShares failed:", err);
      if (err instanceof AppError) {
        setError(err.code);
        throw err;
      }
      const msg = err.reason || err.message || "Error desconocido en la compra V4";
      setError(AppMessageCode.BUY_TOKENS_FAILED);
      throw new AppError(AppMessageCode.BUY_TOKENS_FAILED, msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Redeem ────────────────────────────────────────────────────────────────
  const redeemShares = async (outcome: "yes" | "no") => {
    if (!signer || !cpmmAddress || marketId == null) {
      throw new AppError(
        AppMessageCode.MARKET_DATA_MISSING,
        "Faltan datos de mercado V4 para reclamar"
      );
    }

    const signerAddress = await signer.getAddress();
    console.log("=== [useMarketTradingV4] CLAIM DEBUG ===");
    console.log("cpmmAddress:", cpmmAddress);
    console.log("marketId:", marketId?.toString());
    console.log("signerAddress:", signerAddress);
    console.log("outcome:", outcome);
    console.log("balances.yes:", balances.yes.toString());
    console.log("balances.no:", balances.no.toString());
    console.log("======================================");

    const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
    const sharesToRedeem = outcome === "yes" ? balances.yes : balances.no;

    if (sharesToRedeem === 0n) {
      throw new AppError(
        AppMessageCode.CLAIM_REWARD_FAILED,
        "No tienes acciones del outcome ganador para reclamar"
      );
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`💰 [useMarketTradingV4] Redeeming ${ethers.formatEther(sharesToRedeem)} shares of outcome ${outcomeId}...`);

      const receipt = await service.redeem(
        cpmmAddress,
        marketId,
        outcomeId,
        sharesToRedeem
      );

      console.log(`✅ [useMarketTradingV4] Redeem confirmed: ${receipt.hash}`);

      setBalances((prev) => ({
        ...prev,
        yes: outcome === "yes" ? 0n : prev.yes,
        no: outcome === "no" ? 0n : prev.no,
      }));

      await sleep(2000);
      await refreshBalances();

      return receipt;
    } catch (err: any) {
      console.error("[useMarketTradingV4] FULL ERROR:", err);
      if (err instanceof AppError) {
        setError(err.code);
        throw err;
      }
      const msg = err.reason || err.message || "Error desconocido al reclamar V4";
      setError(AppMessageCode.CLAIM_REWARD_FAILED);
      throw new AppError(AppMessageCode.CLAIM_REWARD_FAILED, msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buyShares,
    buyTokens: buyShares,
    redeemShares,
    claimReward: redeemShares,
    getQuote,
    calculateCost,
    calculateAmountForBudget,
    calculatePotentialWin,
    isLoading,
    error,
    stats,
    statsError,
    balances,
    refreshPoolStats,
    refreshBalances,
  };
}
