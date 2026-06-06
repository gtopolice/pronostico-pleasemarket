import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ethers, Signer, Provider } from "ethers";
import { PredictionMarketService } from "../services/PredictionMarketService";
import { contractsV3 } from "../constants/contracts";
import { CPMM_V3_ABI, ERC20_ABI } from "../constants/abis";
import { AppMessageCode, AppError } from "../../common";
import { createReadOnlyProvider, getBestAvailableRpcUrl, isRateLimitedError } from "../utils/rpc-provider";
const MIN_PURCHASE_USDC = 1_000000n; // 1 USDC minimum (6-decimal)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface UseMarketTradingV3Props {
  /** Address of the specific CPMM contract holding the market */
  cpmmAddress?: string | null;
  /** On-chain market ID within that CPMM contract */
  marketId?: bigint | null;
  signer?: Signer | null;
  provider?: Provider | null;
  enabled?: boolean;
}

interface PoolStatsV3 {
  /** Price of outcome 0 (YES) in 18-decimal fixed-point */
  priceYes: number;
  /** Price of outcome 1 (NO) in 18-decimal fixed-point */
  priceNo: number;
  /** Total shares sold for outcome 0 */
  sharesYes: bigint;
  /** Total shares sold for outcome 1 */
  sharesNo: bigint;
  /** Probability of outcome 0 (YES) */
  probabilityYes: number;
  /** Probability of outcome 1 (NO) */
  probabilityNo: number;
  /** Total shares in pool for outcome 0 (YES) */
  poolYes: bigint;
  /** Total shares in pool for outcome 1 (NO) */
  poolNo: bigint;
}

interface BalancesV3 {
  eth: string;
  usdc: string;
  /** CPMM V3 shares held for outcome 0 (YES) — tracked via on-chain balance */
  yes: bigint;
  /** CPMM V3 shares held for outcome 1 (NO) */
  no: bigint;
}

/**
 * useMarketTradingV3
 *
 * Dedicated trading hook for CPMM V3 markets (Shares-First architecture).
 *
 * Key differences from V1/V2:
 *  - Users specify SHARES to buy (not maximum USDC).
 *  - Pricing uses `CPMMRouter.getCost` (O(1) off-chain) for quotes.
 *  - Redemption follows "All or Nothing" policy — full balance must be redeemed.
 *  - No CTF token mechanics — CPMM tracks balances internally.
 */
export function useMarketTradingV3({
  cpmmAddress,
  marketId,
  signer,
  provider,
  enabled = true,
}: UseMarketTradingV3Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppMessageCode | null>(null);
  const [stats, setStats] = useState<PoolStatsV3 | null>(null);
  const [statsError, setStatsError] = useState<Error | null>(null);
  const [balances, setBalances] = useState<BalancesV3>({
    eth: "0",
    usdc: "0",
    yes: 0n,
    no: 0n,
  });

  // Always use public RPC for read-only calls — avoids Privy wallet rate limits
  // The wallet provider (signer) is only used for transactions
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
            // Only override if we haven't fetched real balances yet
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
        console.error("[useMarketTradingV3] Failed to load balance cache", e);
      }
    };
    loadCache();
  }, [signer, marketId]);

  // ── Service ───────────────────────────────────────────────────────────────
  // Service configured as V3 — uses CPMM_V3_ABI and CPMMRouter V3 (with referrer param)
  const service = useMemo(() => {
    return new PredictionMarketService(
      resolvedProvider,
      signer || undefined,
      "V3"
    );
  }, [resolvedProvider, signer]);

  // ── Contract instances (read-only) ────────────────────────────────────────
  const cpmmContract = useMemo(() => {
    if (!cpmmAddress) return null;
    return new ethers.Contract(cpmmAddress, CPMM_V3_ABI, resolvedProvider);
  }, [cpmmAddress, resolvedProvider]);

  // ── Pool Stats ────────────────────────────────────────────────────────────
  const refreshPoolStats = useCallback(async () => {
    if (!cpmmContract || marketId == null) return;

    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // V3: totalCollateral is accessed via markets() public getter (not a standalone method)
        const [marketInfo, sYes, sNo, poolYes, poolNo] = await Promise.all([
          cpmmContract.markets(marketId),
          cpmmContract.totalShares(marketId, 0),
          cpmmContract.totalShares(marketId, 1),
          cpmmContract.outcomePools(marketId, 0),
          cpmmContract.outcomePools(marketId, 1),
        ]);
        const totalCollateralOnChain = marketInfo?.totalCollateral;

        console.log("[useMarketTradingV3] Market info:", { marketId, totalCollateral: totalCollateralOnChain?.toString() });
        console.log("[useMarketTradingV3] Total shares:", {
          sYes: sYes?.toString(),
          sNo: sNo?.toString(),
        });
        console.log("[useMarketTradingV3] Outcome pools:", {
          poolYes: poolYes?.toString(),
          poolNo: poolNo?.toString(),
        });

        // Use getMarketPrice to get the sigmoid curve price for each outcome (independent per outcome)
        const [priceYesFromContract, priceNoFromContract] = await Promise.all([
          cpmmContract.getMarketPrice(marketId, 0),
          cpmmContract.getMarketPrice(marketId, 1),
        ]);

        console.log("[useMarketTradingV3] Raw prices from contract:", {
          priceYesFromContract: priceYesFromContract?.toString(),
          priceNoFromContract: priceNoFromContract?.toString(),
        });

        const totalShares = (sYes as bigint) + (sNo as bigint);

        // getMarketPrice returns 18-decimal fixed-point (0.5e18 = 0.5) - this is the PRICE, not probability
        const priceYesRaw = priceYesFromContract ? Number(priceYesFromContract) : 0;
        const priceNoRaw = priceNoFromContract ? Number(priceNoFromContract) : 0;
        const priceYes = priceYesRaw / 1e18;
        const priceNo = priceNoRaw / 1e18;

        // Probability = normalized shares ratio (NOT the price)
        let probabilityYes = 0.5;
        let probabilityNo = 0.5;
        if (totalShares > 0n) {
          const sYesNum = Number(sYes) / 1e18;
          const sNoNum = Number(sNo) / 1e18;
          probabilityYes = sYesNum / (sYesNum + sNoNum);
          probabilityNo = sNoNum / (sYesNum + sNoNum);
          console.log("[useMarketTradingV3] Probability from shares:", {
            probabilityYes,
            probabilityNo,
            sYesNum,
            sNoNum,
            totalShares: Number(totalShares) / 1e18,
          });
        }

        console.log("[useMarketTradingV3] Price calc (price, not probability):", {
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

        return; // Success — exit
      } catch (err: any) {
        const isRetryable =
          err?.code === "NETWORK_ERROR" ||
          err?.code === "TIMEOUT" ||
          err?.message?.includes("429") ||
          err?.message?.includes("too many requests") ||
          err?.message?.includes("rate limit") ||
          err?.status === 429;

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000); // 1s, 2s
          console.warn(
            `[useMarketTradingV3] RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
            err
          );
          await new Promise((r) => setTimeout(r, delay));
          continue; // Try again
        }

        // Non-retryable or exhausted
        if (attempt >= MAX_RETRIES) {
          console.error(
            "[useMarketTradingV3] Failed to refresh pool stats after all retries:",
            err
          );
        } else {
          console.warn(
            "[useMarketTradingV3] Failed to refresh pool stats (non-retryable):",
            err
          );
        }

        // Don't reset stats to null on failure — keep last known value to prevent UI flicker
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
        // Use resolvedProvider for read-only calls (public RPC in dev)
        const usdcContract = new ethers.Contract(
          contractsV3.usdcAddr,
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
          // Dispatch event for Zustand persist middleware across tabs
          window.dispatchEvent(new Event("storage"));
        } catch (e) {
          console.error("[useMarketTradingV3] Failed to update balance cache", e);
        }

        return; // Success — exit

      } catch (err: any) {
        const isRetryable =
          err?.code === "NETWORK_ERROR" ||
          err?.code === "TIMEOUT" ||
          err?.message?.includes("429") ||
          err?.message?.includes("too many requests") ||
          err?.message?.includes("rate limit") ||
          err?.status === 429;

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 4000); // 1s, 2s
          console.warn(
            `[useMarketTradingV3] Balances RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
            err
          );
          await new Promise((r) => setTimeout(r, delay));
          continue; // Try again
        }

        // Non-retryable or exhausted
        if (attempt >= MAX_RETRIES) {
          console.error(
            "[useMarketTradingV3] Failed to refresh balances after all retries:",
            err
          );
        } else {
          console.warn(
            "[useMarketTradingV3] Failed to refresh balances (non-retryable):",
            err
          );
        }

        // We don't reset balances here, so the UI will continue to use the cached value.
        return;
      }
    }
  }, [signer, resolvedProvider, marketId, cpmmContract]);

  // ── Auto-refresh on mount / dependency change ─────────────────────────────
  const lastRefreshRef = useRef(0);
  useEffect(() => {
    if (!enabled || !cpmmAddress || marketId == null) return;
    if (!resolvedProvider) return;

    // Cooldown: prevent duplicate calls from StrictMode double-mount or rapid re-renders
    const now = Date.now();
    if (now - lastRefreshRef.current < 5000) return;
    lastRefreshRef.current = now;

    // Serialize calls — don't fire pool stats and balances simultaneously
    refreshPoolStats().then(() => {
      if (signer) refreshBalances();
    });
  }, [enabled, cpmmAddress, marketId, signer, resolvedProvider, refreshPoolStats, refreshBalances]);

  // ── Quote (off-chain estimate) ────────────────────────────────────────────
  /**
   * Get the USDC cost for purchasing `shares` of an outcome.
   * Uses `CPMMRouter.getCost` (view-only, no gas).
   * @param outcomeId - 0 = YES, 1 = NO
   * @param shares    - 18-decimal shares amount
   */
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
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000); // 1s, 2s, 4s
            console.warn(
              `[useMarketTradingV3] getQuote RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${delay}ms:`,
              err
            );
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          console.error("[useMarketTradingV3] getQuote failed:", err);
          return 0n;
        }
      }
      return 0n; // Fallthrough (should not reach here)
    },
    [service, cpmmAddress, marketId]
  );

  /**
   * Calculate USDC cost as a formatted string (for UI display).
   */
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

  /**
   * Calculate how many tokens (shares) can be bought with a certain budget (USDC).
   * Translates Budget-First (V2 style) to Shares-First (V3) for UI compatibility.
   * Uses getAmountOut (inverse function) to correctly account for fees and price impact.
   */
  const calculateAmountForBudget = useCallback(
    async (outcome: "yes" | "no", budget: string): Promise<string> => {
      if (!cpmmAddress || marketId == null || !budget || parseFloat(budget) <= 0) return "0.00";

      const MAX_RETRIES = 1;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
          const budgetValue = parseFloat(budget);
          const budgetWei = BigInt(Math.floor(budgetValue * 1e6)); // Convert to 6-decimal USDC

          // Ensure budget meets minimum purchase requirement (contract requires minimum 1 USDC + ~3% fees)
          // If budget is <= ~1.03 USDC, adjust to minimum + buffer for fees
          const minBudgetWithFees = MIN_PURCHASE_USDC / 10000n; // ~1.03 USDC
          const adjustedBudgetWei = budgetWei <= minBudgetWithFees
            ? minBudgetWithFees + (minBudgetWithFees * 50n) / 10000n // Add 0.5% buffer
            : budgetWei;

          if (adjustedBudgetWei !== budgetWei) {
            console.log(`[useMarketTradingV3] Budget ${budgetValue} below minimum, adjusted to ${Number(adjustedBudgetWei) / 1e6} USDC`);
          }

          // Use getAmountOut - the inverse function that returns shares for a given USDC cost.
          // This correctly accounts for fees and current market state.
          const sharesWei = await cpmmContract?.getAmountOut(marketId, outcomeId, adjustedBudgetWei);

          if (!sharesWei || sharesWei === 0n) return "0.00";

          // Verify the cost for these shares doesn't exceed budget
          // Note: getCost may revert on some edge cases, so we handle it gracefully
          let costWei: bigint | undefined;
          try {
            costWei = await cpmmContract?.getCost(marketId, outcomeId, sharesWei);
          } catch (costErr) {
            // If getCost fails, use the budget as the estimated cost
            console.warn("[useMarketTradingV3] getCost reverted, using budget as estimate:", costErr);
            costWei = adjustedBudgetWei;
          }
          const costUSDC = Number(costWei ?? 0n) / 1e6;

          // If the cost exceeds adjusted budget (with 0.5% tolerance), return 0.00
          const adjustedBudgetValue = Number(adjustedBudgetWei) / 1e6;
          if (costUSDC > adjustedBudgetValue * 1.005) {
            console.warn(`[useMarketTradingV3] Budget insufficient: cost ${costUSDC} > adjusted budget ${adjustedBudgetValue * 1.005}`);
            return "0.00";
          }

          // Return the exact share count (18-decimal format)
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
              `[useMarketTradingV3] calculateAmountForBudget RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying:`,
              err
            );
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          console.error("[useMarketTradingV3] calculateAmountForBudget failed:", err);
          return "0.00";
        }
      }
      return "0.00"; // Fallthrough (should not reach here)
    },
    [cpmmAddress, marketId, cpmmContract]
  );

  /**
   * Projects the potential reward in USDC if the outcome wins.
   * New V3 Formula: Principal + (Shares / TotalShares) * LosingPool
   */
  const calculatePotentialWin = useCallback(
    async (outcome: "yes" | "no", budget: string): Promise<string> => {
      if (!cpmmContract || marketId == null || !budget || parseFloat(budget) <= 0) return "0.00";

      const MAX_RETRIES = 1;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
          const budgetValueDecimal = parseFloat(budget);

          // 1. Get current market state
          // V3: totalCollateral is accessed via markets() public getter
          const [marketInfoForWin, currentSharesWei, currentOutcomePoolWei] = await Promise.all([
            cpmmContract.markets(marketId),
            cpmmContract.totalShares(marketId, outcomeId),
            cpmmContract.outcomePools(marketId, outcomeId)
          ]);
          const totalCollateralWei = marketInfoForWin?.totalCollateral ?? 0n;

          const currentLosingPool = totalCollateralWei - (currentOutcomePoolWei as bigint);

          // 2. Get the shares the budget buys
          const sharesWeiString = await calculateAmountForBudget(outcome, budget);
          const sharesWei = ethers.parseEther(sharesWeiString);

          if (sharesWei === 0n) return "0.00";

          // 3. Project Payout: Result = Principal + (Shares / (CurrentShares + Shares)) * LosingPool
          // We use budget as an approximation of Principal (including fees for UI simplicity)
          const budgetUSDC = BigInt(Math.floor(budgetValueDecimal * 1e6));
          const projectedTotalShares = (currentSharesWei as bigint) + sharesWei;

          // Profit is the share of the losing pool
          const profitWei = (sharesWei * currentLosingPool) / projectedTotalShares;

          // Total reward = Principal (budget) + Profit
          const projectedWinWei = budgetUSDC + profitWei;

          // Result is in 6 decimal USDC
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
              `[useMarketTradingV3] calculatePotentialWin RPC error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying:`,
              err
            );
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          console.error("[useMarketTradingV3] calculatePotentialWin failed:", err);
          return "0.00";
        }
      }
      return "0.00"; // Fallthrough (should not reach here)
    },
    [cpmmContract, marketId, calculateAmountForBudget]
  );

  // ── Buy ───────────────────────────────────────────────────────────────────
  /**
   * Buy shares of a specific outcome.
   * BREAKING: referrer param removed — fees are market-structural in V3.
   *
   * @param outcome      - "yes" (outcomeId 0) or "no" (outcomeId 1)
   * @param sharesAmount - Number of shares to buy (as decimal string, e.g. "100")
   * @param userBudget   - User's stated budget (USDC, 6-decimal) for slippage protection
   * @param slippageBps  - Slippage in basis points (default 200 = 2%)
   */
  const buyShares = async (
    outcome: "yes" | "no",
    sharesAmount: string,
    userBudget: string = "0",
    slippageBps: number = 200
  ): Promise<string> => {
    if (!signer || !cpmmAddress || marketId == null) {
      throw new AppError(
        AppMessageCode.MARKET_DATA_MISSING,
        "Faltan datos de mercado o conexión V3"
      );
    }

    // Validate and adjust budget to meet minimum purchase (contract requires minimum 1 USDC + fees)
    // If budget is <= 1 USDC, adjust to 1 + 3% fee buffer so tx doesn't revert
    // Note: For small budgets, use higher slippage buffer (2%) to handle price impact
    const userBudgetWei = BigInt(Math.floor(parseFloat(userBudget) * 1e6));
    const minBudgetWithFees = MIN_PURCHASE_USDC + (MIN_PURCHASE_USDC * 300n) / 10000n; // ~1.03 USDC
    const slippageBufferBps = 200; // 2% buffer for price impact
    let effectiveBudgetWei = userBudgetWei;
    if (effectiveBudgetWei <= minBudgetWithFees) {
      effectiveBudgetWei = minBudgetWithFees + (minBudgetWithFees * BigInt(slippageBufferBps)) / 10000n;
      console.log(`[useMarketTradingV3] Budget adjusted from ${Number(userBudgetWei) / 1e6} to ${Number(effectiveBudgetWei) / 1e6} USDC (${slippageBufferBps / 100}% buffer)`);
    }

    setIsLoading(true);
    setError(null);

    try {
      const outcomeId: 0 | 1 = outcome === "yes" ? 0 : 1;
      const sharesWei = ethers.parseEther(sharesAmount);

      // 1. Get cost quote
      console.log(`🔍 [useMarketTradingV3] Getting cost quote for ${sharesAmount} shares of outcome ${outcomeId}...`);
      const baseCost = await getQuote(outcomeId, sharesWei);
      if (baseCost === 0n) {
        throw new AppError(AppMessageCode.BUY_TOKENS_FAILED, "Quote returned 0 — market may be inactive");
      }

      // 2. Calculate maxCost based on baseCost + slippage
      // This ensures maxCost is sufficient to cover actual execution cost
      // The user's effectiveBudgetWei is a floor (after min adjustment), not the maxCost
      const slippageBps = 200; // 2% slippage buffer for price impact
      const maxCostFromQuote = baseCost + (baseCost * BigInt(slippageBps)) / 10000n;

      // Ensure maxCost is at least the adjusted budget (with buffer)
      const minBudgetBuffer = (effectiveBudgetWei * 50n) / 10000n; // 0.5%
      const maxCost = maxCostFromQuote > effectiveBudgetWei + minBudgetBuffer
        ? maxCostFromQuote
        : effectiveBudgetWei + minBudgetBuffer;

      console.log(`💵 [useMarketTradingV3] Base cost: ${Number(baseCost) / 1e6} USDC, maxCost (${slippageBps}%): ${Number(maxCost) / 1e6} USDC, user budget: ${Number(effectiveBudgetWei) / 1e6} USDC`);

      // 3. Execute buy via V3 service (handles USDC approval internally)
      const receipt = await service.buyShares(
        cpmmAddress,
        marketId,
        outcomeId,
        sharesWei,
        maxCost
      );

      console.log(`✅ [useMarketTradingV3] Buy confirmed: ${receipt.hash}`);

      // 4. Update local share balance estimate
      setBalances((prev) => ({
        ...prev,
        yes: outcome === "yes" ? prev.yes + sharesWei : prev.yes,
        no: outcome === "no" ? prev.no + sharesWei : prev.no,
      }));

      await sleep(2500);
      await Promise.all([refreshBalances(), refreshPoolStats()]);

      return receipt.hash;
    } catch (err: any) {
      console.error("❌ [useMarketTradingV3] buyShares failed:", err);
      if (err instanceof AppError) {
        setError(err.code);
        throw err;
      }
      const msg = err.reason || err.message || "Error desconocido en la compra V3";
      setError(AppMessageCode.BUY_TOKENS_FAILED);
      throw new AppError(AppMessageCode.BUY_TOKENS_FAILED, msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Redeem ────────────────────────────────────────────────────────────────
  /**
   * Redeem winning shares after market resolution.
   * ⚠️  V3 \"All or Nothing\" policy: must redeem the FULL balance for the outcome.
   * @param outcome - The winning outcome to redeem
   */
  const redeemShares = async (outcome: "yes" | "no") => {
    if (!signer || !cpmmAddress || marketId == null) {
      throw new AppError(
        AppMessageCode.MARKET_DATA_MISSING,
        "Faltan datos de mercado V3 para reclamar"
      );
    }

    // AGREGAR ESTOS LOGS AL INICIO
    const signerAddress = await signer.getAddress();
    console.log("=== [useMarketTradingV3] CLAIM DEBUG ===");
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
      console.log(`💰 [useMarketTradingV3] Redeeming ${ethers.formatEther(sharesToRedeem)} shares of outcome ${outcomeId}...`);

      console.log(`[useMarketTradingV3] Attempting to redeem ${sharesToRedeem.toString()} shares...`);

      const receipt = await service.redeem(
        cpmmAddress,
        marketId,
        outcomeId,
        sharesToRedeem
      );

      console.log(`✅ [useMarketTradingV3] Redeem confirmed: ${receipt.hash}`);

      // Reset local balance
      setBalances((prev) => ({
        ...prev,
        yes: outcome === "yes" ? 0n : prev.yes,
        no: outcome === "no" ? 0n : prev.no,
      }));

      await sleep(2000);
      await refreshBalances();

      return receipt;
    } catch (err: any) {
      console.error("[useMarketTradingV3] FULL ERROR:", err);
      if (err instanceof AppError) {
        setError(err.code);
        throw err;
      }
      const msg = err.reason || err.message || "Error desconocido al reclamar V3";
      setError(AppMessageCode.CLAIM_REWARD_FAILED);
      throw new AppError(AppMessageCode.CLAIM_REWARD_FAILED, msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Actions
    buyShares,
    buyTokens: buyShares, // Alias for compatibility
    redeemShares,
    claimReward: redeemShares, // Alias for compatibility
    // Pricing
    getQuote,
    calculateCost,
    calculateAmountForBudget,
    calculatePotentialWin,
    // State
    isLoading,
    error,
    stats,
    statsError,
    balances,
    // Refresh
    refreshPoolStats,
    refreshBalances,
  };
}
