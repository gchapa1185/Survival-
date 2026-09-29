// Builds a static site of search landing pages, one per business type
// ("30 TikTok ideas for a bakery"), from the same template generator the app
// uses. No server or API key. Output: docs/ (ready for GitHub Pages).
//
//   node scripts/build-seo-pages.mjs [--base-url=URL] [--out=DIR]

import { mkdir, rm, writeFile } from "node:fs/promises";
import { generateSeason } from "../src/local-generator.js";
import { BUSINESSES } from "./seo-businesses.mjs";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split(/=(.*)/s).slice(0, 2)));
const BASE_URL = (args["base-url"] || "https://gchapa1185.github.io/Survival-").replace(/\/$/, "");
const OUT = new URL(`../${args.out || "docs"}/`, import.meta.url);

export const APP_URL = "https://claude.ai/artifact/Jp4VkajQmTCBWsNxQjYJ1a";
export const BUY_URL = "https://gumroad.com/l/iclhqk";
const PRICE = "$9";
const FREE_EPISODES = 3;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
export const pageSlug = (type) => `tiktok-ideas-for-${type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const plural = (b) => b.plural ?? `${b.type}s`;
const article = (w) => (/^[aeiou]/i.test(w) ? "an" : "a");

const CSS = `
:root{--bg:#f4f5f2;--panel:#fff;--ink:#16181b;--muted:#555a60;--rule:#dcdfd9;--tally:#c81f31;--tally-ink:#fff;
--display:"Arial Narrow","Roboto Condensed","Helvetica Neue",Arial,sans-serif;--body:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
@media (prefers-color-scheme:dark){:root{--bg:#101214;--panel:#181b1e;--ink:#eceee9;--muted:#a3a9ae;--rule:#2d3236;--tally:#ff5263;--tally-ink:#101214}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.55 var(--body)}
main{max-width:760px;margin:0 auto;padding:32px 16px 64px}
h1,h2,h3{font-family:var(--display);font-weight:800;letter-spacing:-.01em;line-height:1.1;text-wrap:balance}
h1{font-size:clamp(32px,6vw,48px);margin:.2em 0 .3em}
h2{font-size:28px;margin:1.6em 0 .5em}
h3{font-size:20px;margin:0 0 .3em}
a{color:inherit}
.kicker{display:inline-block;background:var(--tally);color:var(--tally-ink);font-weight:800;font-size:13px;letter-spacing:.12em;text-transform:uppercase;padding:.3em .6em;border-radius:4px}
.lede{font-size:19px;color:var(--muted)}
.cta{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}
.btn{display:inline-block;padding:14px 20px;border-radius:8px;font-weight:700;text-decoration:none;border:2px solid var(--ink)}
.btn.primary{background:var(--tally);border-color:var(--tally);color:var(--tally-ink)}
.ep{background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:18px;margin:14px 0}
.ep .n{font-family:var(--display);font-weight:800;color:var(--tally)}
.ep dl{margin:8px 0 0}.ep dt{font-weight:700;margin-top:8px}.ep dd{margin:0;color:var(--muted)}
.ep ol{margin:4px 0 0;padding-left:20px;color:var(--muted)}
ol.titles{padding-left:24px}ol.titles li{margin:6px 0}
ol.titles .locked{color:var(--muted)}
.note{font-size:14px;color:var(--muted)}
ul.types{columns:2;padding-left:18px}@media (max-width:520px){ul.types{columns:1}}
footer{margin-top:48px;padding-top:16px;border-top:1px solid var(--rule);font-size:14px;color:var(--muted)}
`;

function layout({ title, description, path, body }) {
  const url = `${BASE_URL}/${path}`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:type" content="article">
<style>${CSS}</style>
</head><body><main>
${body}
<footer><a href="${esc(BASE_URL)}/">All business types</a> · Made with Episodic, a 30-day short-video planner for local businesses.</footer>
</main></body></html>
`;
}

function cta(what) {
  return `<div class="cta"><a class="btn primary" href="${APP_URL}">Plan your ${esc(what)}'s 30 days free</a><a class="btn" href="${BUY_URL}">Unlock all 30 for ${PRICE}</a></div>`;
}

function episodeCard(ep) {
  return `<div class="ep"><div class="n">Day ${ep.n} · ${esc(ep.series)}</div><h3>${esc(ep.title)}</h3><dl>
<dt>Hook (first 2 seconds)</dt><dd>${esc(ep.hook)}</dd>
<dt>Shot list</dt><dd><ol>${ep.shots.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></dd>
<dt>Caption</dt><dd>${esc(ep.caption)}</dd>
<dt>Hashtags</dt><dd>${esc(ep.hashtags.join(" "))}</dd>
<dt>Call to action</dt><dd>${esc(ep.cta)}</dd></dl></div>`;
}

export function businessPage(b) {
  const season = generateSeason({ ...b, type: b.genType ?? b.type });
  const t = b.type.toLowerCase();
  const title = `30 TikTok Ideas for ${b.title ?? capitalizeWords(plural(b))}: Hooks, Shot Lists & Captions`;
  const description = `A ready-to-film 30-day TikTok, Reels and Shorts plan for ${article(t)} ${t}: daily video ideas with hooks, shot lists, captions and hashtags written for local search.`;
  const segments = season.segments.length;
  const body = `<span class="kicker">30-day video series</span>
<h1>30 TikTok ideas for ${esc(article(t))} ${esc(t)}</h1>
<p class="lede">Not sure what to post? Here's a full month of short videos for ${esc(article(t))} ${esc(t)}, built around what locals type into TikTok and Instagram search. Each one can be filmed on a phone in about 15 minutes.</p>
${cta(b.type)}
<h2>How the month works</h2>
<p>${segments} recurring segments rotate through the week, so followers know what's coming and you never start from a blank page:</p>
<ul>${season.segments.map((s) => `<li><strong>${esc(s.name)}</strong></li>`).join("")}</ul>
<p>Search phrases this plan targets: ${season.keywords.slice(0, 6).map((k) => `<em>${esc(k)}</em>`).join(", ")}.</p>
<h2>The first ${FREE_EPISODES} episodes, in full</h2>
<p class="note">Example plan for ${esc(b.name)}, a fictional ${esc((b.genType ?? b.type).toLowerCase())} in ${esc(b.city)} known for ${esc(b.specialty)}. Yours uses your business name, city and specialty.</p>
${season.episodes.slice(0, FREE_EPISODES).map(episodeCard).join("\n")}
<h2>All 30 video ideas</h2>
<ol class="titles">${season.episodes.map((ep) => `<li${ep.n > FREE_EPISODES ? ' class="locked"' : ""}><strong>${esc(ep.title)}</strong> · ${esc(ep.hook)}</li>`).join("")}</ol>
<h2>Get the plan for your ${esc(t)}</h2>
<p>Type in your business name, city and specialty and Episodic writes all 30 episodes for you, with shot lists, captions and hashtags. The first ${FREE_EPISODES} are free. Unlocking all 30 is a one-time ${PRICE}, for as many businesses as you like. Nothing you type leaves your device.</p>
${cta(b.type)}`;
  return { path: `${pageSlug(b.type)}/`, title, description, html: layout({ title, description, path: `${pageSlug(b.type)}/`, body }) };
}

function indexPage(pages) {
  const title = "30-Day TikTok Content Plans for Local Businesses";
  const description = "Free 30-day TikTok, Reels and Shorts video plans for local businesses, with hooks, shot lists, captions and hashtags for each day.";
  const body = `<span class="kicker">30-day video series</span>
<h1>A month of TikToks, planned for your business</h1>
<p class="lede">Pick your type of business to see a sample 30-day plan: a hook, shot list, caption and hashtags for every day.</p>
${cta("business")}
<h2>Plans by business type</h2>
<ul class="types">${pages.map((p) => `<li><a href="${esc(BASE_URL)}/${p.path}">${esc(p.label)}</a></li>`).join("")}</ul>`;
  return layout({ title, description, path: "", body });
}

function capitalizeWords(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function build() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const pages = [];
  for (const b of BUSINESSES) {
    const p = businessPage(b);
    await mkdir(new URL(p.path, OUT), { recursive: true });
    await writeFile(new URL(`${p.path}index.html`, OUT), p.html);
    pages.push({ ...p, label: capitalizeWords(plural(b)) });
  }
  pages.sort((a, b) => a.label.localeCompare(b.label));
  await writeFile(new URL("index.html", OUT), indexPage(pages));
  const today = new Date().toISOString().slice(0, 10);
  const urls = [`${BASE_URL}/`, ...pages.map((p) => `${BASE_URL}/${p.path}`)];
  await writeFile(new URL("sitemap.xml", OUT), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
  await writeFile(new URL("robots.txt", OUT), `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`);
  await writeFile(new URL(".nojekyll", OUT), "");
  return pages.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = await build();
  console.log(`Built ${n} business pages + index into ${OUT.pathname}`);
}
