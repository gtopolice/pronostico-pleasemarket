import {
  AmbassadorLeaderboardTable,
  CreatorLeaderboardTable,
  type AmbassadorLeaderboardRow,
  type CreatorLeaderboardRow,
} from "@/components/leaderboard-table";
import { fetchLeaderboard } from "@/lib/api";
import { getMessages, localePath, normalizeLocale } from "@/lib/i18n";

export const revalidate = 60;

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { lang } = await params;
  const locale = normalizeLocale(lang);
  const t = getMessages(locale);
  const query = await searchParams;
  const role = query.role === "ambassador" ? "ambassador" : "creator";
  const { data } = await fetchLeaderboard(role);

  return (
    <div>
      <h1 className="page-title">{t.leaderboard.title}</h1>
      <p className="page-subtitle">
        {role === "ambassador" ? t.leaderboard.ambassadorSubtitle : t.leaderboard.creatorSubtitle}
      </p>
      <p className="dashboard-nav" style={{ marginTop: 0 }}>
        <a
          href={`${localePath(locale, "leaderboard")}?role=creator`}
          aria-current={role === "creator" ? "page" : undefined}
        >
          {t.leaderboard.creators}
        </a>
        <span style={{ color: "var(--outline)" }}>·</span>
        <a
          href={`${localePath(locale, "leaderboard")}?role=ambassador`}
          aria-current={role === "ambassador" ? "page" : undefined}
        >
          {t.leaderboard.ambassadors}
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
