import { test } from "node:test";
import assert from "node:assert/strict";
import { businessPage, pageSlug, APP_URL, BUY_URL } from "../scripts/build-seo-pages.mjs";
import { BUSINESSES } from "../scripts/seo-businesses.mjs";

test("every business page links to the app and checkout with no unfilled placeholders", () => {
  for (const b of BUSINESSES) {
    const { html } = businessPage(b);
    assert.ok(html.includes(APP_URL), `${b.type} page missing app link`);
    assert.ok(html.includes(BUY_URL), `${b.type} page missing buy link`);
    assert.doesNotMatch(html, /\{\w+\}/, `${b.type} page has an unfilled placeholder`);
    assert.doesNotMatch(html, /undefined|NaN/, `${b.type} page rendered a missing value`);
  }
});

test("page slugs and titles are unique", () => {
  const slugs = BUSINESSES.map((b) => pageSlug(b.type));
  assert.equal(new Set(slugs).size, slugs.length);
  const titles = BUSINESSES.map((b) => businessPage(b).title);
  assert.equal(new Set(titles).size, titles.length);
});

test("person-type businesses generate with a company noun", () => {
  const { html } = businessPage(BUSINESSES.find((b) => b.type === "plumber"));
  assert.doesNotMatch(html, /running a plumber\b|owning a plumber\b/);
});
