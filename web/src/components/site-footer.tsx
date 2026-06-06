"use client";

import { BRAND_LINKS } from "@/lib/brand";
import { useTranslations } from "@/components/locale-provider";

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="site-footer">
      <p className="site-footer__credit">
        {t.footer.poweredBy}{" "}
        <a href={BRAND_LINKS.pronosticoLabs.github} target="_blank" rel="noopener noreferrer">
          Pronóstico Labs
        </a>
        {" / "}
        <a href={BRAND_LINKS.anyone.web} target="_blank" rel="noopener noreferrer">
          anyone.market
        </a>
      </p>

      <div className="site-footer__socials">
        <div className="site-footer__group">
          <span className="site-footer__label">please.market</span>
          <a href={BRAND_LINKS.pleaseMarket.x} target="_blank" rel="noopener noreferrer">
            @PleaseMarketBot
          </a>
        </div>
        <div className="site-footer__group">
          <span className="site-footer__label">Anyone</span>
          <a href={BRAND_LINKS.anyone.x} target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href={BRAND_LINKS.anyone.telegram} target="_blank" rel="noopener noreferrer">
            Telegram
          </a>
          <a href={BRAND_LINKS.anyone.web} target="_blank" rel="noopener noreferrer">
            Web
          </a>
        </div>
        <div className="site-footer__group">
          <span className="site-footer__label">Pronóstico Labs</span>
          <a href={BRAND_LINKS.pronosticoLabs.x} target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href={BRAND_LINKS.pronosticoLabs.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
