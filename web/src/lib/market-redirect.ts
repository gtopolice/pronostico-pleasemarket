import {
  anyoneTestnetMarketUrl,
  anyoneTestnetHomeUrl,
} from "@/lib/anyone-testnet";

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

/** Resolve external URL for a preview market (specific mapping or testnet home). */
export function resolveMarketRedirectUrl(
  documentId: string,
  tradeUrl?: string | null,
): string {
  const fromPayload = tradeUrl ? isSafeRedirectUrl(tradeUrl) : null;
  if (fromPayload) return fromPayload;

  const mapped = anyoneTestnetMarketUrl(documentId);
  if (mapped) return mapped;

  return anyoneTestnetHomeUrl();
}
