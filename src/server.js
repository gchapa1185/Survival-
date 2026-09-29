import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { generateSeason } from "./local-generator.js";
import { aiAvailable, generateSeasonAI } from "./ai-generator.js";
import { billingEnabled, createCheckout, subscriptionActive, subscriptionFromCheckout } from "./billing.js";
import { issueToken, readToken } from "./license.js";

export const FREE_EPISODES = 3;
const PUBLIC_DIR = fileURLToPath(new URL("../public/", import.meta.url));
const PRICE_LABEL = process.env.PRICE_LABEL || "$9/month";
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

// Free users get the first few episodes; the rest are counted but withheld
// server-side so the paywall can't be bypassed from the browser.
export function previewOf(season, count = FREE_EPISODES) {
  return {
    ...season,
    episodes: season.episodes.slice(0, count),
    locked: Math.max(0, season.episodes.length - count),
  };
}

const hits = new Map(); // ip -> timestamps, crude abuse guard
export function rateLimited(ip, limit = 30, windowMs = 60 * 60 * 1000, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

async function isPaid(req) {
  const auth = req.headers.authorization ?? "";
  const claims = readToken(auth.replace(/^Bearer /, ""));
  if (!claims?.sub) return false;
  if (!billingEnabled()) return false;
  return subscriptionActive(claims.sub);
}

async function handleSeason(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
  if (rateLimited(ip)) return send(res, 429, { error: "Too many requests. Try again in an hour." });

  const input = await readJson(req);
  const paid = await isPaid(req).catch(() => false);

  let season;
  if (paid && aiAvailable()) {
    try {
      season = await generateSeasonAI(input);
    } catch (err) {
      if (err.status === 400) throw err;
      console.error("AI generation failed, using templates:", err.message);
    }
  }
  season ??= generateSeason(input);
  send(res, 200, paid ? { ...season, locked: 0, paid: true } : { ...previewOf(season), paid: false });
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const baseUrl = process.env.PUBLIC_URL || `http://${req.headers.host}`;

  if (req.method === "GET" && url.pathname === "/api/config") {
    return send(res, 200, { billing: billingEnabled(), ai: aiAvailable(), price: PRICE_LABEL, freeEpisodes: FREE_EPISODES });
  }
  if (req.method === "POST" && url.pathname === "/api/season") return handleSeason(req, res);
  if (req.method === "POST" && url.pathname === "/api/checkout") {
    if (!billingEnabled()) return send(res, 503, { error: "Payments are not configured yet." });
    return send(res, 200, { url: await createCheckout(baseUrl) });
  }
  if (req.method === "GET" && url.pathname === "/api/activate") {
    const sub = await subscriptionFromCheckout(url.searchParams.get("session_id") ?? "");
    if (!sub) return send(res, 402, { error: "Checkout not completed." });
    return send(res, 200, { token: issueToken({ sub }) });
  }
  if (req.method === "GET" && url.pathname === "/healthz") return send(res, 200, { ok: true });
  if (req.method === "GET") return serveStatic(url.pathname, res);
  send(res, 404, { error: "Not found" });
}

async function serveStatic(pathname, res) {
  const rel = normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  const file = join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, { error: "Forbidden" });
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    send(res, 404, { error: "Not found" });
  }
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) throw Object.assign(new Error("Request too large"), { status: 413 });
  }
  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

export function createApp() {
  return createServer((req, res) => {
    route(req, res).catch((err) => {
      const status = err.status ?? 500;
      if (status >= 500) console.error(err);
      send(res, status, { error: status >= 500 ? "Something went wrong." : err.message });
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    console.log(`Episodic on http://localhost:${port} (billing: ${billingEnabled()}, ai: ${aiAvailable()})`);
  });
}
