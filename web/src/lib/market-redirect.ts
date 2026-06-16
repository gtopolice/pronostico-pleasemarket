/** Hardcoded demo-market → live Anyone testnet URLs (hackathon bridge). */
const STATIC_MARKET_REDIRECTS: Record<string, string> = {
  "46438911-198d-4907-bd90-50f281240cae":
    "https://testnet.anyone.market/market/d4zi936ebovywtfhkk9s13yy",
};

function isSafeRedirectUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Resolve an external trade URL for a preview market, if configured. */
export function resolveMarketRedirectUrl(
  documentId: string,
  tradeUrl?: string | null,
): string | null {
  const fromPayload = tradeUrl ? isSafeRedirectUrl(tradeUrl) : null;
  if (fromPayload) return fromPayload;
  return STATIC_MARKET_REDIRECTS[documentId] ?? null;
}
