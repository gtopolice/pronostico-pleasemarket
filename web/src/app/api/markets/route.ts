import { NextRequest, NextResponse } from "next/server";

const workerBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const res = await fetch(`${workerBase}/api/markets?${url.searchParams}`, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, {
    status: res.status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
