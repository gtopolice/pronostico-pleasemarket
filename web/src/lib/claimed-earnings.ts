const STORAGE_PREFIX = "please_claimed_usdc_";

export function loadClaimedEarnings(wallet: string | undefined): number {
  if (!wallet || typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${wallet.toLowerCase()}`);
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function saveClaimedEarnings(wallet: string, amount: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_PREFIX}${wallet.toLowerCase()}`, String(amount));
}
