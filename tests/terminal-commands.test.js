import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  runCommand,
  parseInput,
  completeCommand,
  VISIBLE_COMMANDS,
  HIDDEN_COMMANDS,
  recordLines,
} from "../js/terminal-commands.js";
import { lookup, format } from "../js/i18n.js";

const dictionaries = {
  tr: JSON.parse(await readFile(new URL("../lang/tr.json", import.meta.url), "utf8")),
  en: JSON.parse(await readFile(new URL("../lang/en.json", import.meta.url), "utf8")),
};
const translator = (lang) => (key, values) => {
  const value = lookup(dictionaries[lang], key);
  return typeof value === "string" ? format(value, values) : value;
};
const projects = [
  { title: "LiftLog", kind: "Mobile", href: "https://github.com/behlulakdag/liftlog" },
  { title: "Demlik", kind: "Website", href: "demos/kafe/" },
];
const run = (input, lang = "tr") => runCommand(input, { t: translator(lang), projects, lang });
const text = (line) => (typeof line === "string" ? line : line.text);

test("parseInput trims, lowercases the name and splits arguments", () => {
  assert.deepEqual(parseInput("  LANG   en "), { name: "lang", args: ["en"] });
  assert.deepEqual(parseInput(""), { name: "", args: [] });
});

test("help lists every visible command and none of the hidden ones", () => {
  const output = run("help").lines.map(text).join("\n");
  for (const command of VISIBLE_COMMANDS) assert.match(output, new RegExp(`\\b${command}\\b`));
  for (const command of HIDDEN_COMMANDS) assert.doesNotMatch(output, new RegExp(`\\b${command}\\b`));
});

test("every command has a translated, non-empty output in both languages", () => {
  for (const lang of ["tr", "en"]) {
    for (const command of [...VISIBLE_COMMANDS, ...HIDDEN_COMMANDS]) {
      for (const line of run(command, lang).lines) {
        assert.equal(typeof text(line), "string", `${lang}/${command}`);
        assert.ok(text(line).trim(), `${lang}/${command} printed an empty line`);
        assert.doesNotMatch(text(line), /undefined|terminal\.cmd/, `${lang}/${command}: ${text(line)}`);
      }
    }
  }
});

test("projects prints one linked line per card, numbered", () => {
  const lines = run("projects").lines.filter((line) => line.href);
  assert.equal(lines.length, 2);
  assert.match(lines[0].text, /01\s+LiftLog/);
  assert.equal(lines[1].href, "demos/kafe/");
});

test("actions: gym spins the model, contact and sudo scroll, theme toggles, clear clears", () => {
  assert.deepEqual(run("gym").action, { type: "spin-model" });
  assert.deepEqual(run("contact").action, { type: "scroll", target: "#contact" });
  assert.deepEqual(run("sudo make me a website").action, { type: "scroll", target: "#contact" });
  assert.deepEqual(run("theme").action, { type: "toggle-theme" });
  assert.deepEqual(run("clear"), { lines: [], action: { type: "clear" } });
  assert.deepEqual(run("matrix").action, { type: "matrix" });
});

test("gym prints the three lifts and their total, aligned", () => {
  const lines = run("gym").lines.map(text);
  assert.ok(lines.includes("  Squat       140 kg"), lines.join("\n"));
  assert.ok(lines.includes("  Bench       110 kg"));
  assert.ok(lines.includes("  Deadlift    190 kg"));
  assert.ok(lines.includes("  Toplam      440 kg"));
  assert.ok(run("gym", "en").lines.map(text).includes("  Total       440 kg"));
});

test("recordLines formats decimals per language and sums them", () => {
  const records = [["Squat", 142.5], ["Bench", 100]];
  assert.deepEqual(recordLines(records, "Toplam", "tr"), [
    "  Squat     142,5 kg",
    "  Bench       100 kg",
    "  Toplam    242,5 kg",
  ]);
  assert.equal(recordLines(records, "Total", "en")[2], "  Total     242.5 kg");
});

test("lang toggles, accepts tr/en, rejects anything else", () => {
  assert.deepEqual(run("lang", "tr").action, { type: "set-lang", lang: "en" });
  assert.deepEqual(run("lang tr", "en").action, { type: "set-lang", lang: "tr" });
  const bad = run("lang fr");
  assert.equal(bad.action, undefined);
  assert.match(text(bad.lines[0]), /lang tr/);
});

test("unknown commands get a friendly error naming the command", () => {
  const [line] = run("rm -rf /").lines;
  assert.equal(line.error, true);
  assert.match(line.text, /rm/);
  assert.match(text(run("ls", "en").lines[0]), /command not found: ls/);
});

test("an empty line does nothing", () => {
  assert.deepEqual(run("   "), { lines: [] });
});

test("Tab completes unique commands and shared prefixes, never hidden ones", () => {
  assert.equal(completeCommand("pro"), "projects ");
  assert.equal(completeCommand("c"), "c"); // contact and clear share only "c"
  assert.equal(completeCommand("cl"), "clear ");
  assert.equal(completeCommand("ma"), "ma"); // matrix stays secret
  assert.equal(completeCommand("xyz"), "xyz");
});
