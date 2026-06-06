"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { fetchMeMarkets, marketUrl, walletContextFromUser } from "@/lib/api";

export default function ResolvePage() {
  const { authenticated, login, ready, user } = usePrivy();
  const [pending, setPending] = useState<Array<{ title?: string; documentId?: string; close_time_utc?: string }>>([]);

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const token = await getIdentityToken();
      if (!token) return;
      const ctx = walletContextFromUser(user);
      const m = await fetchMeMarkets(token, ctx);
      const now = Date.now();
      const list = (m.data ?? []).filter((row: { close_time_utc?: string; state?: string }) => {
        const close = row.close_time_utc ? new Date(row.close_time_utc).getTime() : 0;
        return close <= now && row.state !== "RESOLVED";
      });
      setPending(list);
    })();
  }, [authenticated, user]);

  if (!ready) return null;
  if (!authenticated) {
    return (
      <div>
        <h1>Resolve queue</h1>
        <button className="btn" type="button" onClick={login}>Sign in</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Resolve queue</h1>
      <p>Past close — resolve YES/NO on-chain via Privy (wire to org web resolve panel).</p>
      {pending.length === 0 && <p className="card">No markets awaiting resolution.</p>}
      {pending.map((m) => (
        <div key={m.documentId} className="card">
          <strong>{m.title}</strong>
          <p>Closed: {m.close_time_utc}</p>
          <a className="btn" href={marketUrl(m.documentId ?? "")}>
            Open market to resolve
          </a>
        </div>
      ))}
    </div>
  );
}
