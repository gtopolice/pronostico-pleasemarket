"use client";

import { usePrivy } from "@privy-io/react-auth";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function AuthButton() {
  const { ready, authenticated, login, user } = usePrivy();

  if (!ready) {
    return <span className="auth-pill auth-pill--ghost">…</span>;
  }

  if (!authenticated) {
    return (
      <button className="auth-pill" type="button" onClick={login}>
        Sign in
      </button>
    );
  }

  const wallet =
    user?.wallet?.address ??
    (
      user?.linkedAccounts?.find(
        (account: { type?: string; address?: string }) => account.type === "smart_wallet",
      ) as { address?: string } | undefined
    )?.address;

  return (
    <button className="auth-pill auth-pill--ghost" type="button" onClick={login}>
      {wallet ? shortenAddress(wallet) : "Account"}
    </button>
  );
}
