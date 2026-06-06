/** Local demo creator avatars for seed / preview markets. */
export const DEMO_CREATOR_AVATARS: Record<string, string> = {
  anyone: "/assets/creators/anyone.png",
  ballknower: "/assets/creators/ballknower.jpg",
  degenqueen: "/assets/creators/degenqueen.jpg",
  eminence: "/assets/creators/eminence.png",
  goldbug: "/assets/creators/goldbug.jpg",
  oracle: "/assets/creators/oracle.jpg",
  popcorn: "/assets/creators/popcorn.png",
  satoshi: "/assets/creators/satoshi.jpg",
  wallstbets: "/assets/creators/wallstbets.webp",
};

export function demoCreatorAvatarPath(handle?: string | null): string | null {
  const normalized = handle?.replace(/^@/, "").trim().toLowerCase();
  if (!normalized) return null;
  return DEMO_CREATOR_AVATARS[normalized] ?? null;
}
