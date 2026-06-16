import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MarketHeroImage } from "@/components/market-hero-image";
import { MarketPreviewPanel } from "@/components/market-preview-panel";
import { RulesAccordion } from "@/components/rules-accordion";
import { BRAND_LINKS } from "@/lib/brand";
import { creatorAvatarUrl } from "@/lib/creator-avatar";
import { getMessages, normalizeLocale } from "@/lib/i18n";
import { isDemoMarket, isLiveMarket } from "@/lib/market-kind";
import { marketOptionFromRecord } from "@/lib/market-option";
import { resolveMarketRedirectUrl } from "@/lib/market-redirect";
import { upsizeTwitterProfileImageUrl } from "@/lib/twitter-profile-image";

const apiBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";

type MarketRecord = {
  id?: number;
  documentId?: string;
  question?: string;
  title?: string;
  description?: string;
  resolution_rules?: string;
  close_time_utc?: string;
  state?: string;
  dry_run?: boolean;
  hackathon_fallback?: boolean;
  demo_seed?: boolean;
  is_live?: boolean;
  source?: string;
  volume?: string | number | null;
  cpmm_address?: string | null;
  cpmm_market_id?: string | number | null;
  contract_version?: string | null;
  pool_address?: string | null;
  current_probability_yes?: number | null;
  current_probability_no?: number | null;
  image_url?: string | null;
  image?: { url?: string | null } | null;
  creator_profile_image_url?: string | null;
  creator_twitter_handle?: string | null;
  trade_url?: string | null;
};

const UNUSABLE_MARKET_IMAGES = new Set(["https://anyone.market/og-image.png"]);

function marketImageUrl(market: MarketRecord): string {
  const fromNested = market.image?.url?.trim();
  const fromField = market.image_url?.trim();
  const explicit = fromField || fromNested;
  if (explicit && !UNUSABLE_MARKET_IMAGES.has(explicit)) {
    return upsizeTwitterProfileImageUrl(explicit) ?? explicit;
  }

  return creatorAvatarUrl({
    creator_profile_image_url: market.creator_profile_image_url,
    creator_twitter_handle: market.creator_twitter_handle,
  });
}

async function fetchMarket(id: string): Promise<{ data: MarketRecord; source: string } | null> {
  const res = await fetch(`${apiBase}/api/markets/${id}`, { next: { revalidate: 15 } });
  if (!res.ok) return null;
  return res.json();
}

function marketKindLabel(m: MarketRecord, t: ReturnType<typeof getMessages>) {
  if (isLiveMarket(m)) return t.market.badgeLive;
  if (m.dry_run) return t.market.badgePreview;
  if (m.hackathon_fallback) return t.market.badgeHackathon;
  return t.market.badgePreview;
}

function marketKindClass(m: MarketRecord) {
  if (isLiveMarket(m)) return "badge badge--live";
  if (m.dry_run || m.hackathon_fallback) return "badge badge--preview";
  return "badge badge--preview";
}

function formatVolume(raw: MarketRecord["volume"]): string | null {
  if (raw === null || raw === undefined) return null;
  const n = Number(typeof raw === "string" ? raw.replace(/,/g, "") : raw);
  if (!Number.isFinite(n) || n < 0) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await fetchMarket(id);
  const title = row?.data?.title ?? row?.data?.question ?? "Please.market prediction market";
  return { title: `${title} — Please.market` };
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const locale = normalizeLocale(lang);
  const t = getMessages(locale);
  const row = await fetchMarket(id);

  if (!row?.data) {
    return (
      <div>
        <h1 className="page-title">{t.market.notFound}</h1>
        <p className="card empty-state">{t.market.notFoundDetail.replace("{id}", id)}</p>
      </div>
    );
  }

  const m = row.data;
  const tradeRedirect = resolveMarketRedirectUrl(id, m.trade_url);
  if (tradeRedirect) redirect(tradeRedirect);

  const close = m.close_time_utc
    ? new Date(m.close_time_utc).toLocaleString(locale === "es" ? "es-MX" : "en-US")
    : "—";
  const rules = m.resolution_rules ?? m.description ?? t.market.rulesFallback;
  const title = m.title ?? m.question ?? t.market.untitled;
  const isPreview = isDemoMarket(m);
  const liveMarket = marketOptionFromRecord(m);
  const imageUrl = marketImageUrl(m);
  const composeTweet =
    locale === "es"
      ? "https://x.com/compose/tweet?text=@PleaseMarketBot%20"
      : "https://x.com/compose/tweet?text=@PleaseMarketBot%20";

  return (
    <article>
      <div className="market-hero">
        <div className="badge-row">
          <span className={marketKindClass(m)}>{marketKindLabel(m, t)}</span>
          {m.state ? <span className="badge">{m.state}</span> : null}
          <span className="badge badge--closed">
            {t.market.source}: {row.source}
          </span>
        </div>

        <div className="market-hero__row">
          <MarketHeroImage src={imageUrl} alt={title} />
          <div className="market-hero__copy">
            <h1 className="market-hero__title">{title}</h1>
            {m.question && m.title !== m.question ? (
              <p className="page-subtitle">{m.question}</p>
            ) : null}
          </div>
        </div>

        <div className="market-hero__meta">
          <span>
            <strong>{t.market.closes}:</strong> {close}
          </span>
          <span>
            <strong>{isPreview ? t.market.creatorResolves : t.market.tradeLiveHint}</strong>
          </span>
        </div>
      </div>

      <MarketPreviewPanel
        marketId={id}
        title={title}
        closeTimeUtc={m.close_time_utc}
        isPreview={isPreview}
        liveMarket={liveMarket}
        volumeDisplay={formatVolume(m.volume)}
        locale={locale}
      />

      <RulesAccordion rules={rules} />

      <div className="hero__actions" style={{ marginTop: "1.5rem" }}>
        {isPreview ? (
          <span className="btn btn--outline" style={{ cursor: "default" }}>
            {t.market.hackathonPreview}
          </span>
        ) : null}
        <a className="btn btn--tertiary" href={composeTweet} target="_blank" rel="noopener noreferrer">
          {t.market.createAnother}
        </a>
      </div>

      <p className="empty-state" style={{ marginTop: "1.25rem" }}>
        {isPreview ? (
          <>
            {t.market.createdVia}{" "}
            <a href={BRAND_LINKS.pleaseMarket.x} target="_blank" rel="noopener noreferrer">
              @PleaseMarketBot
            </a>{" "}
            {t.market.onX}
          </>
        ) : (
          t.market.liveMarketFootnote
        )}
      </p>
    </article>
  );
}
