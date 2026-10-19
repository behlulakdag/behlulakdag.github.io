// Hero terminal: types each command letter by letter, then prints its output, then opens a prompt
// where visitors can type their own commands (see terminal-commands.js).
// The Turkish finished text is already in index.html, so visitors without JS see it as-is.
// The script itself comes from lang/*.json (terminal.script), so it follows the TR / EN switch.

import { runCommand, completeCommand } from "./terminal-commands.js";

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

// One printed line from a command: plain text, accent, muted, error, or a link.
function createOutputRow(line) {
  const data = typeof line === "string" ? { text: line } : line;
  const row = document.createElement("span");
  if (data.accent) row.classList.add("text-accent");
  if (data.muted) row.classList.add("terminal__muted");
  if (data.error) row.classList.add("terminal__error");
  if (data.href) {
    const link = document.createElement("a");
    link.href = data.href;
    link.textContent = data.text;
    if (/^https?:/.test(data.href)) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    row.append(link);
  } else {
    row.textContent = data.text;
  }
  return row;
}

/**
 * @param {() => any} getScript - intro script for the current language (undefined if translations failed)
 * @param {object} options
 * @param {(key: string, values?: object) => any} options.translate
 * @param {() => string} options.getLanguage
 * @param {(lang: string) => Promise<void>} options.setLanguage
 * @param {() => Array<{title: string, kind: string, href: string}>} options.getProjects
 */
export function initTerminal(getScript, options = {}) {
  const code = document.querySelector("[data-terminal-output]");
  if (!code) return;
  const body = code.closest(".terminal__body");
  const window_ = body.closest(".terminal__window");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cursor = document.createElement("span");
  cursor.className = "terminal__cursor";
  cursor.setAttribute("aria-hidden", "true");

  // Bumped on every skip or language change; a running animation stops when its run id is stale
  let runId = 0;
  let prompt = null;

  function showFinished() {
    runId += 1;
    const script = getScript();
    if (!script) return;
    renderFinished(code, script);
    if (prompt) return; // the prompt line replaces the block cursor once it exists
    code.append(cursor);
    openPrompt();
  }

  /* ---------- Interactive prompt ---------- */

  function openPrompt() {
    // Without translations every command would print nothing, so the prompt stays closed
    if (prompt || typeof options.translate?.("terminal.cmd.helpIntro") !== "string") return;
    cursor.remove();

    const form = document.createElement("form");
    form.className = "terminal__form";
    form.autocomplete = "off";

    const sign = document.createElement("span");
    sign.className = "terminal__prompt";
    sign.textContent = ">";
    sign.setAttribute("aria-hidden", "true");

    const input = document.createElement("input");
    input.className = "terminal__input";
    input.type = "text";
    input.name = "command";
    input.spellcheck = false;
    input.autocapitalize = "off";
    input.setAttribute("autocorrect", "off");
    input.setAttribute("enterkeyhint", "send");

    // Screen readers hear each command's output here; the visual output lives in the <pre>
    const live = document.createElement("p");
    live.className = "visually-hidden";
    live.setAttribute("aria-live", "polite");

    form.append(sign, input, live);
    body.after(form);
    window_.classList.add("is-interactive");

    const history = [];
    let historyIndex = 0;

    function label() {
      input.placeholder = options.translate("terminal.promptPlaceholder") ?? "help";
      input.setAttribute("aria-label", options.translate("terminal.promptLabel") ?? "Terminal");
    }
    label();
    document.addEventListener("languagechange", label);

    function print(raw, lines) {
      const echo = createRow({ kind: "command" });
      echo.append(raw.trim());
      code.append("\n\n", echo);
      for (const line of lines) code.append("\n", createOutputRow(line));
      live.textContent = lines.map((line) => (typeof line === "string" ? line : line.text)).join(". ");
      body.scrollTop = body.scrollHeight;
    }

    async function perform(action) {
      if (!action) return;
      switch (action.type) {
        case "clear":
          code.replaceChildren();
          live.textContent = "";
          break;
        case "scroll":
          document.querySelector(action.target)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
          break;
        case "toggle-theme":
          document.querySelector("[data-theme-toggle]")?.click();
          break;
        case "set-lang":
          // languagechange re-renders the intro text, which also clears earlier command output
          await options.setLanguage?.(action.lang);
          break;
        case "spin-model":
          document.dispatchEvent(new CustomEvent("hero-model:spin"));
          break;
        case "matrix":
          if (!prefersReducedMotion) playMatrix(window_);
          break;
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const raw = input.value;
      input.value = "";
      if (raw.trim()) {
        history.push(raw);
        historyIndex = history.length;
      }
      const result = runCommand(raw, {
        t: options.translate,
        projects: options.getProjects?.() ?? [],
        lang: options.getLanguage?.() ?? "tr",
      });
      if (raw.trim() && result.action?.type !== "clear") print(raw, result.lines);
      await perform(result.action);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" && history.length) {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex];
      } else if (event.key === "ArrowDown" && history.length) {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = history[historyIndex] ?? "";
      } else if (event.key === "Tab" && input.value.trim()) {
        // Only hijack Tab when there is something to complete, so keyboard users can still tab out
        const completed = completeCommand(input.value);
        if (completed !== input.value) {
          event.preventDefault();
          input.value = completed;
        }
      }
    });

    // Clicking anywhere in the terminal (except a link or selected text) puts the caret in the prompt
    body.addEventListener("click", (event) => {
      if (event.target.closest("a") || String(window.getSelection())) return;
      input.focus({ preventScroll: true });
    });

    prompt = { input };
  }

  /* ---------- Intro animation ---------- */

  // A language switch replaces the text straight away rather than retyping it
  document.addEventListener("languagechange", () => {
    body.style.minHeight = "";
    showFinished();
  });

  const script = getScript();
  if (!script || prefersReducedMotion) {
    if (script) {
      renderFinished(code, script);
      openPrompt();
    }
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
    if (!stale()) openPrompt();
  }

  play(runId);
}

/* ---------- The surprise: `matrix` ---------- */

// Green characters rain over the terminal window for a few seconds, then fade away.
function playMatrix(container) {
  if (container.querySelector(".terminal__matrix")) return;
  const canvas = document.createElement("canvas");
  canvas.className = "terminal__matrix";
  canvas.setAttribute("aria-hidden", "true");
  container.append(canvas);

  const { width, height } = container.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio, 2);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);

  const fontSize = 14;
  const columns = Math.ceil(width / fontSize);
  const drops = Array.from({ length: columns }, () => Math.random() * -20);
  const glyphs = "アカサタナハマヤラワ0123456789BEHLÜLAKDAĞ<>/{}";
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#3fb950";
  const background = getComputedStyle(document.documentElement).getPropertyValue("--color-surface").trim() || "#161b22";
  const DURATION = 4200;
  const start = performance.now();

  function frame(now) {
    // Translucent fill leaves fading trails behind each falling character
    context.globalAlpha = 0.18;
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.globalAlpha = 1;
    context.fillStyle = accent;
    context.font = `${fontSize}px ${getComputedStyle(document.body).getPropertyValue("--font-mono") || "monospace"}`;
    drops.forEach((y, column) => {
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      context.fillText(glyph, column * fontSize, y * fontSize);
      drops[column] = y * fontSize > height && Math.random() > 0.96 ? 0 : y + 1;
    });

    if (now - start < DURATION) {
      requestAnimationFrame(frame);
    } else {
      canvas.classList.add("is-fading");
      canvas.addEventListener("transitionend", () => canvas.remove(), { once: true });
      setTimeout(() => canvas.remove(), 800); // in case transitions are disabled
    }
  }
  requestAnimationFrame(frame);
}
