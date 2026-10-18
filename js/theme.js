// Dark / light theme toggle. The choice is saved in localStorage and restored on the next visit.

export const THEME_STORAGE_KEY = "theme";
const THEME_COLORS = { dark: "#0e1116", light: "#f7f7f5" };

// A saved choice wins; otherwise follow the operating system setting.
export function resolveInitialTheme(storedTheme, systemPrefersLight) {
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return systemPrefersLight ? "light" : "dark";
}

export function nextTheme(currentTheme) {
  return currentTheme === "light" ? "dark" : "light";
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode, strict settings)
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Not saving is fine; the toggle still works for this visit.
  }
}

// Turkish fallbacks, used only if lang/*.json could not be loaded
const FALLBACK_LABELS = { toLight: "Aydınlık temaya geç", toDark: "Karanlık temaya geç" };

// `translate(key)` returns the current language's string, or undefined to fall back to Turkish.
export function initTheme(translate = () => undefined) {
  const toggleButton = document.querySelector("[data-theme-toggle]");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
    if (!toggleButton) return;
    const isLight = theme === "light";
    const labelKey = isLight ? "toDark" : "toLight";
    toggleButton.setAttribute("aria-pressed", String(isLight));
    toggleButton.setAttribute("aria-label", translate(`theme.${labelKey}`) ?? FALLBACK_LABELS[labelKey]);
  }

  applyTheme(resolveInitialTheme(readStoredTheme(), prefersLight));

  toggleButton?.addEventListener("click", () => {
    const theme = nextTheme(document.documentElement.dataset.theme);
    applyTheme(theme);
    saveTheme(theme);
  });

  document.addEventListener("languagechange", () => applyTheme(document.documentElement.dataset.theme));
}
