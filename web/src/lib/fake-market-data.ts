export type ChartPoint = { x: string; y: number };

export const DEFAULT_MARKET_IMAGE = "https://anyone.market/og-image.png";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function fakeMarketStats(marketId: string) {
  const seed = hashString(marketId);
  const priceYes = 0.3 + (seed % 41) / 100;
  const priceNo = 1 - priceYes;

  return {
    priceYes,
    priceNo,
    probability: priceYes,
    volumeUsdc: 1_200 + (seed % 48_000),
  };
}

export function fakeChartPoints(marketId: string, selectedShare: "YES" | "NO"): ChartPoint[] {
  const seed = hashString(`${marketId}:${selectedShare}`);
  const points: ChartPoint[] = [];
  const now = Date.now();
  const pointCount = 8;
  let value = 18 + (seed % 55);

  for (let index = 0; index < pointCount; index += 1) {
    const timestamp = now - (pointCount - 1 - index) * 24 * 60 * 60 * 1000;
    value += ((seed >> (index * 2)) % 9) - 4;
    value = Math.max(8, Math.min(92, value));
    const y = selectedShare === "NO" ? 100 - value : value;
    points.push({ x: new Date(timestamp).toISOString(), y });
  }

  return points;
}

export function formatUsd(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
