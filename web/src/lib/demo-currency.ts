/** Demo stablecoin for hackathon (Bitso MXNB on Arbitrum). */
export const DEMO_STABLECOIN = "MXNB";

export function formatDemoAmount(value: number, digits = 2): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} ${DEMO_STABLECOIN}`;
}

export function formatDemoAmountCompact(value: number, digits = 0): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} ${DEMO_STABLECOIN}`;
}
