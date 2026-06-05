import { NextRequest, NextResponse } from "next/server";

const backend = process.env.API_URL?.replace(/\/$/, "") ?? "";

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const sub = path.join("/");
  const token = request.headers.get("x-privy-identity-token");
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const res = await fetch(`${backend}/traders/me/${sub}${url.search}`, {
    headers: { "X-Privy-Identity-Token": token },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
