"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { fetchDemoMarkets, fetchDemoProfile, fetchMeMarkets, fetchMeProfile, walletContextFromUser } from "@/lib/api";

export default function DashboardPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [markets, setMarkets] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authenticated || !user) return;
    (async () => {
      const ctx = walletContextFromUser(user);
      if (!ctx.wallet && !ctx.smartWallet) return;

      const token = await getIdentityToken();
      const p = token
        ? await fetchMeProfile(token, ctx)
        : await fetchDemoProfile(ctx);
      const m = token
        ? await fetchMeMarkets(token, ctx)
        : await fetchDemoMarkets(ctx);
      setProfile(p);
      setMarkets(m.data ?? []);
      setStats(m.stats ?? {});
    })();
  }, [authenticated, user]);

  const ctx = walletContextFromUser(user ?? null);
  const wallet = ctx.wallet;
  const needsWallet = authenticated && !wallet && !ctx.smartWallet;

  if (!ready) return <p>Loading…</p>;
  if (!authenticated || needsWallet) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="card">
          {needsWallet
            ? "Wallet not connected in this session. Sign in again with the same Privy account you used on /link-x."
            : "Sign in to view your markets and referral link."}
        </p>
        <button className="btn" type="button" onClick={login}>
          Sign in with Privy
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card">
        <p>Wallet: {String(profile?.wallet_address ?? wallet ?? "—")}</p>
        <p>X: {String(profile?.twitter_handle ?? "Not linked — create via @PleaseMarket first")}</p>
        <p>Referral code: {String(profile?.referral_code ?? "—")}</p>
        <p>Volume: ${stats.volume_usdc ?? 0} · Trades: {stats.trade_count ?? 0}</p>
      </div>
      <nav>
        <a href="/dashboard/resolve">Resolve queue</a> ·{" "}
        <a href="/dashboard/earnings">Earnings</a> ·{" "}
        <a href="/dashboard/share">Share</a>
      </nav>
      <h2>My markets</h2>
      {(markets as Array<{ title?: string; documentId?: string; state?: string }>).map((m) => (
        <div key={m.documentId} className="card">
          <strong>{m.title}</strong>
          <p>State: {m.state}</p>
        </div>
      ))}
    </div>
  );
}
