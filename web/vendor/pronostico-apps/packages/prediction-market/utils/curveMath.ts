/**
 * Asymmetric Bonding Curve Math Simulator
 */

export interface CurveParams {
  pMin: number;
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * Calculates the total cost of buying `n` tokens starting from supply `x`
 */
export function calculateCost(x: number, n: number, params: CurveParams): number {
  const { pMin, a, b, c, d } = params;
  
  // 1. Linear floor
  const part1 = pMin * n;

  // 2. Sigmoid core
  // A * [ (x+n) - B*arctan((x+n)/B) - x + B*arctan(x/B) ]
  const x_n = x + n;
  const arctanHi = b * Math.atan(x_n / b);
  const arctanLo = b * Math.atan(x / b);
  const part2 = a * (x_n - arctanHi - x + arctanLo);

  // 3. Logarithmic tail
  // C * [ (x+n+D)*ln(1 + (x+n)/D) - (x+n) - (x+D)*ln(1 + x/D) + x ]
  const logHi = (x_n + d) * Math.log1p(x_n / d);
  const logLo = (x + d) * Math.log1p(x / d);
  const part3 = c * (logHi - x_n - logLo + x);

  return part1 + part2 + part3;
}

/**
 * Calculates the instantaneous marginal price P(x) at supply x
 */
export function calculateMarginalPrice(x: number, params: CurveParams): number {
  const { pMin, a, b, c, d } = params;

  // P(x) = P_min + A * [ 1 - 1/(1 + (x/B)^2) ] + C * ln(1 + x/D)
  
  const x_div_b = x / b;
  const sigmoidDeriv = 1 - (1 / (1 + x_div_b * x_div_b));
  const logDeriv = Math.log1p(x / d);

  return pMin + a * sigmoidDeriv + c * logDeriv;
}

/**
 * Generates data points for the bonding curve chart
 */
export function generateCurveData(
  params: CurveParams,
  maxShares: number,
  points: number = 100
) {
  const data = [];
  const step = maxShares / points;
  
  for (let i = 0; i <= points; i++) {
    const shares = i * step;
    const price = calculateMarginalPrice(shares, params);
    
    // Calculate cumulative cost from 0 to shares
    const cost = calculateCost(0, shares, params);
    
    data.push({
      shares,
      price,
      cost
    });
  }
  
  return data;
}
