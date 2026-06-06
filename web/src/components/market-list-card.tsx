import Link from "next/link";

type MarketListCardProps = {
  id?: string;
  title?: string;
  state?: string;
  lang?: string;
};

function stateBadgeClass(state?: string) {
  const normalized = (state ?? "").toLowerCase();
  if (normalized.includes("live") || normalized.includes("open")) return "badge badge--live";
  if (normalized.includes("close")) return "badge badge--closed";
  return "badge badge--preview";
}

export function MarketListCard({ id, title, state, lang = "en" }: MarketListCardProps) {
  if (!id) return null;

  return (
    <Link href={`/${lang}/market/${id}`} className="market-card">
      <div className="market-card__top">
        <h3 className="market-card__title">{title ?? "Untitled market"}</h3>
        <span className={stateBadgeClass(state)}>{state ?? "Preview"}</span>
      </div>
      <div className="market-card__outcomes" aria-hidden="true">
        <div className="market-card__outcome market-card__outcome--yes">YES</div>
        <div className="market-card__outcome market-card__outcome--no">NO</div>
      </div>
    </Link>
  );
}
