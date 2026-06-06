import { ethers } from "ethers";

export interface RpcEndpoint {
  url: string;
  maxRequestsPerMinute: number;
}

// NOTE: Add new RPC endpoints here as needed. The system will
// automatically fall back to the next available endpoint if one
// is rate-limited or unavailable.
export const RPC_ENDPOINTS: RpcEndpoint[] = [
  {
    url: "https://sepolia.base.org",
    maxRequestsPerMinute: 30,
  },
  // AllThatNode — requires NEXT_PUBLIC_ALLTHATNODE_URL env var
  ...(process.env.NEXT_PUBLIC_ALLTHATNODE_URL
    ? [
        {
          url: process.env.NEXT_PUBLIC_ALLTHATNODE_URL,
          maxRequestsPerMinute: 10,
        },
      ]
    : []),
];

// In-memory request tracker: endpoint URL -> { count, windowStart }
const requestCounts = new Map<string, { count: number; windowStart: number }>();

const WINDOW_MS = 60_000; // 60 seconds

function isWindowExpired(windowStart: number): boolean {
  return Date.now() - windowStart > WINDOW_MS;
}

function getRequestInfo(url: string): { count: number; windowStart: number } {
  let info = requestCounts.get(url);
  if (!info || isWindowExpired(info.windowStart)) {
    info = { count: 0, windowStart: Date.now() };
    requestCounts.set(url, info);
  }
  return info;
}

function isRateLimited(url: string, maxPerMinute: number): boolean {
  const info = getRequestInfo(url);
  return info.count >= maxPerMinute;
}

function recordRequest(url: string): void {
  const info = getRequestInfo(url);
  info.count++;
}

/**
 * Returns the URL of the first endpoint with available capacity.
 * If all are rate-limited, returns the one that resets soonest (fail-open).
 */
export function getBestAvailableRpcUrl(): string {
  let bestUrl: string | null = null;
  let bestResetAt: number = Infinity;

  for (const endpoint of RPC_ENDPOINTS) {
    if (!isRateLimited(endpoint.url, endpoint.maxRequestsPerMinute)) {
      return endpoint.url;
    }
    // Track which one resets soonest as fallback
    const info = requestCounts.get(endpoint.url);
    if (info) {
      const resetAt = info.windowStart + WINDOW_MS;
      if (resetAt < bestResetAt) {
        bestResetAt = resetAt;
        bestUrl = endpoint.url;
      }
    }
  }

  // All rate-limited — fail open and return the one resetting soonest
  return bestUrl ?? RPC_ENDPOINTS[0].url;
}

/**
 * Creates a read-only provider using the best available RPC endpoint.
 * Uses StaticJsonRpcProvider to avoid network detection on creation
 * (no eth_chainId call that can trigger infinite retry loops on CSP blocks).
 */
export function createReadOnlyProvider(): ethers.JsonRpcProvider {
  const baseUrl = getBestAvailableRpcUrl();
  recordRequest(baseUrl);
  return new ethers.JsonRpcProvider(baseUrl, undefined, { staticNetwork: true });
}

/**
 * Returns true if the error is a rate-limit error (429).
 */
export function isRateLimitedError(err: any): boolean {
  if (!err) return false;
  if (err.status === 429) return true;
  const msg = err.message ?? String(err);
  return (
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit")
  );
}