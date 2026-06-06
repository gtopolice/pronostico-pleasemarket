export const truncateHash = (
  hash: string,
  start: number = 6,
  end: number = 4
): string => {
  if (!hash) return "";
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};
