// Hero terminal: types each command letter by letter, then prints its output.
// The Turkish finished text is already in index.html, so visitors without JS see it as-is.
// The script itself comes from lang/*.json (terminal.script), so it follows the TR / EN switch.

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

// Plain text of the finished terminal, prompts included — what index.html must contain for Turkish.
export function linesToPlainText(lines) {
  return lines.map((line) => (line.kind === "command" ? `> ${line.text}` : line.text)).join("\n");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createRow(line) {
  const row = document.createElement("span");
  if (line.kind === "command") {
    const prompt = document.createElement("span");
    prompt.className = "terminal__prompt";
    prompt.textContent = "> ";
    row.append(prompt);
  }
  if (line.accent) row.classList.add("text-accent");
  return row;
}

function renderFinished(code, script) {
  code.replaceChildren();
  scriptToLines(script).forEach((line, index) => {
    if (index > 0) code.append("\n");
    if (line.kind === "blank") return;
    const row = createRow(line);
    row.append(line.text);
    code.append(row);
  });
}

// `getScript` returns the script for the current language (or undefined if translations failed to load).
export function initTerminal(getScript) {
  const code = document.querySelector("[data-terminal-output]");
  if (!code) return;
  const body = code.closest(".terminal__body");

  const cursor = document.createElement("span");
  cursor.className = "terminal__cursor";
  cursor.setAttribute("aria-hidden", "true");

  // Bumped on every skip or language change; a running animation stops when its run id is stale
  let runId = 0;

  function showFinished() {
    runId += 1;
    const script = getScript();
    if (!script) return;
    renderFinished(code, script);
    code.append(cursor);
  }

  // A language switch replaces the text straight away rather than retyping it
  document.addEventListener("languagechange", () => {
    body.style.minHeight = "";
    showFinished();
  });

  const script = getScript();
  if (!script || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (script) renderFinished(code, script);
    return;
  }

  // Render the finished text once to measure it, then lock that height so typing never shifts the layout
  renderFinished(code, script);
  body.style.minHeight = `${body.offsetHeight}px`;

  body.addEventListener("click", showFinished, { once: true });

  async function play(myRun) {
    const stale = () => myRun !== runId;
    code.replaceChildren(cursor);
    await sleep(TIMING.startDelay);

    for (const [index, line] of scriptToLines(script).entries()) {
      if (stale()) return;
      // Newline goes before each line (not after) so the cursor ends on the last line, matching the final height
      if (index > 0) code.insertBefore(document.createTextNode("\n"), cursor);
      if (line.kind === "blank") {
        await sleep(TIMING.betweenBlocks);
        continue;
      }

      const row = createRow(line);
      code.insertBefore(row, cursor);

      if (line.kind === "command") {
        const typed = document.createTextNode("");
        row.append(typed);
        for (const character of line.text) {
          if (stale()) return;
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

  play(runId);
}
