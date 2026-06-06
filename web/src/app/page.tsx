import { SiteLogo } from "@/components/site-logo";

export default function HomePage() {
  return (
    <div className="hero">
      <div>
        <SiteLogo size="hero" asHeading />
        <p className="page-subtitle">
          Tag <strong>@PleaseMarketBot</strong> on X with a yes/no question. AI turns it into a
          binary market on Please.market — powered by{" "}
          <a href="https://anyone.market">Anyone</a>. You resolve; traders bet.
        </p>
        <div className="hero__actions">
          <a
            className="btn"
            href="https://x.com/compose/tweet?text=@PleaseMarketBot%20"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open X
          </a>
          <a className="btn btn--outline" href="/dashboard">
            Creator dashboard
          </a>
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
          <p>Share the market page. Resolve within 48h after close; traders bet on Anyone.</p>
        </div>
      </div>
    </div>
  );
}
