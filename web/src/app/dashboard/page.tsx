"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CreatorStatsGrid } from "@/components/creator-stats-grid";
import { DashboardMarketCard } from "@/components/dashboard-market-card";
import { fetchDemoMarkets, fetchDemoProfile, fetchMeMarkets, fetchMeProfile, walletContextFromUser } from "@/lib/api";
import { aggregateDummyStats, type MarketRow } from "@/lib/market-display";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [markets, setMarkets] = useState<unknown[]>([]);
  const [stats, setStats] = useState({ volume_usdc: 0, trade_count: 0, earned_usdc: 0 });

  useEffect(() => {
    if (!authenticated || !user) return;
    (async () => {
      const ctx = walletContextFromUser(user);
      if (!ctx.wallet && !ctx.smartWallet) return;

      const token = await getIdentityToken();
      const p = token ? await fetchMeProfile(token, ctx) : await fetchDemoProfile(ctx);
      const m = token ? await fetchMeMarkets(token, ctx) : await fetchDemoMarkets(ctx);
      const rows = (m.data ?? []) as MarketRow[];
      setProfile(p);
      setMarkets(rows);
      setStats(aggregateDummyStats(rows));
    })();
  }, [authenticated, user]);

  const ctx = walletContextFromUser(user ?? null);
  const wallet = ctx.smartWallet ?? ctx.wallet;
  const needsWallet = authenticated && !wallet;

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

  const marketRows = markets as MarketRow[];
  const walletDisplay =
    String(profile?.wallet_address ?? wallet ?? "—");
  const walletShort =
    walletDisplay.startsWith("0x") && walletDisplay.length > 12
      ? shortenAddress(walletDisplay)
      : walletDisplay;
  const referralCode = String(profile?.referral_code ?? "—");

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Your creator profile and markets from @PleaseMarketBot.</p>

      <section className="card dashboard-wallet-card" aria-label="Creator stats">
        <CreatorStatsGrid stats={stats} marketCount={marketRows.length} variant="hero" />

        <div className="dashboard-wallet-card__meta">
          <p className="dashboard-wallet-card__line">
            <span className="dashboard-wallet-card__label">Wallet</span>
            <span className="dashboard-wallet-card__value" title={walletDisplay}>
              {walletShort}
            </span>
          </p>
          <p className="dashboard-wallet-card__line">
            <span className="dashboard-wallet-card__label">X</span>
            <span className="dashboard-wallet-card__value">
              {String(profile?.twitter_handle ?? "Not linked — create via @PleaseMarketBot first")}
            </span>
          </p>
          <p className="dashboard-wallet-card__line">
            <span className="dashboard-wallet-card__label">Referral</span>
            <span className="dashboard-wallet-card__value">
              <code className="dashboard-wallet-card__code">{referralCode}</code>
            </span>
          </p>
          <p className="dashboard-wallet-card__hint">
            Referral links attribute trades to you — you earn 10% of fees on those trades.{" "}
            <Link href="/dashboard/share">Create a share link</Link>
          </p>
        </div>
      </section>

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
        <div className="dashboard-market-list">
          {marketRows.map((m) => (
            <DashboardMarketCard key={m.documentId} {...m} />
          ))}
        </div>
      )}
    </div>
  );
}
