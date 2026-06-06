import type { MarketDummyStats } from "@/lib/market-display";

type CreatorStatsGridProps = {
  stats: MarketDummyStats;
  marketCount?: number;
  variant?: "default" | "hero";
};

export function CreatorStatsGrid({
  stats,
  marketCount,
  variant = "default",
}: CreatorStatsGridProps) {
  const className =
    variant === "hero" ? "creator-stats creator-stats--hero" : "creator-stats";

  return (
    <div className={className}>
      {variant === "hero" && marketCount !== undefined ? (
        <p className="creator-stats__caption">
          {marketCount === 0
            ? "No deployed markets yet"
            : `Totals across ${marketCount} deployed market${marketCount === 1 ? "" : "s"}`}
        </p>
      ) : null}
      <dl className="creator-stats__grid">
        <div>
          <dt>Volume</dt>
          <dd>${stats.volume_usdc.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Trades</dt>
          <dd>{stats.trade_count.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Earned</dt>
          <dd>${stats.earned_usdc.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
