import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";

export type MarketCreator = {
  creator_profile_image_url?: string | null;
  creator_twitter_handle?: string | null;
};

export function creatorAvatarUrl(creator: MarketCreator): string {
  const stored = creator.creator_profile_image_url?.trim();
  if (stored) return stored;

  const handle = creator.creator_twitter_handle?.replace(/^@/, "").trim();
  if (handle) return `https://unavatar.io/x/${handle}`;

  return PLEASE_MARKET_LOGO_SRC;
}

export function creatorHandleLabel(creator: MarketCreator): string | null {
  const handle = creator.creator_twitter_handle?.replace(/^@/, "").trim();
  return handle ? `@${handle}` : null;
}
