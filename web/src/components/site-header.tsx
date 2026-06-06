"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AuthButton } from "@/components/auth-button";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SiteLogo } from "@/components/site-logo";
import { localePath, normalizeLocale } from "@/lib/i18n";
import { useTranslations } from "@/components/locale-provider";

export function SiteHeader() {
  const [howOpen, setHowOpen] = useState(false);
  const params = useParams();
  const locale = normalizeLocale(typeof params?.lang === "string" ? params.lang : undefined);
  const t = useTranslations();

  return (
    <>
      <header className="site-header">
        <div className="site-header__left">
          <SiteLogo locale={locale} />
          <nav className="site-header__nav" aria-label="Main">
            <Link href={localePath(locale, "leaderboard")}>{t.nav.leaderboard}</Link>
            <Link href={localePath(locale, "dashboard")}>{t.nav.dashboard}</Link>
          </nav>
        </div>
        <div className="site-header__actions">
          <LocaleSwitcher />
          <button className="btn--how" type="button" onClick={() => setHowOpen(true)}>
            {t.nav.howItWorks}
          </button>
          <AuthButton />
        </div>
      </header>
      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />
    </>
  );
}
