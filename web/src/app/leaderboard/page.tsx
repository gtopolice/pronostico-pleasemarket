import { fetchLeaderboard } from "@/lib/api";

export const revalidate = 60;

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role = params.role ?? "creator";
  const { data } = await fetchLeaderboard();

  return (
    <div>
      <h1>Leaderboard</h1>
      <p>
        <a href="/leaderboard?role=creator">Creators</a> ·{" "}
        <a href="/leaderboard?role=ambassador">Ambassadors</a>
      </p>
      {role === "ambassador" ? (
        <p className="card">Ambassador ranks populate when position attribution indexer ships on feat/testnet.</p>
      ) : (
        <table>
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
            {(data ?? []).map((row: { twitter_id: string; volume_usdc: number; trade_count: number; market_count: number }, i: number) => (
              <tr key={row.twitter_id}>
                <td>{i + 1}</td>
                <td>{row.twitter_id}</td>
                <td>${row.volume_usdc}</td>
                <td>{row.trade_count}</td>
                <td>{row.market_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
