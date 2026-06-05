"use client";

import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { fetchMeMarkets, fetchMeProfile, shareUrl, twitterIntent, walletContextFromUser } from "@/lib/api";

export default function SharePage() {
  const { authenticated, login, ready, user } = usePrivy();
  const [ref, setRef] = useState("");
  const [markets, setMarkets] = useState<Array<{ documentId?: string; title?: string; question?: string }>>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    (async () => {
      const token = await getIdentityToken();
      if (!token) return;
      const ctx = walletContextFromUser(user);
      const p = await fetchMeProfile(token, ctx);
      setRef(String(p?.referral_code ?? ""));
      const m = await fetchMeMarkets(token, ctx);
      setMarkets(m.data ?? []);
      if (m.data?.[0]?.documentId) setSelected(m.data[0].documentId);
    })();
  }, [authenticated, user]);

  if (!ready) return null;
  if (!authenticated) {
    return (
      <div>
        <h1>Share</h1>
        <button className="btn" type="button" onClick={login}>Sign in</button>
      </div>
    );
  }

  const link = selected && ref ? shareUrl(selected, ref) : "";
  const market = markets.find((m) => m.documentId === selected);
  const pitch = market?.question ?? market?.title ?? "Trade this market ▲";

  return (
    <div>
      <h1>Share market</h1>
      <div className="card">
        <label>
          Market{" "}
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {markets.map((m) => (
              <option key={m.documentId} value={m.documentId}>{m.title ?? m.question}</option>
            ))}
          </select>
        </label>
        <p>Your link (10% of fees on attributed trades):</p>
        <input readOnly value={link} style={{ width: "100%", padding: "0.5rem" }} />
        <p style={{ marginTop: "1rem" }}>
          <button
            className="btn"
            type="button"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copy link
          </button>{" "}
          <a className="btn" href={twitterIntent(pitch, link)} target="_blank" rel="noreferrer">
            Share on X
          </a>
        </p>
      </div>
    </div>
  );
}
