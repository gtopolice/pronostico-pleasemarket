import type { Metadata } from "next";

import { RulesAccordion } from "@/components/rules-accordion";

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
};

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

  return (
    <article>
      <div className="market-hero">
        <div className="badge-row">
          <span className={marketKindClass(m)}>{marketKindLabel(m)}</span>
          <span className="badge">{m.state ?? "Unknown state"}</span>
          <span className="badge badge--closed">Source: {row.source}</span>
        </div>

        <h1 className="market-hero__title">{title}</h1>

        {m.question && m.title !== m.question ? (
          <p className="page-subtitle">{m.question}</p>
        ) : null}

        <div className="market-hero__meta">
          <span>
            <strong>Closes:</strong> {close}
          </span>
          <span>
            <strong>Creator resolves</strong> within 48h after close
          </span>
        </div>

        <div className="outcome-row" aria-label="Market outcomes">
          <div className="outcome-chip outcome-chip--yes">YES</div>
          <div className="outcome-chip outcome-chip--no">NO</div>
        </div>
      </div>

      <RulesAccordion rules={rules} />

      <div className="hero__actions" style={{ marginTop: "1.5rem" }}>
        {!m.hackathon_fallback && !m.dry_run ? (
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
        Created via @PleaseMarketBot on X.
      </p>
    </article>
  );
}
