import {
  AmbassadorLeaderboardTable,
  CreatorLeaderboardTable,
  type AmbassadorLeaderboardRow,
  type CreatorLeaderboardRow,
} from "@/components/leaderboard-table";
import { fetchLeaderboard } from "@/lib/api";

export const revalidate = 60;

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role = params.role === "ambassador" ? "ambassador" : "creator";
  const { data } = await fetchLeaderboard(role);

  return (
    <div>
      <h1 className="page-title">Leaderboard</h1>
      <p className="page-subtitle">
        {role === "ambassador"
          ? "Top ambassadors by attributed referral volume on Please.market preview markets."
          : "Top creators by volume on Please.market preview markets."}
      </p>
      <p className="dashboard-nav" style={{ marginTop: 0 }}>
        <a href="/leaderboard?role=creator" aria-current={role === "creator" ? "page" : undefined}>
          Creators
        </a>
        <span style={{ color: "var(--outline)" }}>·</span>
        <a href="/leaderboard?role=ambassador" aria-current={role === "ambassador" ? "page" : undefined}>
          Ambassadors
        </a>
      </p>

      {role === "ambassador" ? (
        <AmbassadorLeaderboardTable rows={(data ?? []) as AmbassadorLeaderboardRow[]} />
      ) : (
        <CreatorLeaderboardTable rows={(data ?? []) as CreatorLeaderboardRow[]} />
      )}
    </div>
  );
}
