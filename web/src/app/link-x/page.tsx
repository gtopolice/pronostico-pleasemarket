"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { completeLinkX } from "@/lib/api";

function LinkXContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { ready, authenticated, login, user } = usePrivy();
  const [status, setStatus] = useState<string | null>(null);

  const wallet = user?.wallet?.address;
  const smartWallet = user?.linkedAccounts?.find(
    (a: { type?: string; address?: string }) => a.type === "smart_wallet",
  ) as { address?: string } | undefined;

  async function onLink() {
    if (!token || !wallet) return;
    try {
      await completeLinkX(token, wallet, smartWallet?.address);
      setStatus("Wallet linked! You can create markets via @PleaseMarket on X.");
    } catch {
      setStatus("Link failed — token may have expired.");
    }
  }

  if (!token) {
    return <p className="card">Missing link token. Tag @PleaseMarket on X to get a new link.</p>;
  }

  if (!ready) return <p>Loading…</p>;
  if (!authenticated) {
    return (
      <div>
        <h1>Link X + wallet</h1>
        <button className="btn" type="button" onClick={login}>Sign in with Privy</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Link X + wallet</h1>
      <p className="card">Wallet: {wallet}</p>
      <button className="btn" type="button" onClick={onLink} disabled={!wallet}>
        Complete link
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default function LinkXPage() {
  return (
    <Suspense>
      <LinkXContent />
    </Suspense>
  );
}
