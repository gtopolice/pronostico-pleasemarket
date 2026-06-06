import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generatePreviewToken,
  validatePreviewToken,
  PreviewTokenPayload,
} from "./preview-token";

describe("generatePreviewToken", () => {
  it("should generate a token with two base64url parts", () => {
    const token = generatePreviewToken("m1", "secret");
    const parts = token.split(".");
    assert.strictEqual(parts.length, 2);
    assert.ok(parts[0].length > 0);
    assert.ok(parts[1].length > 0);
  });

  it("should encode the marketId and expiry in the payload", () => {
    const token = generatePreviewToken("m1", "secret");
    const [payloadB64] = token.split(".");
    const payload: PreviewTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );
    assert.strictEqual(payload.marketId, "m1");
    assert.ok(typeof payload.exp === "number");
    assert.ok(payload.exp > Date.now());
  });

  it("should use custom expiry when provided", () => {
    const now = Date.now();
    const token = generatePreviewToken("m1", "secret", 5000);
    const [payloadB64] = token.split(".");
    const payload: PreviewTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );
    assert.ok(payload.exp >= now + 4000 && payload.exp <= now + 6000);
  });
});

describe("validatePreviewToken", () => {
  const secret = "my-preview-secret";

  it("should validate a correctly generated token", () => {
    const token = generatePreviewToken("m1", secret);
    const result = validatePreviewToken(token, "m1", secret);
    assert.ok(result);
    assert.strictEqual(result!.marketId, "m1");
  });

  it("should reject a token with a mismatched marketId", () => {
    const token = generatePreviewToken("m1", secret);
    const result = validatePreviewToken(token, "m2", secret);
    assert.strictEqual(result, null);
  });

  it("should reject a token with the wrong secret", () => {
    const token = generatePreviewToken("m1", secret);
    const result = validatePreviewToken(token, "m1", "wrong-secret");
    assert.strictEqual(result, null);
  });

  it("should reject an expired token", () => {
    const token = generatePreviewToken("m1", secret, -1000);
    const result = validatePreviewToken(token, "m1", secret);
    assert.strictEqual(result, null);
  });

  it("should reject a malformed token", () => {
    assert.strictEqual(validatePreviewToken("not-a-token", "m1", secret), null);
    assert.strictEqual(validatePreviewToken("", "m1", secret), null);
    assert.strictEqual(validatePreviewToken("only-one-part", "m1", secret), null);
  });

  it("should reject a tampered payload", () => {
    const token = generatePreviewToken("m1", secret);
    const [payloadB64, sig] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ marketId: "m2", exp: Date.now() + 10000 })
    ).toString("base64url");
    const tamperedToken = `${tamperedPayload}.${sig}`;
    assert.strictEqual(validatePreviewToken(tamperedToken, "m2", secret), null);
  });
});
