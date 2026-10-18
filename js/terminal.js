// Hero terminal: types each command letter by letter, then prints its output.
// The finished text is already in index.html, so visitors without JS (or with reduced motion) see it as-is.

export const TERMINAL_SCRIPT = [
  { command: "whoami", output: ["Behlül Akdağ", "Yazılım geliştirici · Web tasarımcı"] },
  { command: "ls skills/", output: ["java  kotlin  luau  html  css  javascript"] },
  { command: "status", output: [{ text: "● staj ve freelance işlere açık", accent: true }] },
];

const TIMING = {
  startDelay: 500,
  perCharacter: 55,
  afterCommand: 350,
  perOutputLine: 90,
  betweenBlocks: 450,
};

// Flattens the script into the lines the terminal shows, with a blank line between blocks.
export function scriptToLines(script) {
  const lines = [];
  script.forEach((block, index) => {
    if (index > 0) lines.push({ kind: "blank", text: "" });
    lines.push({ kind: "command", text: block.command });
    for (const output of block.output) {
      const isObject = typeof output === "object";
      lines.push({ kind: "output", text: isObject ? output.text : output, accent: isObject && output.accent });
    }
  });
  return lines;
}

// Plain text of the finished terminal, prompts included — what index.html must contain.
export function linesToPlainText(lines) {
  return lines.map((line) => (line.kind === "command" ? `> ${line.text}` : line.text)).join("\n");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function appendLine(container, line) {
  const row = document.createElement("span");
  if (line.kind === "command") {
    const prompt = document.createElement("span");
    prompt.className = "terminal__prompt";
    prompt.textContent = "> ";
    row.append(prompt);
  }
  if (line.accent) row.classList.add("text-accent");
  container.append(row);
  return row;
}

export function initTerminal() {
  const code = document.querySelector("[data-terminal-output]");
  if (!code) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const body = code.closest(".terminal__body");
  // Lock the height of the finished text so typing never shifts the layout
  body.style.minHeight = `${body.offsetHeight}px`;
  const finishedMarkup = code.innerHTML;
  let skipped = false;

  const cursor = document.createElement("span");
  cursor.className = "terminal__cursor";
  cursor.setAttribute("aria-hidden", "true");

  // Clicking the terminal skips straight to the end
  body.addEventListener(
    "click",
    () => {
      skipped = true;
      code.innerHTML = finishedMarkup;
      code.append(cursor);
    },
    { once: true },
  );

  async function play() {
    code.textContent = "";
    code.append(cursor);
    await sleep(TIMING.startDelay);

    const lines = scriptToLines(TERMINAL_SCRIPT);
    for (const [index, line] of lines.entries()) {
      if (skipped) return;
      // Newline goes before each line (not after) so the cursor ends on the last line, matching the fallback height
      if (index > 0) code.insertBefore(document.createTextNode("\n"), cursor);
      if (line.kind === "blank") {
        await sleep(TIMING.betweenBlocks);
        continue;
      }

      const row = appendLine(code, line);
      code.insertBefore(row, cursor);

      if (line.kind === "command") {
        const typed = document.createTextNode("");
        row.append(typed);
        for (const character of line.text) {
          if (skipped) return;
          typed.data += character;
          // Slight jitter makes the typing feel human rather than mechanical
          await sleep(TIMING.perCharacter + Math.random() * 40);
        }
        await sleep(TIMING.afterCommand);
      } else {
        row.append(line.text);
        await sleep(TIMING.perOutputLine);
      }
    }
  }

  play();
}
