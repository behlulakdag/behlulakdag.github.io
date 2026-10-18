import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldEnablePreview } from "../js/card-video.js";

const desktop = { canHover: true, prefersReducedMotion: false, saveData: false };

test("plays on a normal desktop", () => {
  assert.equal(shouldEnablePreview(desktop), true);
});

test("skipped on touch screens, which have no hover", () => {
  assert.equal(shouldEnablePreview({ ...desktop, canHover: false }), false);
});

test("skipped when the visitor asked for less motion", () => {
  assert.equal(shouldEnablePreview({ ...desktop, prefersReducedMotion: true }), false);
});

test("skipped in data-saver mode", () => {
  assert.equal(shouldEnablePreview({ ...desktop, saveData: true }), false);
});
