// Live GitHub section: latest public repositories and a language bar, fetched from the GitHub REST API.
// The request starts only when the section comes near the viewport, and the answer is cached for 10 minutes
// because unauthenticated calls are limited to 60 per hour per visitor.

export const GITHUB_USER = "behlulakdag";
export const MAX_REPOS = 6;
const CACHE_KEY = "github-repos";
const CACHE_TTL_MS = 10 * 60 * 1000;

// Public, original, still-maintained work only; most recently pushed first.
export function selectRepos(repos, limit = MAX_REPOS) {
  return repos
    .filter((repo) => !repo.fork && !repo.archived && !repo.private)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, limit);
}

// Share of repos per primary language, biggest first. Repos without a detected language are skipped.
export function languageShares(repos) {
  const counts = new Map();
  for (const repo of repos) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return [...counts.entries()]
    .map(([language, count]) => ({ language, count, percent: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));
}

// "Kotlin" → "kotlin", "C++" → "c-plus-plus", "Jupyter Notebook" → "jupyter-notebook"; used for CSS color tokens.
export function languageSlug(language) {
  return language
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/#/g, "-sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const UNITS = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

// "3 gün önce" / "3 days ago", using the browser's built-in translations.
export function relativeTime(date, now, lang) {
  const seconds = (new Date(date) - now) / 1000;
  const format = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, "minute");
}

/* ---------- Browser side ---------- */

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) return cached.repos;
  } catch {
    // no cache or storage blocked
  }
  return null;
}

function writeCache(repos) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // fine, we just fetch again next time
  }
}

async function fetchRepos() {
  const cached = readCache();
  if (cached) return cached;
  const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=30`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  // Keep only the fields we show, so the cache stays small
  const repos = (await response.json()).map(
    ({ name, html_url, description, language, stargazers_count, pushed_at, fork, archived, private: isPrivate }) => ({
      name,
      html_url,
      description,
      language,
      stargazers_count,
      pushed_at,
      fork,
      archived,
      private: isPrivate,
    }),
  );
  writeCache(repos);
  return repos;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function languageDot(language) {
  const dot = element("span", "lang-dot");
  dot.setAttribute("aria-hidden", "true");
  dot.style.setProperty("--dot-color", `var(--lang-${languageSlug(language)}, var(--lang-other))`);
  return dot;
}

function renderRepos(list, repos, translate, lang) {
  const now = new Date();
  list.replaceChildren(
    ...repos.map((repo) => {
      const item = element("li", "repo");

      const title = element("h3", "repo__name");
      const link = element("a", null, repo.name);
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener";
      title.append(link);

      const description = element("p", "repo__desc", repo.description || translate("github.noDescription"));
      if (!repo.description) description.classList.add("repo__desc--empty");

      const meta = element("p", "repo__meta");
      if (repo.language) {
        const language = element("span", "repo__lang");
        language.append(languageDot(repo.language), repo.language);
        meta.append(language);
      }
      // "★ 0" reads as an empty shelf, so the count only appears once a repo has stars
      if (repo.stargazers_count > 0) {
        const stars = element("span", "repo__stars", `★ ${repo.stargazers_count}`);
        stars.setAttribute("aria-label", translate("github.stars", { count: repo.stargazers_count }));
        meta.append(stars);
      }
      const updated = element("time", "repo__updated", translate("github.updated", { time: relativeTime(repo.pushed_at, now, lang) }));
      updated.dateTime = repo.pushed_at;
      meta.append(updated);

      item.append(title, description, meta);
      return item;
    }),
  );
}

function renderLanguages(container, shares, translate) {
  const bar = element("div", "lang-bar");
  bar.setAttribute("role", "img");
  bar.setAttribute(
    "aria-label",
    `${translate("github.languagesTitle")}: ${shares.map((share) => `${share.language} %${share.percent}`).join(", ")}`,
  );
  const legend = element("ul", "lang-legend");
  for (const share of shares) {
    const segment = element("span", "lang-bar__segment");
    segment.style.flexGrow = share.count;
    segment.style.setProperty("--dot-color", `var(--lang-${languageSlug(share.language)}, var(--lang-other))`);
    bar.append(segment);

    const item = element("li");
    item.append(languageDot(share.language), `${share.language} `, element("span", "lang-legend__percent", `${share.percent}%`));
    legend.append(item);
  }
  container.replaceChildren(bar, legend);
}

// Turkish fallbacks, used only if lang/*.json could not be loaded
const FALLBACK_TEXT = {
  "github.noDescription": "Açıklama henüz eklenmedi.",
  "github.updated": "{time} güncellendi",
  "github.stars": "{count} yıldız",
  "github.languagesTitle": "Depolarda kullanılan diller",
  "github.error": "GitHub'a şu an ulaşılamadı. Depolarıma aşağıdaki linkten doğrudan bakabilirsin.",
};

// `translateFn(key, values)` comes from i18n.js; `getLanguage()` returns "tr" or "en".
export function initGitHub(translateFn = () => undefined, getLanguage = () => "tr") {
  const translate = (key, values = {}) =>
    translateFn(key, values) ?? FALLBACK_TEXT[key].replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  const section = document.querySelector("[data-github]");
  if (!section) return;
  const list = section.querySelector("[data-github-repos]");
  const languages = section.querySelector("[data-github-languages]");
  const status = section.querySelector("[data-github-status]");
  let selected = null;

  function render() {
    if (!selected) return;
    renderRepos(list, selected, translate, getLanguage());
    renderLanguages(languages, languageShares(selected), translate);
  }

  async function load() {
    section.classList.add("is-loading");
    try {
      selected = selectRepos(await fetchRepos());
      render();
      section.classList.add("is-loaded");
    } catch (error) {
      console.warn("GitHub repos could not be loaded.", error);
      list.replaceChildren();
      status.dataset.state = "error";
      status.textContent = translate("github.error");
      section.classList.add("has-error");
    } finally {
      section.classList.remove("is-loading");
    }
  }

  document.addEventListener("languagechange", () => {
    render();
    if (status.dataset.state === "error") status.textContent = translate("github.error");
  });

  // Fetch only when the section is about to scroll into view
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      load();
    },
    { rootMargin: "600px 0px" },
  );
  observer.observe(section);
}
