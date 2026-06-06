import { NextRequest, NextResponse } from "next/server";

import { fetchLiveStrapiMarkets, mergeMarketLists } from "@/lib/strapi-markets";

const workerBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "24");
  const locale = url.searchParams.get("locale") ?? "es";

  const workerParams = new URLSearchParams(url.searchParams);
  workerParams.set("locale", locale);

  const [workerRes, liveRows] = await Promise.all([
    fetch(`${workerBase}/api/markets?${workerParams}`, { cache: "no-store" }),
    fetchLiveStrapiMarkets(locale, limit),
  ]);

  const workerBody = (await workerRes.json().catch(() => ({ data: [] }))) as {
    data?: Array<Record<string, unknown>>;
  };
  const previewRows = workerBody.data ?? [];

  const data = mergeMarketLists(liveRows, previewRows, limit);

  return NextResponse.json(
    { data },
    {
      status: workerRes.ok || data.length > 0 ? 200 : workerRes.status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
