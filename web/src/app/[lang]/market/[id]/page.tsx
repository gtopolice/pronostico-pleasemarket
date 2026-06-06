import type { Metadata } from "next";

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
        <h1>Market not found</h1>
        <p className="card">No market with id {id}.</p>
      </div>
    );
  }

  const m = row.data;
  const close = m.close_time_utc ? new Date(m.close_time_utc).toLocaleString() : "—";
  const anyoneBase = process.env.NEXT_PUBLIC_ANYONE_WEB_BASE ?? "https://anyone.market";

  return (
    <div>
      <p style={{ opacity: 0.7, fontSize: "0.875rem" }}>
        {m.dry_run ? "Preview" : m.hackathon_fallback ? "Hackathon market" : "Live"} · {row.source}
      </p>
      <h1>{m.title ?? m.question}</h1>
      {m.question && m.title !== m.question && <p className="card">{m.question}</p>}

      <div className="card">
        <p>
          <strong>Closes:</strong> {close}
        </p>
        <p>
          <strong>State:</strong> {m.state ?? "—"}
        </p>
      </div>

      <h2>Rules</h2>
      <div className="card">
        <p style={{ whiteSpace: "pre-wrap" }}>{m.resolution_rules ?? m.description ?? "—"}</p>
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        <a className="btn" href={`/${lang}/market/${id}`}>
          View on Please.market
        </a>{" "}
        {!m.hackathon_fallback && !m.dry_run && (
          <a className="btn" href={`${anyoneBase}/${lang}/market/${id}`} style={{ marginLeft: "0.5rem" }}>
            Trade on Anyone
          </a>
        )}
      </p>

      <p style={{ marginTop: "1rem", opacity: 0.8 }}>
        Created via @PleaseMarketBot — creator resolves within 48h after close.
      </p>
    </div>
  );
}
