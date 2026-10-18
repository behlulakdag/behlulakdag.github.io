import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { scriptToLines, linesToPlainText } from "../js/terminal.js";

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));

test("scriptToLines puts a blank line between blocks only", () => {
  const lines = scriptToLines([
    { command: "a", output: ["1"] },
    { command: "b", output: [{ text: "2", accent: true }] },
  ]);
  assert.deepEqual(
    lines.map((line) => line.kind),
    ["command", "output", "blank", "command", "output"],
  );
  assert.equal(lines.at(-1).accent, true);
});

test("linesToPlainText adds the prompt to commands", () => {
  const text = linesToPlainText(scriptToLines([{ command: "whoami", output: ["me"] }]));
  assert.equal(text, "> whoami\nme");
});

// The no-JS fallback in index.html and the Turkish script in tr.json must say the same thing.
test("index.html fallback text matches the Turkish terminal script", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const tr = await readJson("../lang/tr.json");
  const block = html.match(/<code data-terminal-output>([\s\S]*?)<\/code>/);
  assert.ok(block, "terminal <code data-terminal-output> not found in index.html");
  const fallbackText = block[1]
    .replace(/<[^>]+>/g, "")
    .replaceAll("&gt;", ">")
    .trim();
  assert.equal(fallbackText, linesToPlainText(scriptToLines(tr.terminal.script)));
});

test("English terminal script has the same commands as Turkish", async () => {
  const tr = await readJson("../lang/tr.json");
  const en = await readJson("../lang/en.json");
  assert.deepEqual(
    en.terminal.script.map((block) => block.command),
    tr.terminal.script.map((block) => block.command),
  );
});
