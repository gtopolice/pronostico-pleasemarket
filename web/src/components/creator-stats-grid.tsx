import type { MarketDummyStats } from "@/lib/market-display";
import { formatDemoAmount } from "@/lib/demo-currency";

type CreatorStatsGridProps = {
  stats: MarketDummyStats;
  marketCount?: number;
  variant?: "default" | "hero";
  onClaim?: () => void;
  claiming?: boolean;
};

export function CreatorStatsGrid({
  stats,
  marketCount,
  variant = "default",
  onClaim,
  claiming = false,
}: CreatorStatsGridProps) {
  const className =
    variant === "hero" ? "creator-stats creator-stats--hero" : "creator-stats";
  const canClaim = stats.unclaimed_usdc > 0 && Boolean(onClaim);

  return (
    <div className={className}>
      {variant === "hero" && marketCount !== undefined ? (
        <p className="creator-stats__caption">
          {marketCount === 0
            ? "No deployed markets yet"
            : `Totals across ${marketCount} deployed market${marketCount === 1 ? "" : "s"}`}
        </p>
      ) : null}
      <dl className="creator-stats__grid creator-stats__grid--earnings">
        <div>
          <dt>Volume</dt>
          <dd>{formatDemoAmount(stats.volume_usdc, 0)}</dd>
        </div>
        <div>
          <dt>Trades</dt>
          <dd>{stats.trade_count.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Unclaimed</dt>
          <dd className="creator-stats__value--accent">{formatDemoAmount(stats.unclaimed_usdc)}</dd>
        </div>
        <div>
          <dt>Claimed</dt>
          <dd>{formatDemoAmount(stats.claimed_usdc)}</dd>
        </div>
      </dl>
      {canClaim ? (
        <div className="creator-stats__claim-row">
          <button
            className="btn btn--sm"
            type="button"
            disabled={claiming}
            onClick={onClaim}
          >
            {claiming ? "Claiming…" : `Claim ${formatDemoAmount(stats.unclaimed_usdc)}`}
          </button>
          <p className="creator-stats__claim-hint">Creator fees from your markets (demo preview).</p>
        </div>
      ) : stats.earned_usdc > 0 ? (
        <p className="creator-stats__claim-hint creator-stats__claim-hint--done">
          All earnings claimed.
        </p>
      ) : null}
    </div>
  );
}
