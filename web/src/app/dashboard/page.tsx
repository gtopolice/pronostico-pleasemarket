"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

import { MarketListCard } from "@/components/market-list-card";
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
      const p = token ? await fetchMeProfile(token, ctx) : await fetchDemoProfile(ctx);
      const m = token ? await fetchMeMarkets(token, ctx) : await fetchDemoMarkets(ctx);
      setProfile(p);
      setMarkets(m.data ?? []);
      setStats(m.stats ?? {});
    })();
  }, [authenticated, user]);

  const ctx = walletContextFromUser(user ?? null);
  const wallet = ctx.wallet;
  const needsWallet = authenticated && !wallet && !ctx.smartWallet;

  if (!ready) return <p className="empty-state">Loading…</p>;
  if (!authenticated || needsWallet) {
    return (
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="card empty-state">
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

  const marketRows = markets as Array<{ title?: string; documentId?: string; state?: string }>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Your creator profile and markets from @PleaseMarketBot.</p>

      <div className="card stats-grid">
        <div>
          <p className="stat-line">
            <span>Wallet · </span>
            {String(profile?.wallet_address ?? wallet ?? "—")}
          </p>
          <p className="stat-line">
            <span>X · </span>
            {String(profile?.twitter_handle ?? "Not linked — create via @PleaseMarketBot first")}
          </p>
        </div>
        <div>
          <p className="stat-line">
            <span>Referral · </span>
            {String(profile?.referral_code ?? "—")}
          </p>
          <p className="stat-line">
            <span>Volume · </span>${stats.volume_usdc ?? 0} · Trades: {stats.trade_count ?? 0}
          </p>
        </div>
      </div>

      <nav className="dashboard-nav" aria-label="Dashboard sections">
        <a href="/dashboard/resolve">Resolve queue</a>
        <a href="/dashboard/earnings">Earnings</a>
        <a href="/dashboard/share">Share</a>
      </nav>

      <h2 style={{ margin: "0 0 1rem", fontSize: "1.125rem" }}>My markets</h2>
      {marketRows.length === 0 ? (
        <p className="card empty-state">
          No markets yet. Tag @PleaseMarketBot on X to create your first preview market.
        </p>
      ) : (
        <div className="market-list">
          {marketRows.map((m) => (
            <MarketListCard
              key={m.documentId}
              id={m.documentId}
              title={m.title}
              state={m.state}
            />
          ))}
        </div>
      )}
    </div>
  );
}
