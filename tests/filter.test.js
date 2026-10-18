import { test } from "node:test";
import assert from "node:assert/strict";
import { availableFilters, matchesFilter, resultLabel } from "../js/filter.js";

test("availableFilters lists only categories that have cards, in a fixed order", () => {
  assert.deepEqual(availableFilters(["game", "software", "game"]), ["all", "software", "game"]);
});

test("availableFilters adds web once demo cards exist", () => {
  assert.deepEqual(availableFilters(["web", "software", "game"]), ["all", "software", "game", "web"]);
});

test("availableFilters ignores unknown or missing categories", () => {
  assert.deepEqual(availableFilters(["game", undefined, "music"]), ["all", "game"]);
});

test("matchesFilter: 'all' shows everything, otherwise exact category", () => {
  assert.equal(matchesFilter("game", "all"), true);
  assert.equal(matchesFilter("game", "game"), true);
  assert.equal(matchesFilter("software", "game"), false);
});

test("resultLabel reads naturally in Turkish by default", () => {
  assert.equal(resultLabel(3), "3 proje gösteriliyor");
});

test("resultLabel uses the translated template when given", () => {
  assert.equal(resultLabel(3, "Showing {count} projects"), "Showing 3 projects");
});
