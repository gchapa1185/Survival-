// Claude-backed season generator for paying users. Returns the same shape as
// the local generator, so the frontend never needs to know which one ran.

import Anthropic from "@anthropic-ai/sdk";
import { FORMATS, buildKeywords, fill, roleFor } from "./formats.js";
import { SEASON_LENGTH, normalizeInput } from "./local-generator.js";

const MODEL = process.env.EPISODIC_MODEL || "claude-opus-5-5";

const EPISODE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["n", "series", "format", "title", "hook", "shots", "onScreenText", "caption", "searchKeyword", "hashtags", "cta"],
  properties: {
    n: { type: "integer" },
    series: { type: "string" },
    format: { type: "string", enum: FORMATS.map((f) => f.id) },
    title: { type: "string" },
    hook: { type: "string" },
    shots: { type: "array", items: { type: "string" } },
    onScreenText: { type: "string" },
    caption: { type: "string" },
    searchKeyword: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
    cta: { type: "string" },
  },
};

const SEASON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["showTitle", "premise", "cadence", "keywords", "episodes"],
  properties: {
    showTitle: { type: "string" },
    premise: { type: "string" },
    cadence: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    episodes: { type: "array", items: EPISODE_SCHEMA },
  },
};

const SYSTEM = `You write short-video content plans for small local businesses. The owner films every episode themselves on a phone, so every idea must be filmable in under 15 minutes with no crew, no actors and no AI-generated footage. Audiences in 2026 reward real people over polished ads.

Write a ${SEASON_LENGTH}-episode season built from these recurring segments (rotate them so viewers learn the schedule):
${FORMATS.map((f) => `- ${f.id}: "${f.name}" (${f.trend})`).join("\n")}

Rules:
- Hooks are what is said or shown in the first 2 seconds. Make them specific to this business and city, never generic.
- Captions put a real search phrase in the first 50 characters, read naturally, and stay under 300 characters. No keyword stuffing.
- 4-6 hashtags per episode, mixing city, niche and business name.
- "proof" episodes must use real customer reviews the owner already has; tell them to get permission. Never invent quotes.
- Never promise results, prices or claims the owner did not give you.
- Number episodes 1-${SEASON_LENGTH}.`;

let client;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export function aiAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export async function generateSeasonAI(rawInput) {
  const input = normalizeInput(rawInput);
  const brief = [
    `Business name: ${input.name}`,
    `Type: ${input.type} (the owner is a ${roleFor(input.type)})`,
    `City: ${input.city}`,
    `Known for: ${input.specialty}`,
    `Audience: ${input.audience}`,
    `Tone: ${input.tone}`,
    `Starter search phrases (improve on these): ${buildKeywords(input).join("; ")}`,
  ].join("\n");

  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SEASON_SCHEMA },
    },
    system: SYSTEM,
    messages: [{ role: "user", content: brief }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw Object.assign(new Error("The model declined this request."), { status: 422 });
  }
  if (message.stop_reason === "max_tokens") {
    throw Object.assign(new Error("Season was cut off before it finished."), { status: 502 });
  }
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const season = JSON.parse(text);
  const trendById = Object.fromEntries(FORMATS.map((f) => [f.id, f.trend]));
  season.episodes = season.episodes.map((e) => ({ ...e, trend: trendById[e.format] }));
  const role = roleFor(input.type);
  season.segments = FORMATS.map((f) => ({ name: fill(f.name, { role, n: "N", challenge: "…" }), why: f.trend }));
  season.source = "ai";
  return season;
}
