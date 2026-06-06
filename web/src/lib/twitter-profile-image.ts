/** X/Twitter profile URLs default to `_normal` (48×48). Swap to `_400x400` for display. */
const TWITTER_PROFILE_HOST = "pbs.twimg.com/profile_images/";
const TWITTER_SIZE_SUFFIX = /_(normal|mini|bigger)(?=\.(jpe?g|png|webp)$)/i;

export function upsizeTwitterProfileImageUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed || !trimmed.includes(TWITTER_PROFILE_HOST)) return trimmed ?? null;
  return trimmed.replace(TWITTER_SIZE_SUFFIX, "_400x400");
}
