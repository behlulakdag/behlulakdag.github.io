import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { shouldLoadModel, fitDistance, MIN_WIDTH } from "../js/hero-model.js";

const desktop = { viewportWidth: 1366, finePointer: true, saveData: false, webgl: true };

test("loads on a normal desktop", () => {
  assert.equal(shouldLoadModel(desktop), true);
});

test("skipped below the desktop width", () => {
  assert.equal(shouldLoadModel({ ...desktop, viewportWidth: MIN_WIDTH - 1 }), false);
});

test("skipped on touch screens, data saver or without WebGL", () => {
  assert.equal(shouldLoadModel({ ...desktop, finePointer: false }), false);
  assert.equal(shouldLoadModel({ ...desktop, saveData: true }), false);
  assert.equal(shouldLoadModel({ ...desktop, webgl: false }), false);
});

test("fitDistance: a 1 m half-width fills a square 90° view at about 1 m", () => {
  assert.ok(Math.abs(fitDistance(1, 90, 1, 1) - 1) < 1e-9);
});

test("fitDistance: a wide canvas lets the camera come closer than a tall one", () => {
  const wide = fitDistance(1.2, 28, 2.2);
  const tall = fitDistance(1.2, 28, 0.6);
  assert.ok(wide < tall, `wide ${wide} should be < tall ${tall}`);
});

test("the GLB stays small enough for the web", async () => {
  const glb = await readFile(new URL("../assets/models/barbell.glb", import.meta.url));
  assert.equal(glb.subarray(0, 4).toString(), "glTF", "not a binary glTF file");
  assert.ok(glb.length < 200 * 1024, `barbell.glb is ${Math.round(glb.length / 1024)} KB`);
});

test("Three.js is pinned to one exact version in the import map", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const versions = new Set([...html.matchAll(/three@([\d.]+)/g)].map((m) => m[1]));
  assert.equal(versions.size, 1, `found versions: ${[...versions].join(", ")}`);
  assert.match([...versions][0], /^\d+\.\d+\.\d+$/);
});
