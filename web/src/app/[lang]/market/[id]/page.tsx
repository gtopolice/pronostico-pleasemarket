import type { Metadata } from "next";

import { MarketHeroImage } from "@/components/market-hero-image";
import { MarketPreviewPanel } from "@/components/market-preview-panel";
import { RulesAccordion } from "@/components/rules-accordion";
import { BRAND_LINKS } from "@/lib/brand";
import { creatorAvatarUrl } from "@/lib/creator-avatar";
import { upsizeTwitterProfileImageUrl } from "@/lib/twitter-profile-image";

const apiBase = process.env.NEXT_PUBLIC_PLEASE_API_BASE ?? "http://localhost:8080";

type MarketRecord = {
  documentId?: string;
  question?: string;
  title?: string;
  description?: string;
  resolution_rules?: string;
  close_time_utc?: string;
  state?: string;
  dry_run?: boolean;
  hackathon_fallback?: boolean;
  image_url?: string | null;
  image?: { url?: string | null } | null;
  creator_profile_image_url?: string | null;
  creator_twitter_handle?: string | null;
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

function marketKindLabel(m: MarketRecord) {
  if (m.dry_run) return "Preview";
  if (m.hackathon_fallback) return "Hackathon";
  return "Live";
}

function marketKindClass(m: MarketRecord) {
  if (m.dry_run || m.hackathon_fallback) return "badge badge--preview";
  return "badge badge--live";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
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
  const row = await fetchMarket(id);

  if (!row?.data) {
    return (
      <div>
        <h1 className="page-title">Market not found</h1>
        <p className="card empty-state">No market with id {id}.</p>
      </div>
    );
  }

  const m = row.data;
  const close = m.close_time_utc ? new Date(m.close_time_utc).toLocaleString() : "—";
  const anyoneBase = process.env.NEXT_PUBLIC_ANYONE_WEB_BASE ?? "https://anyone.market";
  const rules = m.resolution_rules ?? m.description ?? "No resolution rules provided.";
  const title = m.title ?? m.question ?? "Prediction market";
  const isPreview = Boolean(m.dry_run || m.hackathon_fallback);
  const imageUrl = marketImageUrl(m);

  return (
    <article>
      <div className="market-hero">
        <div className="badge-row">
          <span className={marketKindClass(m)}>{marketKindLabel(m)}</span>
          <span className="badge">{m.state ?? "Unknown state"}</span>
          <span className="badge badge--closed">Source: {row.source}</span>
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
            <strong>Closes:</strong> {close}
          </span>
          <span>
            <strong>Creator resolves</strong> within 48h after close
          </span>
        </div>
      </div>

      <MarketPreviewPanel
        marketId={id}
        title={title}
        closeTimeUtc={m.close_time_utc}
        isPreview={isPreview}
      />

      <RulesAccordion rules={rules} />

      <div className="hero__actions" style={{ marginTop: "1.5rem" }}>
        {!isPreview ? (
          <a className="btn" href={`${anyoneBase}/${lang}/market/${id}`}>
            Trade on Anyone
          </a>
        ) : (
          <span className="btn btn--outline" style={{ cursor: "default" }}>
            Preview only — dry run
          </span>
        )}
        <a
          className="btn btn--tertiary"
          href="https://x.com/compose/tweet?text=@PleaseMarketBot%20"
          target="_blank"
          rel="noopener noreferrer"
        >
          Create another on X
        </a>
      </div>

      <p className="empty-state" style={{ marginTop: "1.25rem" }}>
        Created via{" "}
        <a href={BRAND_LINKS.pleaseMarket.x} target="_blank" rel="noopener noreferrer">
          @PleaseMarketBot
        </a>{" "}
        on X.
      </p>
    </article>
  );
}
