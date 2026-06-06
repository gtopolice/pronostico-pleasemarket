import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours

export interface PreviewTokenPayload {
  marketId: string;
  exp: number;
}

/**
 * Generate a signed preview token for a market.
 * The token is URL-safe and contains the marketId + expiry, signed with HMAC-SHA256.
 */
export function generatePreviewToken(
  marketId: string,
  secret: string,
  expiryMs: number = DEFAULT_EXPIRY_MS
): string {
  const exp = Date.now() + expiryMs;
  const payload: PreviewTokenPayload = { marketId, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Validate a preview token.
 * Returns the decoded payload if valid, null otherwise.
 * Validation checks:
 * 1. Token format (payload.signature)
 * 2. Signature matches (timing-safe)
 * 3. Token has not expired
 * 4. marketId matches the expected marketId (market-scoped)
 */
export function validatePreviewToken(
  token: string,
  expectedMarketId: string,
  secret: string
): PreviewTokenPayload | null {
  if (!token || !token.includes(".")) return null;

  const [payloadB64, signature] = token.split(".", 2);
  if (!payloadB64 || !signature) return null;

  // Verify signature using timing-safe comparison
  const expectedSig = createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  const sigBuf = Buffer.from(signature, "base64url");
  const expectedSigBuf = Buffer.from(expectedSig, "base64url");

  if (
    sigBuf.length !== expectedSigBuf.length ||
    !timingSafeEqual(sigBuf, expectedSigBuf)
  ) {
    return null;
  }

  // Decode payload
  let payload: PreviewTokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as PreviewTokenPayload;
  } catch {
    return null;
  }

  // Validate expiry
  if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
    return null;
  }

  // Validate market scoping
  if (payload.marketId !== expectedMarketId) {
    return null;
  }

  return payload;
}
