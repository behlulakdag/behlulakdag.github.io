import { test } from "node:test";
import assert from "node:assert/strict";
import { staggerDelay, REVEAL_SELECTOR } from "../js/reveal.js";

test("staggerDelay grows with position", () => {
  assert.equal(staggerDelay(0), 0);
  assert.equal(staggerDelay(1), 80);
  assert.equal(staggerDelay(3), 240);
});

test("staggerDelay is capped so late items don't wait forever", () => {
  assert.equal(staggerDelay(4), staggerDelay(20));
});

test("the hero is never hidden by the reveal effect", () => {
  // Hiding the hero would delay the largest paint and hurt Lighthouse
  assert.doesNotMatch(REVEAL_SELECTOR, /hero|terminal/);
});
