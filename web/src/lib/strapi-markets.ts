import { normalizeMarketRow } from "@/lib/market-option";

export type GridMarketRow = Record<string, unknown> & {
  documentId?: string;
  title?: string;
  question?: string;
  dry_run?: boolean;
  is_live?: boolean;
  source?: string;
};

function apiBase(): string {
  return (process.env.API_URL ?? "https://prod.api.pronostico.market/api").replace(/\/$/, "");
}

function apiToken(): string {
  return process.env.API_TOKEN?.trim() ?? "";
}

export async function fetchLiveStrapiMarkets(locale = "es", limit = 24): Promise<GridMarketRow[]> {
  const token = apiToken();
  if (!token) return [];

  const params = new URLSearchParams({
    "pagination[page]": "1",
    "pagination[pageSize]": String(Math.min(Math.max(limit, 1), 100)),
    "sort[0]": "updatedAt:desc",
    locale,
    "filters[state][$eq]": "PUBLISHED",
    "populate[image]": "true",
    "populate[category][populate][image]": "true",
  });

  const res = await fetch(`${apiBase()}/markets?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];

  const body = (await res.json()) as { data?: Array<Record<string, unknown>> };
  const rows = body.data ?? [];
  const out: GridMarketRow[] = [];

  for (const row of rows) {
    const option = normalizeMarketRow(row);
    if (!option) continue;
    out.push({
      ...row,
      ...option,
      documentId: option.documentId,
      title: option.title,
      question: String(row.question ?? option.title),
      dry_run: false,
      is_live: true,
      source: "strapi",
      cpmm_address: option.tradingContractAddress,
      cpmm_market_id: String(option.cpmmMarketId),
      contract_version: option.contractVersion,
      close_time_utc: option.closeTimeUtc,
      sort_at: row.updatedAt ?? row.publishedAt ?? row.createdAt,
    });
  }

  return out;
}

export function mergeMarketLists(
  live: GridMarketRow[],
  preview: GridMarketRow[],
  limit: number,
): GridMarketRow[] {
  const seen = new Set<string>();
  const merged: GridMarketRow[] = [];

  for (const row of [...live, ...preview]) {
    const docId = typeof row.documentId === "string" ? row.documentId : "";
    if (!docId || seen.has(docId)) continue;
    seen.add(docId);
    merged.push(row);
  }

  merged.sort((a, b) => {
    const aTime = Date.parse(String(a.sort_at ?? a.created_at ?? 0));
    const bTime = Date.parse(String(b.sort_at ?? b.created_at ?? 0));
    return bTime - aTime;
  });

  return merged.slice(0, Math.max(1, Math.min(limit, 100)));
}
