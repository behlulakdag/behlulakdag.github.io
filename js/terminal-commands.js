// Commands for the interactive hero terminal. Pure: given the typed text and a little context,
// return the lines to print and an optional action for terminal.js to carry out.
// Command names stay English in both languages (it's a shell); their output is translated.

// Shown by `help`, in this order
export const VISIBLE_COMMANDS = ["help", "whoami", "projects", "gym", "contact", "theme", "lang", "clear"];
// Work, but are left out of `help` on purpose — the surprise
export const HIDDEN_COMMANDS = ["matrix", "sudo"];

const ALL_COMMANDS = [...VISIBLE_COMMANDS, ...HIDDEN_COMMANDS];

// Behlül's competition-lift personal records in kg. Update here when a new PR lands; the total is computed.
export const PERSONAL_RECORDS = [
  ["Squat", 140],
  ["Bench", 110],
  ["Deadlift", 190],
];

export function recordLines(records, totalLabel, lang) {
  const number = new Intl.NumberFormat(lang === "en" ? "en-US" : "tr-TR", { maximumFractionDigits: 1 });
  const total = records.reduce((sum, [, kg]) => sum + kg, 0);
  const row = (label, kg) => `  ${label.padEnd(10)}${number.format(kg).padStart(5)} kg`;
  return [...records.map(([lift, kg]) => row(lift, kg)), row(totalLabel, total)];
}

export const BARBELL_ART = [
  "  ▐█▌▐▌                    ▐▌▐█▌",
  "▐▌▐█▌▐▌════════════════════▐▌▐█▌▐▌",
  "  ▐█▌▐▌                    ▐▌▐█▌",
];

export function parseInput(raw) {
  const [name = "", ...args] = raw.trim().split(/\s+/).filter(Boolean);
  return { name: name.toLowerCase(), args };
}

// Tab completion: the single matching command, or the longest prefix all matches share.
// Hidden commands are never suggested.
export function completeCommand(partial) {
  const text = partial.trim().toLowerCase();
  if (!text || text.includes(" ")) return partial;
  const matches = VISIBLE_COMMANDS.filter((command) => command.startsWith(text));
  if (matches.length === 0) return partial;
  if (matches.length === 1) return `${matches[0]} `;
  let prefix = matches[0];
  for (const match of matches) {
    while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix.length > text.length ? prefix : partial;
}

const asLines = (value) => (Array.isArray(value) ? value : value == null ? [] : [value]);

/**
 * @param {string} raw - what the visitor typed
 * @param {object} context
 * @param {(key: string, values?: object) => any} context.t - translation lookup
 * @param {{title: string, kind: string, href: string}[]} context.projects - cards on the page
 * @param {string} context.lang - current language, "tr" or "en"
 * @returns {{lines: Array<string|object>, action?: object}}
 */
export function runCommand(raw, { t, projects = [], lang = "tr" }) {
  const { name, args } = parseInput(raw);

  switch (name) {
    case "":
      return { lines: [] };

    case "help":
      return {
        lines: [
          t("terminal.cmd.helpIntro"),
          ...VISIBLE_COMMANDS.map((command) => ({
            text: `  ${command.padEnd(10)}${t(`terminal.cmd.desc.${command}`)}`,
          })),
          { text: t("terminal.cmd.helpSecret"), muted: true },
        ],
      };

    case "whoami":
      return { lines: asLines(t("terminal.cmd.whoami")) };

    case "projects":
      return {
        lines: [
          ...projects.map((project, index) => ({
            text: `  ${String(index + 1).padStart(2, "0")}  ${project.title} · ${project.kind}`,
            href: project.href,
          })),
          { text: t("terminal.cmd.projectsHint"), muted: true },
        ],
      };

    case "gym":
      return {
        lines: [
          ...BARBELL_ART.map((text) => ({ text, accent: true })),
          t("terminal.cmd.gymRecords"),
          ...recordLines(PERSONAL_RECORDS, t("terminal.cmd.gymTotal"), lang).map((text, index, all) => ({
            text,
            accent: index === all.length - 1, // the total stands out
          })),
          ...asLines(t("terminal.cmd.gym")),
          { text: "github.com/behlulakdag/liftlog", href: "https://github.com/behlulakdag/liftlog" },
        ],
        action: { type: "spin-model" },
      };

    case "contact":
      return {
        lines: [
          t("terminal.cmd.contact"),
          { text: "  linkedin  /in/behlulakdag", href: "https://www.linkedin.com/in/behlulakdag/" },
          { text: "  github    behlulakdag", href: "https://github.com/behlulakdag" },
          { text: "  fiverr    behlul_akdag", href: "https://www.fiverr.com/behlul_akdag" },
        ],
        action: { type: "scroll", target: "#contact" },
      };

    case "theme":
      return { lines: [t("terminal.cmd.theme")], action: { type: "toggle-theme" } };

    case "lang": {
      const requested = args[0]?.toLowerCase();
      if (requested && requested !== "tr" && requested !== "en") {
        return { lines: [t("terminal.cmd.langUsage")] };
      }
      const target = requested ?? (lang === "tr" ? "en" : "tr");
      return { lines: [], action: { type: "set-lang", lang: target } };
    }

    case "clear":
      return { lines: [], action: { type: "clear" } };

    case "matrix":
      return { lines: asLines(t("terminal.cmd.matrix")).map((text) => ({ text, accent: true })), action: { type: "matrix" } };

    case "sudo":
      return { lines: asLines(t("terminal.cmd.sudo")), action: { type: "scroll", target: "#contact" } };

    default:
      return { lines: [{ text: t("terminal.cmd.notFound", { name }), error: true }] };
  }
}

export function isKnownCommand(name) {
  return ALL_COMMANDS.includes(name);
}
