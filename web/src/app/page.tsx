import Image from "next/image";

import { MarketListCard } from "@/components/market-list-card";
import { BRAND_LINKS, PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { fetchRecentMarkets } from "@/lib/api";

export const revalidate = 30;

export default async function HomePage() {
  const { data: markets } = await fetchRecentMarkets(9);

  return (
    <div className="hero">
      <div className="hero__top">
        <div className="hero__intro">
          <h1 className="page-title">Create prediction markets from X</h1>
          <p className="page-subtitle hero__subtitle">
          Tag <strong>@PleaseMarketBot</strong> with a yes/no question. AI turns it into a binary
          market — powered by{" "}
          <a href={BRAND_LINKS.pronosticoLabs.github} target="_blank" rel="noopener noreferrer">
            Pronóstico Labs
          </a>
          {" / "}
          <a href={BRAND_LINKS.anyone.web} target="_blank" rel="noopener noreferrer">
            anyone.market
          </a>
          . You resolve; traders bet.
          </p>
          <div className="hero__actions">
            <a
              className="btn"
              href="https://x.com/compose/tweet?text=@PleaseMarketBot%20"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create Market
            </a>
            <a className="btn btn--outline" href="/dashboard">
              Creator dashboard
            </a>
          </div>
        </div>

        <div className="hero__visual" aria-hidden>
          <Image
            src={PLEASE_MARKET_LOGO_SRC}
            alt=""
            width={168}
            height={168}
            className="hero__logo"
            priority
          />
        </div>
      </div>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-card__num">1</div>
          <h3>Tag the bot</h3>
          <p>Mention @PleaseMarketBot with a clear yes/no prediction question.</p>
        </div>
        <div className="step-card">
          <div className="step-card__num">2</div>
          <h3>Link your wallet</h3>
          <p>Use the reply link to connect Privy and verify your X account as creator.</p>
        </div>
        <div className="step-card">
          <div className="step-card__num">3</div>
          <h3>Market goes live</h3>
          <p>Share the market page. Resolve within 48h after close; traders bet on anyone.market.</p>
        </div>
      </div>

      <section className="home-markets">
        <h2 className="home-markets__title">Markets from @PleaseMarketBot</h2>
        <p className="home-markets__subtitle">Recent preview markets created on X.</p>
        {markets.length === 0 ? (
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
                state={market.state}
                creator_twitter_handle={market.creator_twitter_handle}
                creator_profile_image_url={market.creator_profile_image_url}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
