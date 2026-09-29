# Episodic

Turn any local business into a 30-episode, search-optimized short-video series for TikTok, Reels and Shorts.

The business case, trend research and go-to-market plan are in **[PLAN.md](PLAN.md)**.

## How it works

- **Free:** fill in the business name, type, city and specialty to get a 3-episode preview from the built-in template engine (no API cost).
- **Paid ($9/mo via Stripe Checkout):** full 30-episode seasons, unlimited regeneration, AI-tailored episodes from Claude, and CSV export.
- Each episode has a hook, a shot list, on-screen text, a caption that leads with a local search phrase, hashtags and a CTA.
- The paywall is enforced server-side. Access comes from an HMAC-signed license token tied to a Stripe subscription, which is re-checked hourly. No database needed.

## Run locally

```bash
npm install
cp .env.example .env   # set LICENSE_SECRET at minimum
export $(grep -v '^#' .env | xargs)
npm start              # http://localhost:3000
npm test
```

## Deploy (Render / Railway / Fly)

Build: `npm install` · Start: `npm start` · Health check: `/healthz`. Set the env vars from `.env.example`.

## Layout

| Path | Purpose |
|---|---|
| `src/formats.js` | The 5 trend-backed series segments and the keyword builder |
| `src/local-generator.js` | Deterministic 30-episode generator (free tier and fallback) |
| `src/ai-generator.js` | Claude-backed generator with JSON-schema structured output |
| `src/billing.js` | Stripe Checkout and subscription checks |
| `src/license.js` | Signed, stateless license tokens |
| `src/server.js` | HTTP server, API routes, paywall, rate limit |
| `public/` | Single-page frontend |

## Zero-infrastructure version

`node scripts/build-standalone.mjs` bundles the generator into one self-contained page, `dist/episodic.html`. It needs no server, no API key and no hosting account; everything runs in the browser.

To turn on the paywall, pass a payment link and an unlock code. The code is stored only as a SHA-256 hash, and buyers see it on their payment receipt:

```bash
node scripts/build-standalone.mjs --pay-url=https://yourname.gumroad.com/l/episodic --unlock-code=SEASON-XXXX --price='$9'
```

The check runs client-side, so a determined user could bypass it. That's an acceptable trade for a $9 impulse purchase with no server to maintain.
