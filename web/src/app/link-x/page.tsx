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

function LinkXCta({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="link-x-cta">
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
      {children ? <div className="link-x-cta__body">{children}</div> : null}
    </section>
  );
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
    return (
      <LinkXCta
        title="Get a new link"
        subtitle="Missing link token. Tag @PleaseMarketBot on X to receive a fresh wallet link."
      />
    );
  }

  if (tokenError) {
    return <LinkXCta title="Link expired" subtitle={tokenError} />;
  }

  if (!tokenInfo || !ready) {
    return (
      <LinkXCta
        title="Sign in to publish your market"
        subtitle="Loading your link…"
      />
    );
  }

  if (linked) {
    return (
      <LinkXCta
        title="You're all set"
        subtitle={
          marketUrl
            ? "Your wallet is linked and your market is ready."
            : "Your wallet is linked. You can create markets via @PleaseMarketBot on X."
        }
      >
        {status ? <p className="link-x-cta__status">{status}</p> : null}
        {marketUrl ? (
          <a className="btn" href={marketUrl}>
            View your market
          </a>
        ) : (
          <a className="btn" href="/dashboard">
            Creator dashboard
          </a>
        )}
      </LinkXCta>
    );
  }

  if (!authenticated) {
    return (
      <LinkXCta
        title="Sign in to publish your market"
        subtitle={
          <>
            Only <strong>{expectedHandle}</strong> can complete this link. Sign in with that X
            account and we&apos;ll create your wallet and finish automatically.
          </>
        }
      >
        <button
          className="btn"
          type="button"
          onClick={() => login({ loginMethods: ["twitter"] })}
        >
          Sign in with X as {expectedHandle}
        </button>
      </LinkXCta>
    );
  }

  return (
    <LinkXCta
      title={linking ? "Linking your wallet…" : "Almost there"}
      subtitle={
        linking
          ? "Hang tight — we're connecting your wallet and finishing setup."
          : `Signed in as ${twitterAccount?.username ? `@${twitterAccount.username}` : expectedHandle}. Complete the steps below to publish.`
      }
    >
      {!linking ? (
        <>
          <p className="link-x-cta__meta">
            Wallet: <strong>{wallet ?? "Creating wallet…"}</strong>
          </p>

          {!wallet && <p className="link-x-cta__status">Setting up your embedded wallet…</p>}

          {!twitterVerified && (
            <>
              <button className="btn" type="button" onClick={onLinkTwitter}>
                Connect X as {expectedHandle}
              </button>
              <p className="link-x-cta__status">
                Or sign out and use &ldquo;Sign in with X&rdquo; with {expectedHandle}.
              </p>
            </>
          )}

          {twitterVerified && wallet && (
            <button className="btn" type="button" onClick={() => void onComplete()}>
              Complete link
            </button>
          )}
        </>
      ) : null}

      {status ? <p className="link-x-cta__status">{status}</p> : null}
    </LinkXCta>
  );
}

export default function LinkXPage() {
  return (
    <Suspense>
      <LinkXContent />
    </Suspense>
  );
}
