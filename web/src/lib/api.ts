const workerBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";
const pleaseWeb =
  process.env.NEXT_PUBLIC_PLEASE_WEB_URL ??
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

type WalletContext = { wallet?: string; smartWallet?: string };

export async function fetchDemoProfile(ctx: WalletContext) {
  if (!ctx.wallet && !ctx.smartWallet) return null;
  const q = new URLSearchParams();
  if (ctx.wallet) q.set("wallet", ctx.wallet);
  if (ctx.smartWallet) q.set("smart_wallet", ctx.smartWallet);
  const res = await fetch(`/api/demo/profile?${q}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDemoMarkets(ctx: WalletContext) {
  if (!ctx.wallet && !ctx.smartWallet) return { data: [], stats: {} };
  const q = new URLSearchParams();
  if (ctx.wallet) q.set("wallet", ctx.wallet);
  if (ctx.smartWallet) q.set("smart_wallet", ctx.smartWallet);
  const res = await fetch(`/api/demo/markets?${q}`);
  if (!res.ok) return { data: [], stats: {} };
  return res.json();
}

export async function fetchMeMarkets(identityToken: string, ctx: WalletContext = {}) {
  const res = await fetch(`/api/traders/me/markets`, {
    headers: { "X-Privy-Identity-Token": identityToken },
  });
  if (res.ok) return res.json();
  return fetchDemoMarkets(ctx);
}

export async function fetchMeProfile(identityToken: string, ctx: WalletContext = {}) {
  const res = await fetch(`/api/traders/me/profile`, {
    headers: { "X-Privy-Identity-Token": identityToken },
  });
  if (res.ok) return res.json();
  return fetchDemoProfile(ctx);
}

export async function fetchLinkToken(token: string) {
  const res = await fetch(`/api/link-x/token?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error("invalid link token");
  return res.json() as Promise<{ twitter_id: string; twitter_handle?: string | null }>;
}

export async function completeLinkX(
  token: string,
  wallet: string,
  smartWallet?: string,
  identityToken?: string | null,
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (identityToken) {
    headers["privy-id-token"] = identityToken;
  }

  const res = await fetch("/api/link-x/complete", {
    method: "POST",
    headers,
    body: JSON.stringify({
      token,
      wallet_address: wallet,
      smart_wallet_address: smartWallet,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "link failed";
    if (detail === "link-x-identity-mismatch") {
      throw new Error("This X account does not match the account that tagged @PleaseMarketBot.");
    }
    if (detail === "twitter-not-linked") {
      throw new Error("Connect your X account before completing the link.");
    }
    throw new Error(detail);
  }
  return data;
}

export async function fetchLeaderboard(period?: number) {
  const q = period ? `?period=${period}` : "";
  const res = await fetch(`${workerBase}/api/leaderboard${q}`, { next: { revalidate: 60 } });
  if (!res.ok) return { data: [] };
  return res.json();
}

export async function fetchRecentMarkets(limit = 24) {
  try {
    const res = await fetch(`${workerBase}/api/markets?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) {
      return { data: [] as Array<{ documentId?: string; title?: string; question?: string; state?: string; creator_twitter_handle?: string | null; creator_profile_image_url?: string | null }> };
    }
    return res.json() as Promise<{
      data: Array<{
        documentId?: string;
        title?: string;
        question?: string;
        state?: string;
        creator_twitter_handle?: string | null;
        creator_profile_image_url?: string | null;
      }>;
    }>;
  } catch {
    return { data: [] };
  }
}

export function shareUrl(marketDoc: string, ref: string, lang = "en") {
  return `${pleaseWeb}/${lang}/market/${marketDoc}?ref=${ref}&src=please_market_share`;
}

export function twitterIntent(text: string, url: string) {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function marketUrl(documentId: string, lang = "en") {
  return `${pleaseWeb}/${lang}/market/${documentId}`;
}

export function walletContextFromUser(user: {
  wallet?: { address?: string };
  linkedAccounts?: Array<{ type?: string; address?: string }>;
} | null): WalletContext {
  const smartWallet = user?.linkedAccounts?.find((a) => a.type === "smart_wallet")?.address;
  const embedded = user?.wallet?.address;
  return {
    wallet: embedded ?? smartWallet,
    smartWallet: smartWallet ?? embedded,
  };
}
