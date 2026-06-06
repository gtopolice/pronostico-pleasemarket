"use client";

import { getIdentityToken, useLinkAccount, usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { completeLinkX, fetchLinkToken } from "@/lib/api";
import { twitterMatchesToken, twitterOAuthAccount } from "@/lib/twitter-account";

type LinkTokenInfo = {
  twitter_id: string;
  twitter_handle?: string | null;
};

function redirectToMarket(url: string, router: ReturnType<typeof useRouter>) {
  try {
    const parsed = new URL(url);
    if (parsed.origin === window.location.origin) {
      router.replace(`${parsed.pathname}${parsed.search}`);
      return;
    }
  } catch {
    // fall through to full navigation
  }
  window.location.replace(url);
}

function LinkXContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { ready, authenticated, login, user } = usePrivy();
  const { linkTwitter } = useLinkAccount();
  const [tokenInfo, setTokenInfo] = useState<LinkTokenInfo | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [marketUrl, setMarketUrl] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const autoCompleteTriggered = useRef(false);

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

  const expectedHandle = tokenInfo?.twitter_handle
    ? `@${tokenInfo.twitter_handle.replace(/^@/, "")}`
    : "the X account that tagged @PleaseMarketBot";

  useEffect(() => {
    if (!token) return;
    fetchLinkToken(token)
      .then(setTokenInfo)
      .catch(() => setTokenError("This link is invalid or expired. Tweet @PleaseMarketBot for a new one."));
  }, [token]);

  const onComplete = useCallback(async () => {
    if (!token || !wallet || !twitterVerified || linking || linked) return;
    setLinking(true);
    setStatus(null);
    try {
      const identityToken = await getIdentityToken();
      if (!identityToken) {
        setStatus("Session expired. Sign in again, then retry.");
        autoCompleteTriggered.current = false;
        return;
      }
      const result = await completeLinkX(token, wallet, smartWallet?.address, identityToken);
      setLinked(true);
      if (result.market?.market_url) {
        setMarketUrl(result.market.market_url);
        setStatus("Taking you to your market…");
        redirectToMarket(result.market.market_url, router);
      } else {
        setStatus("Wallet linked! You can create markets via @PleaseMarketBot on X.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Link failed";
      setStatus(message);
      autoCompleteTriggered.current = false;
    } finally {
      setLinking(false);
    }
  }, [token, wallet, smartWallet?.address, twitterVerified, linking, linked, router]);

  useEffect(() => {
    if (!ready || !authenticated || !wallet || !twitterVerified || linked || linking) return;
    if (autoCompleteTriggered.current) return;
    autoCompleteTriggered.current = true;
    void onComplete();
  }, [ready, authenticated, wallet, twitterVerified, linked, linking, onComplete]);

  async function onLinkTwitter() {
    setStatus(null);
    try {
      await linkTwitter();
      setStatus("X connected — linking your wallet…");
    } catch {
      setStatus("Could not link X. Try again with the same account that tagged @PleaseMarketBot.");
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

  return (
    <div>
      <h1>Link X + wallet</h1>
      <p className="card">
        Only <strong>{expectedHandle}</strong> can complete this link. Sign in with that X account
        and we&apos;ll create your wallet and finish automatically.
      </p>

      {linked ? (
        <>
          {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
          {marketUrl ? (
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Not redirected?{" "}
              <a href={marketUrl}>View your market</a>
            </p>
          ) : (
            <p style={{ marginTop: "0.75rem" }}>
              <a href="/dashboard">Creator dashboard →</a>
            </p>
          )}
        </>
      ) : !authenticated ? (
        <>
          <button
            className="btn"
            type="button"
            onClick={() => login({ loginMethods: ["twitter"] })}
          >
            Sign in with X as {expectedHandle}
          </button>
          <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <button
              type="button"
              onClick={() => login({ loginMethods: ["email", "wallet"] })}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--text-secondary)",
                textDecoration: "underline",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Use email or wallet instead
            </button>
          </p>
        </>
      ) : (
        <>
          {linking ? (
            <p>Linking your wallet…</p>
          ) : (
            <>
              <p>Wallet: {wallet ?? "Creating wallet…"}</p>
              <p>
                X:{" "}
                {twitterAccount?.username ? `@${twitterAccount.username}` : "Not linked yet"}
              </p>

              {!wallet && <p>Setting up your embedded wallet…</p>}

              {!twitterVerified && (
                <>
                  <button className="btn" type="button" onClick={onLinkTwitter}>
                    Connect X as {expectedHandle}
                  </button>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    Or sign out and use &ldquo;Sign in with X&rdquo; above.
                  </p>
                </>
              )}

              {twitterVerified && wallet && !linking && (
                <button className="btn btn--outline" type="button" onClick={() => void onComplete()}>
                  Complete link
                </button>
              )}
            </>
          )}
        </>
      )}

      {status && !linked && <p style={{ marginTop: "1rem" }}>{status}</p>}
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
