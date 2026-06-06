export type MarketKindRow = {
  dry_run?: boolean;
  hackathon_fallback?: boolean;
  demo_seed?: boolean;
  is_live?: boolean;
  source?: string;
  cpmm_address?: string | null;
  cpmm_market_id?: string | number | null;
  state?: string | null;
};

export function isDemoMarket(row: MarketKindRow): boolean {
  if (row.is_live) return false;
  return Boolean(
    row.dry_run ||
      row.hackathon_fallback ||
      row.demo_seed ||
      row.source === "seed" ||
      row.source === "agent",
  );
}

export function isLiveMarket(row: MarketKindRow): boolean {
  if (row.is_live) return true;
  if (isDemoMarket(row)) return false;
  const cpmmId = Number(row.cpmm_market_id);
  const hasChain =
    Boolean(row.cpmm_address?.startsWith("0x")) &&
    Number.isFinite(cpmmId) &&
    cpmmId > 0;
  return hasChain && row.source === "strapi";
}
