"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export default function EarningsPage() {
  const { authenticated, login, ready, getAccessToken } = usePrivy();
  const [tab, setTab] = useState<"creator" | "ambassador">("creator");

  useEffect(() => {
    if (!authenticated) return;
    void getAccessToken();
  }, [authenticated, getAccessToken, tab]);

  if (!ready) return null;
  if (!authenticated) {
    return (
      <div>
        <h1>Earnings</h1>
        <button className="btn" type="button" onClick={login}>Sign in</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Earnings</h1>
      <p>
        <button type="button" onClick={() => setTab("creator")}>Creator 50%</button> ·{" "}
        <button type="button" onClick={() => setTab("ambassador")}>Ambassador 10%</button>
      </p>
      <div className="card">
        {tab === "creator" ? (
          <p>Claim creator fees after resolve via PMMv5 claimFeesV5 on market page.</p>
        ) : (
          <p>Ambassador earnings appear when org position attribution indexer is live.</p>
        )}
      </div>
    </div>
  );
}
