"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "@/components/locale-provider";
import { CreatorStatsGrid } from "@/components/creator-stats-grid";
import { DashboardMarketCard } from "@/components/dashboard-market-card";
import { fetchDemoMarkets, fetchDemoProfile, fetchMeMarkets, fetchMeProfile, walletContextFromUser } from "@/lib/api";
import { loadClaimedEarnings, saveClaimedEarnings } from "@/lib/claimed-earnings";
import { localePath } from "@/lib/i18n";
import { aggregateDummyStats, withUserClaims, type MarketRow } from "@/lib/market-display";

const EMPTY_STATS = {
  volume_usdc: 0,
  trade_count: 0,
  earned_usdc: 0,
  claimed_usdc: 0,
  unclaimed_usdc: 0,
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations();
  const { ready, authenticated, login, user } = usePrivy();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [markets, setMarkets] = useState<unknown[]>([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [userClaimedTotal, setUserClaimedTotal] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated || !user) return;
    (async () => {
      const ctx = walletContextFromUser(user);
      if (!ctx.wallet && !ctx.smartWallet) return;

      const token = await getIdentityToken();
      const p = token ? await fetchMeProfile(token, ctx) : await fetchDemoProfile(ctx);
      const m = token ? await fetchMeMarkets(token, ctx) : await fetchDemoMarkets(ctx);
      const rows = (m.data ?? []) as MarketRow[];
      const walletKey = ctx.smartWallet ?? ctx.wallet;
      setProfile(p);
      setMarkets(rows);
      setUserClaimedTotal(loadClaimedEarnings(walletKey));
      setStats(withUserClaims(aggregateDummyStats(rows), loadClaimedEarnings(walletKey)));
    })();
  }, [authenticated, user]);

  useEffect(() => {
    const rows = markets as MarketRow[];
    setStats(withUserClaims(aggregateDummyStats(rows), userClaimedTotal));
  }, [markets, userClaimedTotal]);

  const ctx = walletContextFromUser(user ?? null);
  const wallet = ctx.smartWallet ?? ctx.wallet;
  const needsWallet = authenticated && !wallet;

  if (!ready) return <p className="empty-state">{t.dashboard.loading}</p>;
  if (!authenticated || needsWallet) {
    return (
      <div>
        <h1 className="page-title">{t.dashboard.title}</h1>
        <p className="card empty-state">
          {needsWallet ? t.dashboard.walletMissing : t.dashboard.signInPrompt}
        </p>
        <button className="btn" type="button" onClick={login}>
          {t.dashboard.signIn}
        </button>
      </div>
    );
  }

  const marketRows = markets as MarketRow[];
  const walletDisplay = String(profile?.wallet_address ?? wallet ?? "—");
  const walletShort =
    walletDisplay.startsWith("0x") && walletDisplay.length > 12
      ? shortenAddress(walletDisplay)
      : walletDisplay;
  const referralCode = String(profile?.referral_code ?? "—");

  async function handleClaim() {
    if (!wallet || stats.unclaimed_usdc <= 0 || claiming) return;
    setClaiming(true);
    setClaimMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const nextClaimed = userClaimedTotal + stats.unclaimed_usdc;
      setUserClaimedTotal(nextClaimed);
      saveClaimedEarnings(wallet, nextClaimed);
      setClaimMessage(
        t.dashboard.claimed.replace("{amount}", stats.unclaimed_usdc.toFixed(2)),
      );
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">{t.dashboard.title}</h1>
      <p className="page-subtitle">{t.dashboard.subtitle}</p>

      <section className="card dashboard-wallet-card" aria-label="Creator stats">
        <CreatorStatsGrid
          stats={stats}
          marketCount={marketRows.length}
          variant="hero"
          onClaim={handleClaim}
          claiming={claiming}
        />
        {claimMessage ? <p className="creator-stats__claim-message">{claimMessage}</p> : null}

        <div className="dashboard-wallet-card__meta">
          <p className="dashboard-wallet-card__line">
            <span className="dashboard-wallet-card__label">{t.dashboard.wallet}</span>
            <span className="dashboard-wallet-card__value" title={walletDisplay}>
              {walletShort}
            </span>
          </p>
          <p className="dashboard-wallet-card__line">
            <span className="dashboard-wallet-card__label">{t.dashboard.xAccount}</span>
            <span className="dashboard-wallet-card__value">
              {String(profile?.twitter_handle ?? t.dashboard.xNotLinked)}
            </span>
          </p>
          <p className="dashboard-wallet-card__line">
            <span className="dashboard-wallet-card__label">{t.dashboard.referral}</span>
            <span className="dashboard-wallet-card__value">
              <code className="dashboard-wallet-card__code">{referralCode}</code>
            </span>
          </p>
          <p className="dashboard-wallet-card__hint">
            {t.dashboard.referralHint}{" "}
            <Link href={localePath(locale, "dashboard/share")}>{t.dashboard.shareLink}</Link>
          </p>
        </div>
      </section>

      <nav className="dashboard-nav" aria-label="Dashboard sections">
        <a href={localePath(locale, "dashboard/resolve")}>{t.dashboard.resolveQueue}</a>
        <a href={localePath(locale, "dashboard/earnings")}>{t.dashboard.earnings}</a>
        <a href={localePath(locale, "dashboard/share")}>{t.dashboard.share}</a>
      </nav>

      <h2 style={{ margin: "0 0 1rem", fontSize: "1.125rem" }}>{t.dashboard.myMarkets}</h2>
      {marketRows.length === 0 ? (
        <p className="card empty-state">{t.dashboard.noMarkets}</p>
      ) : (
        <div className="dashboard-market-list">
          {marketRows.map((m) => (
            <DashboardMarketCard key={m.documentId} {...m} lang={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
