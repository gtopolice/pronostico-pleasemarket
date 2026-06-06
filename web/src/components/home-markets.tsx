"use client";

import { useEffect, useState } from "react";

import { MarketListCard } from "@/components/market-list-card";
import { getMessages, type Locale } from "@/lib/i18n";
import { isDemoMarket, isLiveMarket } from "@/lib/market-kind";

type HomeMarket = {
  documentId?: string;
  title?: string;
  question?: string;
  state?: string;
  creator_twitter_handle?: string | null;
  creator_profile_image_url?: string | null;
  dry_run?: boolean;
  is_live?: boolean;
  source?: string;
  cpmm_address?: string | null;
  cpmm_market_id?: string | number | null;
};

export function HomeMarkets({ lang = "es" }: { lang?: Locale }) {
  const [markets, setMarkets] = useState<HomeMarket[] | null>(null);
  const t = getMessages(lang);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/markets?limit=12&locale=${lang}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        if (!cancelled) setMarkets(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setMarkets([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="home-markets">
      <h2 className="home-markets__title">{t.home.marketsTitle}</h2>
      <p className="home-markets__subtitle">{t.home.marketsSubtitle}</p>
      {markets === null ? (
        <p className="card empty-state">{t.home.marketsLoading}</p>
      ) : markets.length === 0 ? (
        <p className="card empty-state">{t.home.marketsEmpty}</p>
      ) : (
        <div className="market-list market-list--grid">
          {markets.map((market) => (
            <MarketListCard
              key={market.documentId}
              id={market.documentId}
              title={market.title ?? market.question}
              lang={lang}
              creator_twitter_handle={market.creator_twitter_handle}
              creator_profile_image_url={market.creator_profile_image_url}
              isLive={isLiveMarket(market)}
              isDemo={isDemoMarket(market)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
