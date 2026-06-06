import Link from "next/link";

import { getMessages, localePath, type Locale } from "@/lib/i18n";

type HackathonStripProps = {
  locale: Locale;
};

export function HackathonStrip({ locale }: HackathonStripProps) {
  const t = getMessages(locale);

  return (
    <section className="hackathon-strip" aria-label="Hackathon">
      <div className="hackathon-strip__header">
        <span className="hackathon-strip__badge">{t.hackathon.badge}</span>
        <h2 className="hackathon-strip__title">{t.hackathon.title}</h2>
        <p className="hackathon-strip__subtitle">{t.hackathon.subtitle}</p>
      </div>

      <div className="hackathon-strip__stack" aria-label="Stack">
        <span className="hackathon-strip__chip">{t.hackathon.stackBase}</span>
        <span className="hackathon-strip__chip">{t.hackathon.stackPrivy}</span>
        <span className="hackathon-strip__chip">{t.hackathon.stackMxnb}</span>
        <span className="hackathon-strip__chip">{t.hackathon.stackAi}</span>
      </div>

      <div className="hackathon-strip__payments">
        <p>{t.hackathon.paymentsToday}</p>
        <p>{t.hackathon.paymentsNext}</p>
      </div>

      <p className="hackathon-strip__links">
        <Link href={localePath(locale === "es" ? "en" : "es")}>
          {locale === "es" ? "English demo →" : "Demo en español →"}
        </Link>
      </p>
    </section>
  );
}
