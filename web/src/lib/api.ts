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

export async function completeLinkX(
  token: string,
  wallet: string,
  smartWallet?: string,
) {
  const res = await fetch(`${workerBase}/api/link-x/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      wallet_address: wallet,
      smart_wallet_address: smartWallet,
    }),
  });
  if (!res.ok) throw new Error("link failed");
  return res.json();
}

export async function fetchLeaderboard(period?: number) {
  const q = period ? `?period=${period}` : "";
  const res = await fetch(`${workerBase}/api/leaderboard${q}`, { next: { revalidate: 60 } });
  if (!res.ok) return { data: [] };
  return res.json();
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
