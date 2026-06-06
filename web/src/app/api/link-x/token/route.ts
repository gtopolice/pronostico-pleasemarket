import { NextRequest, NextResponse } from "next/server";

const workerBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ detail: "missing token" }, { status: 400 });
  }

  const res = await fetch(`${workerBase}/api/link-x/token?token=${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
