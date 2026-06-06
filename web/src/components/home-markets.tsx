"use client";

import { useEffect, useState } from "react";

import { MarketListCard } from "@/components/market-list-card";

type HomeMarket = {
  documentId?: string;
  title?: string;
  question?: string;
  state?: string;
  creator_twitter_handle?: string | null;
  creator_profile_image_url?: string | null;
};

export function HomeMarkets() {
  const [markets, setMarkets] = useState<HomeMarket[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/markets?limit=12", { cache: "no-store" })
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
      <h2 className="home-markets__title">Markets from @PleaseMarketBot</h2>
      <p className="home-markets__subtitle">Recent preview markets created on X.</p>
      {markets === null ? (
        <p className="card empty-state">Loading markets…</p>
      ) : markets.length === 0 ? (
        <p className="card empty-state">
          No markets yet. Tag @PleaseMarketBot on X to create the first one.
        </p>
      ) : (
        <div className="market-list market-list--grid">
          {markets.map((market) => (
            <MarketListCard
              key={market.documentId}
              id={market.documentId}
              title={market.title ?? market.question}
              creator_twitter_handle={market.creator_twitter_handle}
              creator_profile_image_url={market.creator_profile_image_url}
            />
          ))}
        </div>
      )}
    </section>
  );
}
