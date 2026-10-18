import { test } from "node:test";
import assert from "node:assert/strict";
import { nextTabIndex } from "../demos/kafe/js/menu-tabs.js";

test("arrow keys move between tabs and wrap around", () => {
  assert.equal(nextTabIndex(0, "ArrowRight", 3), 1);
  assert.equal(nextTabIndex(2, "ArrowRight", 3), 0);
  assert.equal(nextTabIndex(0, "ArrowLeft", 3), 2);
});

test("Home and End jump to the first and last tab", () => {
  assert.equal(nextTabIndex(1, "Home", 3), 0);
  assert.equal(nextTabIndex(1, "End", 3), 2);
});

test("other keys are left alone", () => {
  assert.equal(nextTabIndex(1, "Enter", 3), null);
  assert.equal(nextTabIndex(1, "a", 3), null);
});
