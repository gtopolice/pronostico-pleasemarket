import Image from "next/image";

import { HackathonStrip } from "@/components/hackathon-strip";
import { HomeMarkets } from "@/components/home-markets";
import { BRAND_LINKS, PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { getMessages, normalizeLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = normalizeLocale(lang);
  const t = getMessages(locale);

  return (
    <div className="hero">
      <HackathonStrip locale={locale} />

      <div className="hero__top">
        <div className="hero__intro">
          <h1 className="page-title">{t.home.title}</h1>
          <p className="page-subtitle hero__subtitle">
            {t.home.subtitleBefore} <strong>@PleaseMarketBot</strong> {t.home.subtitleAfter}{" "}
            <a href={BRAND_LINKS.pronosticoLabs.github} target="_blank" rel="noopener noreferrer">
              Pronóstico Labs
            </a>
            {" / "}
            <a href={BRAND_LINKS.anyone.web} target="_blank" rel="noopener noreferrer">
              anyone.market
            </a>
            . {t.home.subtitleEnd}
          </p>
          <div className="hero__actions">
            <a className="btn" href={t.home.composeTweet} target="_blank" rel="noopener noreferrer">
              {t.home.create}
            </a>
            <a className="btn btn--outline" href={`/${locale}/dashboard`}>
              {t.home.creatorDashboard}
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
          <h3>{t.home.step1Title}</h3>
          <p>{t.home.step1Body}</p>
        </div>
        <div className="step-card">
          <div className="step-card__num">2</div>
          <h3>{t.home.step2Title}</h3>
          <p>{t.home.step2Body}</p>
        </div>
        <div className="step-card">
          <div className="step-card__num">3</div>
          <h3>{t.home.step3Title}</h3>
          <p>{t.home.step3Body}</p>
        </div>
      </div>

      <HomeMarkets lang={locale} />
    </div>
  );
}
