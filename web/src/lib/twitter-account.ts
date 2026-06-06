type LinkedAccount = {
  type?: string;
  subject?: string;
  username?: string | null;
  profile_picture_url?: string | null;
  profilePictureUrl?: string | null;
};

export type TwitterOAuthAccount = {
  subject: string;
  username: string | null;
  profilePictureUrl: string | null;
};

function normalizeHandle(username: string | null | undefined): string | null {
  const handle = username?.replace(/^@/, "").trim();
  return handle || null;
}

export function twitterOAuthAccount(
  linkedAccounts: LinkedAccount[] | undefined,
): TwitterOAuthAccount | null {
  const account = linkedAccounts?.find((row) => row.type === "twitter_oauth");
  if (!account?.subject) return null;
  return {
    subject: account.subject,
    username: account.username ?? null,
    profilePictureUrl: account.profilePictureUrl ?? account.profile_picture_url ?? null,
  };
}

export function twitterHandleLabel(account: TwitterOAuthAccount | null): string | null {
  const handle = normalizeHandle(account?.username);
  return handle ? `@${handle}` : null;
}

export function twitterAvatarUrl(account: TwitterOAuthAccount | null): string | null {
  const stored = account?.profilePictureUrl?.trim();
  if (stored) return stored;

  const handle = normalizeHandle(account?.username);
  if (handle) return `https://unavatar.io/x/${handle}`;

  return null;
}

export function twitterAvatarFallbackUrl(account: TwitterOAuthAccount | null): string | null {
  const handle = normalizeHandle(account?.username);
  if (!handle) return null;
  return `https://unavatar.io/x/${handle}`;
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
