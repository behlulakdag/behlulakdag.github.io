import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveInitialTheme, nextTheme } from "../js/theme.js";

test("a saved theme wins over the system setting", () => {
  assert.equal(resolveInitialTheme("dark", true), "dark");
  assert.equal(resolveInitialTheme("light", false), "light");
});

test("without a saved theme the system setting decides", () => {
  assert.equal(resolveInitialTheme(null, true), "light");
  assert.equal(resolveInitialTheme(null, false), "dark");
});

test("garbage in storage is ignored", () => {
  assert.equal(resolveInitialTheme("purple", false), "dark");
});

test("nextTheme flips between the two themes", () => {
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme(undefined), "light");
});
