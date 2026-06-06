"use client";

import { getIdentityToken, useLinkAccount, usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { completeLinkX, fetchLinkToken } from "@/lib/api";
import { twitterMatchesToken, twitterOAuthAccount } from "@/lib/twitter-account";

type LinkTokenInfo = {
  twitter_id: string;
  twitter_handle?: string | null;
};

function LinkXContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { ready, authenticated, login, user } = usePrivy();
  const { linkTwitter } = useLinkAccount();
  const [tokenInfo, setTokenInfo] = useState<LinkTokenInfo | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [marketUrl, setMarketUrl] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const wallet = user?.wallet?.address;
  const smartWallet = user?.linkedAccounts?.find(
    (account: { type?: string; address?: string }) => account.type === "smart_wallet",
  ) as { address?: string } | undefined;

  const twitterAccount = useMemo(
    () => twitterOAuthAccount(user?.linkedAccounts),
    [user?.linkedAccounts],
  );

  const twitterVerified = useMemo(
    () =>
      tokenInfo
        ? twitterMatchesToken(twitterAccount, tokenInfo.twitter_id, tokenInfo.twitter_handle)
        : false,
    [tokenInfo, twitterAccount],
  );

  useEffect(() => {
    if (!token) return;
    fetchLinkToken(token)
      .then(setTokenInfo)
      .catch(() => setTokenError("This link is invalid or expired. Tweet @PleaseMarketBot for a new one."));
  }, [token]);

  async function onLinkTwitter() {
    setStatus(null);
    try {
      await linkTwitter();
      setStatus("X account linked. Confirm it matches the handle below, then complete the link.");
    } catch {
      setStatus("Could not link X. Try again with the same account that tagged @PleaseMarketBot.");
    }
  }

  async function onComplete() {
    if (!token || !wallet || !twitterVerified) return;
    setLinking(true);
    setStatus(null);
    try {
      const identityToken = await getIdentityToken();
      if (!identityToken) {
        setStatus("Session expired. Sign in again, then retry.");
        return;
      }
      const result = await completeLinkX(token, wallet, smartWallet?.address, identityToken);
      if (result.market?.market_url) {
        setMarketUrl(result.market.market_url);
        setStatus("Wallet linked! Your market is live.");
      } else {
        setStatus("Wallet linked! Check @PleaseMarketBot on X for your market reply.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Link failed";
      setStatus(message);
    } finally {
      setLinking(false);
    }
  }

  if (!token) {
    return <p className="card">Missing link token. Tag @PleaseMarketBot on X to get a new link.</p>;
  }

  if (tokenError) {
    return <p className="card">{tokenError}</p>;
  }

  if (!tokenInfo || !ready) {
    return <p>Loading…</p>;
  }

  const expectedHandle = tokenInfo.twitter_handle
    ? `@${tokenInfo.twitter_handle.replace(/^@/, "")}`
    : "the X account that tagged @PleaseMarketBot";

  return (
    <div>
      <h1>Link X + wallet</h1>
      <p className="card">
        Only <strong>{expectedHandle}</strong> can complete this link. Sign in with Privy, connect
        that X account, then link your wallet.
      </p>

      {!authenticated ? (
        <button className="btn" type="button" onClick={login}>
          Sign in with Privy
        </button>
      ) : (
        <>
          <p>Wallet: {wallet ?? "—"}</p>
          <p>
            X:{" "}
            {twitterAccount?.username
              ? `@${twitterAccount.username}`
              : "Not linked yet"}
          </p>

          {!twitterVerified && (
            <button className="btn" type="button" onClick={onLinkTwitter}>
              Connect X as {expectedHandle}
            </button>
          )}

          <button
            className="btn"
            type="button"
            onClick={onComplete}
            disabled={!wallet || !twitterVerified || linking}
            style={{ marginLeft: twitterVerified ? 0 : "0.5rem" }}
          >
            {linking ? "Linking…" : "Complete link"}
          </button>
        </>
      )}

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
      {marketUrl && (
        <p style={{ marginTop: "0.75rem" }}>
          <a href={marketUrl}>View your market →</a>
        </p>
      )}
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
