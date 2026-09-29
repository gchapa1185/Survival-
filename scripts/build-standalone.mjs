// Bundles the season generator into one self-contained HTML page that needs
// no server, no API key and no hosting account. Output: dist/episodic.html
//
//   node scripts/build-standalone.mjs [--pay-url=URL] [--unlock-code=CODE] [--price=LABEL]
//
// With no --pay-url the page is fully free. With one, episodes after the
// preview are gated behind a code the buyer receives on the payment receipt.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split(/=(.*)/s).slice(0, 2)));

const strip = (src) => src.replace(/^import .*;$/gm, "").replace(/^export /gm, "");
const generator = [
  strip(await readFile(new URL("src/formats.js", root), "utf8")),
  strip(await readFile(new URL("src/local-generator.js", root), "utf8")),
].join("\n");

const config = {
  payUrl: args["pay-url"] || "",
  unlockHash: args["unlock-code"] ? createHash("sha256").update(args["unlock-code"].trim().toUpperCase()).digest("hex") : "",
  price: args.price || "$9",
  freeEpisodes: 3,
};

const template = await readFile(new URL("standalone/template.html", root), "utf8");
const html = template
  .replace("/*__CONFIG__*/", `const CONFIG = ${JSON.stringify(config)};`)
  .replace("/*__GENERATOR__*/", () => generator);

await mkdir(new URL("dist/", root), { recursive: true });
await writeFile(new URL("dist/episodic.html", root), html);
console.log(`dist/episodic.html (${(html.length / 1024).toFixed(1)} KB, paywall: ${config.payUrl ? "on" : "off"})`);
