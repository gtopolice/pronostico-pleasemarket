import { PLEASE_MARKET_LOGO_SRC } from "@/lib/brand";
import { demoCreatorAvatarPath } from "@/lib/demo-creator-avatars";
import { upsizeTwitterProfileImageUrl } from "@/lib/twitter-profile-image";

export type MarketCreator = {
  creator_profile_image_url?: string | null;
  creator_twitter_handle?: string | null;
};

function normalizeHandle(handle?: string | null): string | null {
  const normalized = handle?.replace(/^@/, "").trim().toLowerCase();
  return normalized || null;
}

export function creatorAvatarUrl(creator: MarketCreator): string {
  const stored = upsizeTwitterProfileImageUrl(creator.creator_profile_image_url);
  if (stored) return stored;

  const demoAvatar = demoCreatorAvatarPath(creator.creator_twitter_handle);
  if (demoAvatar) return demoAvatar;

  const handle = normalizeHandle(creator.creator_twitter_handle);
  if (handle) return `https://unavatar.io/x/${handle}`;

  return PLEASE_MARKET_LOGO_SRC;
}

export function creatorHandleLabel(creator: MarketCreator): string | null {
  const handle = creator.creator_twitter_handle?.replace(/^@/, "").trim();
  return handle ? `@${handle}` : null;
}
