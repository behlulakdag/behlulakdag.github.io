import { test } from "node:test";
import assert from "node:assert/strict";
import { activeSectionId, shouldShowBackToTop } from "../js/navigation.js";

const sections = (...tops) => tops.map((top, index) => ({ id: `s${index}`, top }));

test("nothing is active while the hero is on screen (no section reached yet)", () => {
  assert.equal(activeSectionId(sections(400, 900, 1500), 200), null);
});

test("the last section whose top passed the reading line is active", () => {
  assert.equal(activeSectionId(sections(-600, 150, 900), 200), "s1");
  assert.equal(activeSectionId(sections(-1600, -900, -100), 200), "s2");
});

test("a section exactly on the reading line counts as reached", () => {
  assert.equal(activeSectionId(sections(200, 700), 200), "s0");
});

test("back-to-top appears only after more than a screen of scrolling", () => {
  assert.equal(shouldShowBackToTop(0, 800), false);
  assert.equal(shouldShowBackToTop(900, 800), false);
  assert.equal(shouldShowBackToTop(1000, 800), true);
});
