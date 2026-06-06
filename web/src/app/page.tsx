import Image from "next/image";

import { HomeMarkets } from "@/components/home-markets";
import { BRAND_LINKS, PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";

export default function HomePage() {
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

      <HomeMarkets />
    </div>
  );
}
