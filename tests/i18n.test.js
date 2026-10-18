import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pickLanguage, lookup, format, parseAttrSpec, otherLanguage } from "../js/i18n.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const tr = JSON.parse(await read("../lang/tr.json"));
const en = JSON.parse(await read("../lang/en.json"));
const html = await read("../index.html");

/* ---------- Language choice ---------- */

test("a saved choice beats the link and the browser", () => {
  assert.equal(pickLanguage({ stored: "tr", query: "en", browserLanguages: ["en-US"] }), "tr");
});

test("?lang= in the link beats the browser language", () => {
  assert.equal(pickLanguage({ stored: null, query: "en", browserLanguages: ["tr-TR"] }), "en");
});

test("browser language is used when nothing else is set, region ignored", () => {
  assert.equal(pickLanguage({ stored: null, query: null, browserLanguages: ["de-DE", "en-GB"] }), "en");
  assert.equal(pickLanguage({ stored: null, query: null, browserLanguages: ["tr-TR"] }), "tr");
});

test("unknown values fall back to Turkish", () => {
  assert.equal(pickLanguage({ stored: "fr", query: "xx", browserLanguages: ["ja"] }), "tr");
});

test("otherLanguage flips TR and EN", () => {
  assert.equal(otherLanguage("tr"), "en");
  assert.equal(otherLanguage("en"), "tr");
});

/* ---------- Helpers ---------- */

test("lookup follows dotted keys and returns undefined for missing ones", () => {
  assert.equal(lookup({ a: { b: "x" } }, "a.b"), "x");
  assert.equal(lookup({ a: {} }, "a.b.c"), undefined);
});

test("format fills {placeholders} and leaves unknown ones alone", () => {
  assert.equal(format("{count} items, {other}", { count: 3 }), "3 items, {other}");
});

test("parseAttrSpec reads several attribute:key pairs", () => {
  assert.deepEqual(parseAttrSpec("alt:a.b; title:c.d"), [
    ["alt", "a.b"],
    ["title", "c.d"],
  ]);
});

/* ---------- Dictionaries stay in sync ---------- */

function leafPaths(node, prefix = "") {
  if (typeof node !== "object" || node === null || Array.isArray(node)) return [prefix];
  return Object.entries(node).flatMap(([key, value]) => leafPaths(value, prefix ? `${prefix}.${key}` : key));
}

test("tr.json and en.json have exactly the same keys", () => {
  assert.deepEqual(leafPaths(en).sort(), leafPaths(tr).sort());
});

test("no translation is left empty", () => {
  for (const path of leafPaths(en)) {
    const value = lookup(en, path);
    assert.ok(Array.isArray(value) ? value.length : String(value).trim(), `en.${path} is empty`);
  }
});

/* ---------- HTML and tr.json stay in sync ---------- */

// <br> counts as a space so "a<br>b" and "a<br />\n  b" compare equal
const normalize = (text) =>
  text
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();

const textKeys = [...html.matchAll(/<(\w+)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)];
const htmlKeys = [...html.matchAll(/<(\w+)\b[^>]*?\sdata-i18n-html="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)];
const attrTags = [...html.matchAll(/<[^>]*\sdata-i18n-attr="([^"]+)"[^>]*>/g)];

test("the HTML actually uses translation keys", () => {
  assert.ok(textKeys.length > 40, `only ${textKeys.length} data-i18n elements found`);
  assert.ok(attrTags.length > 10, `only ${attrTags.length} data-i18n-attr elements found`);
});

test("every key used in index.html exists in both languages", () => {
  const used = [
    ...textKeys.map((m) => m[2]),
    ...htmlKeys.map((m) => m[2]),
    ...attrTags.flatMap((m) => parseAttrSpec(m[1]).map(([, key]) => key)),
  ];
  for (const key of used) {
    assert.equal(typeof lookup(tr, key), "string", `tr.json missing ${key}`);
    assert.equal(typeof lookup(en, key), "string", `en.json missing ${key}`);
  }
});

test("Turkish text in index.html matches tr.json", () => {
  for (const [, , key, content] of [...textKeys, ...htmlKeys]) {
    assert.equal(normalize(content), normalize(lookup(tr, key)), `text of ${key}`);
  }
});

test("Turkish attributes in index.html match tr.json", () => {
  for (const [tag, spec] of attrTags) {
    for (const [attribute, key] of parseAttrSpec(spec)) {
      const value = tag.match(new RegExp(`\\s${attribute}="([^"]*)"`));
      assert.ok(value, `${attribute} missing on element with ${key}`);
      assert.equal(normalize(value[1]), normalize(lookup(tr, key)), `${attribute} of ${key}`);
    }
  }
});

test("page title and description match tr.json", () => {
  assert.equal(html.match(/<title>([^<]+)<\/title>/)[1], tr.meta.title);
  assert.equal(normalize(html.match(/name="description"\s+content="([^"]+)"/)[1]), tr.meta.description);
});
