import { CurveParams, calculateCost, calculateMarginalPrice } from "./curveMath";

export interface TuningTargets {
  maxShares: number;
  /** Maximum acceptable avg price (USDC/share) for early buyers (10% volume) */
  earlyMaxPrice: number;
  /** Maximum acceptable avg price (USDC/share) at mid volume (50%) */
  midMaxPrice: number;
  /** Maximum acceptable avg price (USDC/share) for late buyers (90% volume) */
  lateMaxPrice: number;
  /** Minimum price multiplier: latePrice / earlyPrice (ensures the curve grows) */
  minPriceGrowthRatio: number;
}

/**
 * Calculates the average price paid per share when buying `sharesToBuy` starting at `currentSupply`.
 * Avg Price = totalCost / sharesToBuy
 */
function calculateAvgPrice(params: CurveParams, currentSupply: number, sharesToBuy: number): number {
  if (sharesToBuy <= 0) return 0;
  const cost = calculateCost(currentSupply, sharesToBuy, params);
  return cost / sharesToBuy;
}

/**
 * Loss function: penalizes curves that don't meet price targets.
 * 
 * A "good curve" has:
 * - Low avg price at early adoption (buyers get cheap shares)
 * - Moderate price at mid
 * - Higher price at late adoption (scarcity premium)
 * - Good price growth ratio (late >> early shows the curve actually curves)
 */
export function calculateCurveLoss(params: CurveParams, targets: TuningTargets): number {
  const purchaseSize = targets.maxShares * 0.01; // 1% of max volume as test purchase

  const earlySupply = targets.maxShares * 0.05; // 5% point (early entrant)
  const midSupply = targets.maxShares * 0.50; // 50% point
  const lateSupply = targets.maxShares * 0.90; // 90% point

  const earlyPrice = calculateAvgPrice(params, earlySupply, purchaseSize);
  const midPrice = calculateAvgPrice(params, midSupply, purchaseSize);
  const latePrice = calculateAvgPrice(params, lateSupply, purchaseSize);
  const startPrice = calculateMarginalPrice(0, params);

  // Penalize invalid / non-physical params
  let penalty = 0;
  if (params.pMin < 0.001 || params.pMin > 0.5) penalty += 1e9;
  if (params.a < 0.01 || params.a > 10) penalty += 1e9;
  if (params.b < 100) penalty += 1e9;
  if (params.c < 0.001 || params.c > 5) penalty += 1e9;
  if (params.d < 100) penalty += 1e9;
  if (earlyPrice <= 0 || midPrice <= 0 || latePrice <= 0) penalty += 1e9;

  // --- Core objectives (squared error vs targets) ---
  const earlyErr = Math.pow(Math.max(0, earlyPrice - targets.earlyMaxPrice), 2);
  const midErr = Math.pow(Math.max(0, midPrice - targets.midMaxPrice), 2);
  const lateErr = Math.pow(Math.max(0, latePrice - targets.lateMaxPrice), 2);

  // Reward steeper growth ratio (we want latePrice / earlyPrice to be high)
  const actualGrowthRatio = latePrice / Math.max(earlyPrice, 1e-9);
  const growthErr = Math.pow(Math.max(0, targets.minPriceGrowthRatio - actualGrowthRatio), 2) * 1000;

  // Penalize flat curves (where late is not at least 2x early)
  const flatnessPenalty = actualGrowthRatio < 1.5 ? 1e6 : 0;

  // Penalize very high starting prices (pMin too high)
  const startPricePenalty = startPrice > targets.earlyMaxPrice * 2 ? 1e6 : 0;

  return earlyErr + midErr + lateErr + growthErr + flatnessPenalty + startPricePenalty + penalty;
}

export function tuneCurve(targets: TuningTargets): CurveParams {
  let bestParams: CurveParams | null = null;
  let bestLoss = Infinity;

  const M = targets.maxShares;

  // 1. Random Global Search — 20,000 candidates across the valid parameter space
  for (let i = 0; i < 20000; i++) {
    const params: CurveParams = {
      pMin: 0.001 + Math.random() * 0.1,        // $0.001 to $0.101 floor price
      a: 0.05 + Math.random() * 3.0,         // Sigmoid amplitude
      b: M * (0.05 + Math.random() * 0.6),    // Inflection point: 5-65% of max
      c: 0.005 + Math.random() * 0.5,         // Log tail amplitude
      d: M * (0.1 + Math.random() * 0.5),    // Log tail scale
    };
    const loss = calculateCurveLoss(params, targets);
    if (loss < bestLoss) {
      bestLoss = loss;
      bestParams = { ...params };
    }
  }

  // 2. Local Hill Climbing — refine the best candidate with 5,000 micro-adjustments
  if (bestParams) {
    let current = { ...bestParams };
    let currentLoss = bestLoss;

    for (let i = 0; i < 5000; i++) {
      const keys: (keyof CurveParams)[] = ["pMin", "a", "b", "c", "d"];
      const key = keys[Math.floor(Math.random() * 5)];
      const neighbor = { ...current };

      // Step size: ±3% for fine refinement
      const step = 1 + (Math.random() - 0.5) * 0.06;
      neighbor[key] = Math.max(1e-6, neighbor[key] * step);

      const loss = calculateCurveLoss(neighbor, targets);
      if (loss < currentLoss) {
        currentLoss = loss;
        current = { ...neighbor };
      }
    }
    bestParams = current;
  }

  return {
    pMin: Number(bestParams!.pMin.toFixed(5)),
    a: Number(bestParams!.a.toFixed(4)),
    b: Math.round(bestParams!.b),
    c: Number(bestParams!.c.toFixed(5)),
    d: Math.round(bestParams!.d),
  };
}

/**
 * Helper: compute actual avg prices at key milestones for display in the UI.
 */
export function evaluateCurve(params: CurveParams, maxShares: number): {
  earlyAvgPrice: number;
  midAvgPrice: number;
  lateAvgPrice: number;
  priceGrowthRatio: number;
} {
  const purchaseSize = maxShares * 0.01;
  const early = calculateAvgPrice(params, maxShares * 0.05, purchaseSize);
  const mid = calculateAvgPrice(params, maxShares * 0.50, purchaseSize);
  const late = calculateAvgPrice(params, maxShares * 0.90, purchaseSize);
  return {
    earlyAvgPrice: early,
    midAvgPrice: mid,
    lateAvgPrice: late,
    priceGrowthRatio: late / Math.max(early, 1e-9),
  };
}
