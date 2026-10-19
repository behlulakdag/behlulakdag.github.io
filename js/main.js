// Entry point: each feature lives in its own module and is started here.
import { initI18n, t, getLanguage, setLanguage } from "./i18n.js";
import { initTheme } from "./theme.js";
import { initTerminal } from "./terminal.js";
import { initReveal } from "./reveal.js";
import { initFilter } from "./filter.js";
import { initCardVideos } from "./card-video.js";
import { initGitHub } from "./github.js";
import { initHeroModel } from "./hero-model.js";
import { initNavigation } from "./navigation.js";

// Language first, so every feature below starts with the right labels
await initI18n();

// The terminal's `projects` command reads the cards on the page, so it never goes out of date
const getProjects = () =>
  [...document.querySelectorAll(".project-card")].map((card) => ({
    title: card.querySelector(".project-card__title").textContent.trim(),
    kind: card.querySelector(".project-card__kind").textContent.trim(),
    href: card.querySelector(".project-card__links a")?.getAttribute("href") ?? "#projects",
  }));

initTheme(t);
initTerminal(() => t("terminal.script"), { translate: t, getLanguage, setLanguage, getProjects });
initReveal();
initFilter(t);
initCardVideos();
initGitHub(t, getLanguage);
initHeroModel();
initNavigation(t);
