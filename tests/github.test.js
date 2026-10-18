import { test } from "node:test";
import assert from "node:assert/strict";
import { selectRepos, languageShares, languageSlug, relativeTime } from "../js/github.js";

const repo = (name, overrides = {}) => ({
  name,
  fork: false,
  archived: false,
  private: false,
  language: "Kotlin",
  pushed_at: "2026-10-01T00:00:00Z",
  ...overrides,
});

test("selectRepos drops forks, archived and private repos", () => {
  const picked = selectRepos([
    repo("mine"),
    repo("forked", { fork: true }),
    repo("old", { archived: true }),
    repo("secret", { private: true }),
  ]);
  assert.deepEqual(
    picked.map((r) => r.name),
    ["mine"],
  );
});

test("selectRepos sorts by last push and respects the limit", () => {
  const picked = selectRepos(
    [
      repo("a", { pushed_at: "2026-01-01T00:00:00Z" }),
      repo("b", { pushed_at: "2026-10-18T00:00:00Z" }),
      repo("c", { pushed_at: "2026-05-01T00:00:00Z" }),
    ],
    2,
  );
  assert.deepEqual(
    picked.map((r) => r.name),
    ["b", "c"],
  );
});

test("languageShares counts primary languages, biggest first, skipping unknown", () => {
  const shares = languageShares([
    repo("a", { language: "Kotlin" }),
    repo("b", { language: "Java" }),
    repo("c", { language: "Kotlin" }),
    repo("d", { language: null }),
  ]);
  assert.deepEqual(shares, [
    { language: "Kotlin", count: 2, percent: 67 },
    { language: "Java", count: 1, percent: 33 },
  ]);
});

test("languageShares is empty for repos without languages", () => {
  assert.deepEqual(languageShares([repo("a", { language: null })]), []);
});

test("languageSlug makes CSS-friendly names", () => {
  assert.equal(languageSlug("Kotlin"), "kotlin");
  assert.equal(languageSlug("C++"), "c-plus-plus");
  assert.equal(languageSlug("C#"), "c-sharp");
  assert.equal(languageSlug("Jupyter Notebook"), "jupyter-notebook");
});

test("relativeTime speaks Turkish and English", () => {
  const now = new Date("2026-10-18T12:00:00Z");
  assert.equal(relativeTime("2026-10-15T12:00:00Z", now, "en"), "3 days ago");
  assert.equal(relativeTime("2026-10-15T12:00:00Z", now, "tr"), "3 gün önce");
  assert.equal(relativeTime("2026-10-17T12:00:00Z", now, "en"), "yesterday");
  assert.equal(relativeTime("2026-10-18T11:59:30Z", now, "en"), "this minute");
});

test("relativeTime picks months and years for older pushes", () => {
  const now = new Date("2026-10-18T12:00:00Z");
  assert.equal(relativeTime("2026-07-11T12:00:00Z", now, "en"), "3 months ago");
  assert.equal(relativeTime("2024-10-01T12:00:00Z", now, "en"), "2 years ago");
});
