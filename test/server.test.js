import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.LICENSE_SECRET = "test-secret-at-least-16";
delete process.env.STRIPE_SECRET_KEY;
delete process.env.ANTHROPIC_API_KEY;

const { createApp, previewOf, rateLimited, FREE_EPISODES } = await import("../src/server.js");
const { issueToken, readToken } = await import("../src/license.js");

let server, base;
before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const brief = { name: "Iron Oak Gym", type: "Gym", city: "Tulsa", specialty: "Strength coaching for beginners" };

test("free users get a preview and a locked count", async () => {
  const res = await fetch(`${base}/api/season`, { method: "POST", body: JSON.stringify(brief) });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.episodes.length, FREE_EPISODES);
  assert.equal(body.locked, 30 - FREE_EPISODES);
  assert.equal(body.paid, false);
});

test("a forged token does not unlock the season", async () => {
  const res = await fetch(`${base}/api/season`, {
    method: "POST",
    headers: { authorization: "Bearer eyJzdWIiOiJzdWJfMSJ9.forged" },
    body: JSON.stringify(brief),
  });
  assert.equal((await res.json()).episodes.length, FREE_EPISODES);
});

test("bad input returns 400 with a message", async () => {
  const res = await fetch(`${base}/api/season`, { method: "POST", body: JSON.stringify({ name: "x" }) });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Missing/);
});

test("checkout reports 503 when Stripe isn't configured", async () => {
  const res = await fetch(`${base}/api/checkout`, { method: "POST" });
  assert.equal(res.status, 503);
});

test("serves the app and blocks path traversal", async () => {
  assert.match(await (await fetch(`${base}/`)).text(), /Episodic/);
  const res = await fetch(`${base}/..%2f..%2fpackage.json`);
  assert.notEqual(res.status, 200);
});

test("license tokens round-trip and reject tampering", () => {
  const token = issueToken({ sub: "sub_123" });
  assert.equal(readToken(token).sub, "sub_123");
  const [data, sig] = token.split(".");
  const tampered = Buffer.from(JSON.stringify({ sub: "sub_999" })).toString("base64url");
  assert.equal(readToken(`${tampered}.${sig}`), null);
  assert.equal(readToken("garbage"), null);
});

test("previewOf and rateLimited", () => {
  const p = previewOf({ episodes: [1, 2, 3, 4, 5] }, 2);
  assert.deepEqual(p.episodes, [1, 2]);
  assert.equal(p.locked, 3);
  const now = 1_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rateLimited("9.9.9.9", 3, 1000, now), false);
  assert.equal(rateLimited("9.9.9.9", 3, 1000, now), true);
  assert.equal(rateLimited("9.9.9.9", 3, 1000, now + 5000), false);
});
