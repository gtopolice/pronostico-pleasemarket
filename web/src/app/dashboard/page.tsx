"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { fetchMeMarkets, fetchMeProfile, walletContextFromUser } from "@/lib/api";

export default function DashboardPage() {
  const { ready, authenticated, login, user } = usePrivy();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [markets, setMarkets] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const token = await getIdentityToken();
      if (!token) return;
      const ctx = walletContextFromUser(user);
      const p = await fetchMeProfile(token, ctx);
      const m = await fetchMeMarkets(token, ctx);
      setProfile(p);
      setMarkets(m.data ?? []);
      setStats(m.stats ?? {});
    })();
  }, [authenticated, user]);

  if (!ready) return <p>Loading…</p>;
  if (!authenticated) {
    return (
      <div>
        <h1>Dashboard</h1>
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
        <p>Wallet: {String(profile?.wallet_address ?? "—")}</p>
        <p>X: {String(profile?.twitter_handle ?? "Not linked — create via @Chiwiwis first")}</p>
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
