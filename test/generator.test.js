import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSeason, normalizeInput, SEASON_LENGTH } from "../src/local-generator.js";

const brief = { name: "Rosa's Panadería", type: "Bakery", city: "San Antonio", specialty: "Fresh conchas" };

test("generates a full season with every field filled", () => {
  const season = generateSeason(brief);
  assert.equal(season.episodes.length, SEASON_LENGTH);
  for (const ep of season.episodes) {
    for (const key of ["title", "hook", "caption", "searchKeyword", "cta", "series"]) {
      assert.ok(ep[key], `episode ${ep.n} missing ${key}`);
      assert.doesNotMatch(ep[key], /\{\w+\}/, `episode ${ep.n} has unfilled placeholder in ${key}`);
    }
    assert.ok(ep.shots.length >= 3);
    assert.ok(ep.hashtags.every((h) => /^#[a-z0-9]+$/.test(h)), `bad hashtag in ${ep.n}`);
  }
});

test("captions front-load the search keyword within 50 characters", () => {
  for (const ep of generateSeason(brief).episodes) {
    const idx = ep.caption.toLowerCase().indexOf(ep.searchKeyword.toLowerCase());
    assert.ok(idx >= 0 && idx + ep.searchKeyword.length <= 50, `episode ${ep.n}: ${ep.caption}`);
  }
});

test("numbered 'Day N' series counts up without gaps", () => {
  const days = generateSeason(brief).episodes.filter((e) => e.format === "dayn").map((e) => e.hook.match(/Day (\d+)/)[1]);
  assert.deepEqual(days.map(Number), days.map((_, i) => i + 1));
});

test("is deterministic", () => {
  assert.deepEqual(generateSeason(brief), generateSeason(brief));
});

test("rejects missing required fields with a 400", () => {
  assert.throws(() => normalizeInput({ name: "x" }), (err) => err.status === 400 && /type, city, specialty/.test(err.message));
});

test("trims and caps input", () => {
  const input = normalizeInput({ ...brief, name: `  ${"a".repeat(200)}  ` });
  assert.equal(input.name.length, 80);
  assert.equal(input.audience, "locals");
});
test("hashtags keep accented letters", async () => { const { slug } = await import("../src/formats.js"); assert.equal(slug("Rosa's Panadería"), "rosaspanaderia"); });
