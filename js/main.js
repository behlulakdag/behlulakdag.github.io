// Entry point: each feature lives in its own module and is started here.
import { initI18n, t, getLanguage } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initTerminal } from "./terminal.js";
import { initReveal } from "./reveal.js";
import { initFilter } from "./filter.js";
import { initCardVideos } from "./card-video.js";
import { initGitHub } from "./github.js";

// Language first, so every feature below starts with the right labels
await initI18n();

initTheme(t);
initTerminal(() => t("terminal.script"));
initReveal();
initFilter(t);
initCardVideos();
initGitHub(t, getLanguage);
