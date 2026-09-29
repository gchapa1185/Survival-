// Stateless license tokens: base64url(JSON payload) + "." + HMAC signature.
// No database needed; the Stripe subscription is the source of truth and the
// token just remembers which subscription this browser paid for.

import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s = process.env.LICENSE_SECRET;
  if (!s || s.length < 16) throw new Error("LICENSE_SECRET must be set (16+ chars)");
  return s;
}

function sign(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function issueToken(payload) {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function readToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(sig ?? "");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
