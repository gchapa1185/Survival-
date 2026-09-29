// Deterministic season generator. Works with no API key, so the free preview
// costs nothing to serve and the app degrades gracefully if the AI call fails.

import { FORMATS, EXTRA, buildKeywords, fill, pick, roleFor, slug } from "./formats.js";

export const SEASON_LENGTH = 30;

// Mon..Sun rotation: search answers and proof carry the most buying intent,
// so they get the most slots; the numbered series runs through the week.
const WEEK = ["answers", "mundane", "dayn", "proof", "insider", "answers", "dayn"];

export function normalizeInput(raw = {}) {
  const clean = (v, max = 80) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  const input = {
    name: clean(raw.name),
    type: clean(raw.type, 40),
    city: clean(raw.city, 40),
    specialty: clean(raw.specialty),
    audience: clean(raw.audience) || "locals",
    tone: clean(raw.tone, 20) || "warm",
  };
  const missing = ["name", "type", "city", "specialty"].filter((k) => !input[k]);
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
  return input;
}

export function generateSeason(rawInput) {
  const input = normalizeInput(rawInput);
  const role = roleFor(input.type);
  const keywords = buildKeywords(input);
  const nameTag = slug(input.name);
  const cityTag = slug(input.city);
  const typeTag = slug(input.type);
  const localTag = /food|cafe|bakery|taco|restaurant|coffee|pizza|bar/i.test(input.type)
    ? `#${cityTag}eats`
    : "#shoplocal";

  const byId = Object.fromEntries(FORMATS.map((f) => [f.id, f]));
  const seen = {};
  let dayCounter = 0;

  const episodes = [];
  for (let i = 0; i < SEASON_LENGTH; i++) {
    const format = byId[WEEK[i % WEEK.length]];
    const k = (seen[format.id] = (seen[format.id] ?? -1) + 1);
    if (format.id === "dayn") dayCounter++;

    const vars = {
      ...input,
      type: input.type.toLowerCase(),
      specialty: input.specialty.toLowerCase(),
      role,
      n: dayCounter,
      count: pick([3, 5, 4], k),
      time: pick(EXTRA.TIMES, k),
      pace: pick(EXTRA.PACES, k),
      challenge: fill(pick(EXTRA.CHALLENGES, Math.floor(i / 7)), input),
    };

    const keyword = pick(keywords, i);
    const title = fill(pick(format.titles, k), vars);
    const hook = fill(pick(format.hooks, k), vars);
    // Front-load the search keyword: TikTok shows ~50 chars before "more".
    const caption = [
      `${capitalize(keyword)} | ${title}.`,
      captionBody(format.id, vars),
      `📍 ${input.name}, ${input.city}`,
    ].join(" ");

    episodes.push({
      n: i + 1,
      series: fill(format.name, vars),
      format: format.id,
      title,
      hook,
      shots: format.shots.map((s) => fill(s, vars)),
      onScreenText: title,
      caption,
      searchKeyword: keyword,
      hashtags: unique([
        `#${cityTag}`,
        `#${typeTag}`,
        `#${cityTag}${typeTag}`,
        `#${nameTag}`,
        `#smallbusiness`,
        format.id === "answers" ? `#${typeTag}tips` : localTag,
      ]),
      cta: pick(CTAS[format.id], k),
      trend: format.trend,
    });
  }

  return {
    showTitle: `${input.name}: ${pick(SHOW_TAGLINES, input.name.length)}`,
    premise: `A daily short-video series from ${input.name}, a ${input.type.toLowerCase()} in ${input.city} known for ${input.specialty.toLowerCase()}. Five recurring segments rotate through the week so ${input.audience.toLowerCase()} always know what's coming next, and every caption is written to rank in TikTok and Instagram search.`,
    cadence: "1 episode per day, 30 days. Film 5–7 in one batch session per week.",
    keywords,
    segments: FORMATS.map((f) => ({ name: fill(f.name, { role, n: "N", challenge: "…" }), why: f.trend })),
    episodes,
    source: "template",
  };
}

const SHOW_TAGLINES = ["Behind the Counter", "The Daily Episode", "Open Every Day", "Tales from the Shop"];

const CTAS = {
  mundane: ["Follow for tomorrow's episode", "Save this for your next slow morning", "Come see it in person"],
  answers: ["Save this before you book", "Send this to someone who needs it", "Drop your question for the next episode"],
  proof: ["Leave us a review and we might read it next", "Tag someone who'd love this", "Come find out for yourself"],
  dayn: ["Comment what tomorrow's challenge should be", "Follow so you don't miss tomorrow's episode", "Which day was your favorite?"],
  insider: ["Agree or disagree? Comments", "Share with a friend who needs to hear this", "Follow for more honest takes"],
};

function captionBody(formatId, v) {
  switch (formatId) {
    case "answers": return `A ${v.role} in ${v.city} answers it honestly, no sales pitch.`;
    case "proof": return `Real words from real ${v.audience.toLowerCase()}. Thank you for trusting us with ${v.specialty.toLowerCase()}.`;
    case "dayn": return `Our daily series continues. Your comments pick what happens next.`;
    case "insider": return `Insider notes from someone who does this every day.`;
    default: return `The small moments behind ${v.specialty.toLowerCase()} at ${v.name}.`;
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function unique(list) {
  return [...new Set(list)];
}
