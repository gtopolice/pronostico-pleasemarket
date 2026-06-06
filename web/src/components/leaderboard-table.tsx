import { demoCreatorAvatarPath } from "@/lib/demo-creator-avatars";
import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { formatDemoAmountCompact } from "@/lib/demo-currency";

export type CreatorLeaderboardRow = {
  twitter_id: string;
  twitter_handle?: string | null;
  volume_usdc: number;
  trade_count: number;
  market_count: number;
};

export type AmbassadorLeaderboardRow = {
  twitter_id: string;
  twitter_handle?: string | null;
  referral_volume_usdc: number;
  referral_count: number;
  earned_usdc: number;
};

function creatorLabel(row: { twitter_handle?: string | null; twitter_id: string }) {
  const handle = row.twitter_handle?.replace(/^@/, "").trim();
  if (handle) return `@${handle}`;
  return row.twitter_id;
}

function LeaderboardAvatar({ handle }: { handle?: string | null }) {
  const src = demoCreatorAvatarPath(handle) ?? PLEASE_MARKET_LOGO_SRC;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="leaderboard-table__avatar" src={src} alt="" />
  );
}

export function CreatorLeaderboardTable({ rows }: { rows: CreatorLeaderboardRow[] }) {
  if (rows.length === 0) {
    return <p className="card empty-state">No creator ranks yet.</p>;
  }

  return (
    <div className="card leaderboard-table-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Creator</th>
            <th>Volume</th>
            <th>Trades</th>
            <th>Markets</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.twitter_id}>
              <td>{index + 1}</td>
              <td>
                <span className="leaderboard-table__creator">
                  <LeaderboardAvatar handle={row.twitter_handle} />
                  {creatorLabel(row)}
                </span>
              </td>
              <td>{formatDemoAmountCompact(Number(row.volume_usdc))}</td>
              <td>{Number(row.trade_count).toLocaleString()}</td>
              <td>{Number(row.market_count).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AmbassadorLeaderboardTable({ rows }: { rows: AmbassadorLeaderboardRow[] }) {
  if (rows.length === 0) {
    return <p className="card empty-state">No ambassador ranks yet.</p>;
  }

  return (
    <div className="card leaderboard-table-wrap">
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ambassador</th>
            <th>Referral vol.</th>
            <th>Referrals</th>
            <th>Earned</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.twitter_id}>
              <td>{index + 1}</td>
              <td>
                <span className="leaderboard-table__creator">
                  <LeaderboardAvatar handle={row.twitter_handle} />
                  {creatorLabel(row)}
                </span>
              </td>
              <td>{formatDemoAmountCompact(Number(row.referral_volume_usdc))}</td>
              <td>{Number(row.referral_count).toLocaleString()}</td>
              <td>{formatDemoAmountCompact(Number(row.earned_usdc))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
