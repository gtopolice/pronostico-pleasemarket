/** Anyone.market URLs for please.market sunset redirects. */

export const ANYONE_WEB_BASE =
  process.env.NEXT_PUBLIC_ANYONE_WEB_BASE?.replace(/\/$/, "") ??
  "https://anyone.market";

export const DOGGY_BRACKET_MARKET_ID = "46438911-198d-4907-bd90-50f281240cae";

export function anyoneHomeUrl(): string {
  return `${ANYONE_WEB_BASE}/`;
}

export function anyoneMarketUrl(documentId: string): string | null {
  if (documentId === DOGGY_BRACKET_MARKET_ID) {
    return `${ANYONE_WEB_BASE}/en/market/${documentId}`;
  }
  return null;
}

/** Redirect rules for next.config.ts — most specific paths first. */
export function pleaseMarketSunsetRedirects(): Array<{
  source: string;
  destination: string;
  permanent: boolean;
}> {
  const home = anyoneHomeUrl();
  const doggyMarket = anyoneMarketUrl(DOGGY_BRACKET_MARKET_ID)!;

  return [
    {
      source: `/:lang(en|es)/market/${DOGGY_BRACKET_MARKET_ID}`,
      destination: doggyMarket,
      permanent: false,
    },
    {
      source: "/:lang(en|es)/market/:id",
      destination: home,
      permanent: false,
    },
    {
      source: "/:lang(en|es)/dashboard/:path*",
      destination: home,
      permanent: false,
    },
    {
      source: "/:lang(en|es)/leaderboard",
      destination: home,
      permanent: false,
    },
    {
      source: "/:lang(en|es)",
      destination: home,
      permanent: false,
    },
    {
      source: "/dashboard/:path*",
      destination: home,
      permanent: false,
    },
    {
      source: "/dashboard",
      destination: home,
      permanent: false,
    },
    {
      source: "/leaderboard",
      destination: home,
      permanent: false,
    },
    {
      source: "/link-x",
      destination: home,
      permanent: false,
    },
    {
      source: "/",
      destination: home,
      permanent: false,
    },
  ];
}
