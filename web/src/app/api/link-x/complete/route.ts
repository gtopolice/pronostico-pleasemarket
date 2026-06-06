import { NextRequest, NextResponse } from "next/server";

import { verifiedTwitterFromIdentityToken } from "@/lib/privy-server";

const workerBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const identityToken =
    request.headers.get("privy-id-token") ?? request.headers.get("x-privy-identity-token");
  if (!identityToken) {
    return NextResponse.json({ detail: "missing identity token" }, { status: 401 });
  }

  const body = await request.json();
  const token = body?.token as string | undefined;
  const walletAddress = body?.wallet_address as string | undefined;
  const smartWalletAddress = body?.smart_wallet_address as string | undefined;
  if (!token || !walletAddress) {
    return NextResponse.json({ detail: "missing token or wallet" }, { status: 400 });
  }

  let twitterAccount;
  try {
    twitterAccount = await verifiedTwitterFromIdentityToken(identityToken);
  } catch {
    return NextResponse.json({ detail: "privy-not-configured" }, { status: 503 });
  }

  if (!twitterAccount) {
    return NextResponse.json({ detail: "twitter-not-linked" }, { status: 403 });
  }

  const linkSecret = process.env.LINK_COMPLETE_SECRET ?? "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (linkSecret) {
    headers["X-Link-Complete-Secret"] = linkSecret;
  }

  const res = await fetch(`${workerBase}/api/link-x/complete`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      token,
      wallet_address: walletAddress,
      smart_wallet_address: smartWalletAddress,
      verified_twitter_id: twitterAccount.subject,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
