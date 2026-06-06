import { isAddress } from "viem";

import { isLiveMarket, type MarketKindRow } from "@/lib/market-kind";

export type MarketOption = {
  id: number;
  documentId?: string;
  cpmmMarketId: number;
  title: string;
  poolAddress: string;
  tradingContractAddress: string;
  contractVersion?: "V3" | "V4" | string;
  imageUrl?: string;
  volumeDisplay?: string;
  probabilityYes?: number;
  probabilityNo?: number;
  state?: string;
  closeTimeUtc?: string | null;
};

function parseCpmmMarketId(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.trunc(raw);
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function normalizePhotoUrl(urlLike: unknown): string | null {
  if (typeof urlLike !== "string") return null;
  const raw = urlLike.trim();
  if (!raw) return null;
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) {
    const base =
      process.env.NEXT_PUBLIC_ANYONE_WEB_BASE?.replace(/\/$/, "") ?? "https://anyone.market";
    try {
      return new URL(raw, base).toString();
    } catch {
      return null;
    }
  }
  return null;
}

function pickMarketImageUrl(item: Record<string, unknown>): string | undefined {
  const img = item.image;
  if (img && typeof img === "object") {
    const fromObj = normalizePhotoUrl((img as { url?: string }).url);
    if (fromObj) return fromObj;
  }
  return normalizePhotoUrl(item.image_url) ?? undefined;
}

function formatVolumeUsd(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  const n = Number(typeof raw === "string" ? raw.replace(/,/g, "") : raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

/** Normalize one API market row; returns null if required chain fields are missing. */
export function normalizeMarketRow(item: Record<string, unknown>): MarketOption | null {
  const cpmmMarketId = parseCpmmMarketId(item.cpmm_market_id);
  const id = Number(item.id);
  const tradeContractRaw = item.cpmm_address ?? item.pool_address ?? "";
  const tradingContractAddress =
    typeof tradeContractRaw === "string" ? tradeContractRaw : String(tradeContractRaw);
  const title = String(item.title ?? item.question ?? `Market #${String(item.id ?? "?")}`);

  if (
    cpmmMarketId === null ||
    !Number.isFinite(id) ||
    id <= 0 ||
    title.length === 0 ||
    !isAddress(tradingContractAddress)
  ) {
    return null;
  }

  const poolRaw = item.pool_address ?? tradingContractAddress;
  const poolAddress = isAddress(String(poolRaw)) ? String(poolRaw) : tradingContractAddress;

  let probabilityYes: number | undefined;
  let probabilityNo: number | undefined;
  if (typeof item.current_probability_yes === "number") {
    probabilityYes = item.current_probability_yes;
  }
  if (typeof item.current_probability_no === "number") {
    probabilityNo = item.current_probability_no;
  } else if (probabilityYes !== undefined) {
    probabilityNo = Math.max(0, Math.min(100, 100 - probabilityYes));
  }

  const contractVersionRaw = item.contract_version ?? item.contractVersion;
  const contractVersion =
    typeof contractVersionRaw === "string" && contractVersionRaw.trim()
      ? contractVersionRaw.trim().toUpperCase()
      : undefined;

  const documentId =
    typeof item.documentId === "string" && item.documentId.trim()
      ? item.documentId.trim()
      : undefined;

  return {
    id,
    documentId,
    cpmmMarketId,
    title,
    poolAddress,
    tradingContractAddress,
    contractVersion,
    imageUrl: pickMarketImageUrl(item),
    volumeDisplay: formatVolumeUsd(item.volume),
    probabilityYes,
    probabilityNo,
    state: typeof item.state === "string" ? item.state : undefined,
    closeTimeUtc: typeof item.close_time_utc === "string" ? item.close_time_utc : null,
  };
}

export function marketOptionFromRecord(row: MarketKindRow & Record<string, unknown>): MarketOption | null {
  if (!isLiveMarket(row)) return null;
  return normalizeMarketRow(row);
}
