type LinkedAccount = {
  type?: string;
  subject?: string;
  username?: string | null;
  profile_picture_url?: string | null;
};

export type TwitterOAuthAccount = {
  subject: string;
  username: string | null;
  profilePictureUrl: string | null;
};

export function twitterOAuthAccount(
  linkedAccounts: LinkedAccount[] | undefined,
): TwitterOAuthAccount | null {
  const account = linkedAccounts?.find((row) => row.type === "twitter_oauth");
  if (!account?.subject) return null;
  return {
    subject: account.subject,
    username: account.username ?? null,
    profilePictureUrl: account.profile_picture_url ?? null,
  };
}

export function twitterMatchesToken(
  account: TwitterOAuthAccount | null,
  expectedTwitterId: string,
  expectedHandle?: string | null,
): boolean {
  if (!account) return false;
  if (account.subject !== expectedTwitterId) return false;
  if (!expectedHandle) return true;
  const normalized = expectedHandle.replace(/^@/, "").toLowerCase();
  return (account.username ?? "").toLowerCase() === normalized;
}
