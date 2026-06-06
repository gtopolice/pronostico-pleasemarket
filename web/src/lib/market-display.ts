export type MarketStatus = "open" | "closed" | "resolved";

export type MarketRow = {
  documentId?: string;
  title?: string;
  question?: string;
  state?: string;
  close_time_utc?: string;
  resolution_rules?: string;
  description?: string;
  creator_twitter_handle?: string;
  creator_profile_image_url?: string;
};

export type MarketDummyStats = {
  volume_usdc: number;
  trade_count: number;
  earned_usdc: number;
  claimed_usdc: number;
  unclaimed_usdc: number;
};

function roundUsd(value: number): number {
  return Number(value.toFixed(2));
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function dummyMarketStats(documentId: string): MarketDummyStats {
  const seed = hashSeed(documentId);
  const earned_usdc = roundUsd(2 + (seed % 4300) / 100);
  const claimed_usdc = roundUsd(earned_usdc * ((seed % 65) / 100));
  const unclaimed_usdc = roundUsd(earned_usdc - claimed_usdc);
  return {
    volume_usdc: 120 + (seed % 4680),
    trade_count: 3 + (seed % 87),
    earned_usdc,
    claimed_usdc,
    unclaimed_usdc,
  };
}

export function withUserClaims(stats: MarketDummyStats, userClaimedTotal: number): MarketDummyStats {
  const claimed_usdc = roundUsd(Math.min(stats.earned_usdc, stats.claimed_usdc + userClaimedTotal));
  return {
    ...stats,
    claimed_usdc,
    unclaimed_usdc: roundUsd(stats.earned_usdc - claimed_usdc),
  };
}

export function aggregateDummyStats(markets: MarketRow[]): MarketDummyStats {
  return markets.reduce(
    (acc, market) => {
      if (!market.documentId) return acc;
      const stats = dummyMarketStats(market.documentId);
      const earned_usdc = roundUsd(acc.earned_usdc + stats.earned_usdc);
      const claimed_usdc = roundUsd(acc.claimed_usdc + stats.claimed_usdc);
      return {
        volume_usdc: acc.volume_usdc + stats.volume_usdc,
        trade_count: acc.trade_count + stats.trade_count,
        earned_usdc,
        claimed_usdc,
        unclaimed_usdc: roundUsd(earned_usdc - claimed_usdc),
      };
    },
    {
      volume_usdc: 0,
      trade_count: 0,
      earned_usdc: 0,
      claimed_usdc: 0,
      unclaimed_usdc: 0,
    },
  );
}

export function marketStatus(market: Pick<MarketRow, "state" | "close_time_utc">, now = Date.now()): MarketStatus {
  const state = (market.state ?? "").toUpperCase();
  if (state === "RESOLVED") return "resolved";

  const close = market.close_time_utc ? new Date(market.close_time_utc).getTime() : 0;
  if (close > 0 && close <= now) return "closed";
  return "open";
}

export function marketStatusLabel(status: MarketStatus): string {
  if (status === "resolved") return "Resolved";
  if (status === "closed") return "Closed";
  return "Open";
}

export function formatCloseTime(closeTimeUtc?: string): string {
  if (!closeTimeUtc) return "—";
  return new Date(closeTimeUtc).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";
}

export function marketRules(market: Pick<MarketRow, "resolution_rules" | "description">): string {
  return market.resolution_rules ?? market.description ?? "No resolution rules provided.";
}
