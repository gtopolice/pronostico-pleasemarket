import { NextRequest, NextResponse } from "next/server";

const workerBase = process.env.NEXT_PUBLIC_CHIWIWIS_API_BASE ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${workerBase}/api/link-x/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
