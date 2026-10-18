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

function applyTheme(theme, toggleButton) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  if (toggleButton) {
    const isLight = theme === "light";
    toggleButton.setAttribute("aria-pressed", String(isLight));
    toggleButton.setAttribute("aria-label", isLight ? "Karanlık temaya geç" : "Aydınlık temaya geç");
  }
}

export function initTheme() {
  const toggleButton = document.querySelector("[data-theme-toggle]");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(resolveInitialTheme(readStoredTheme(), prefersLight), toggleButton);

  toggleButton?.addEventListener("click", () => {
    const theme = nextTheme(document.documentElement.dataset.theme);
    applyTheme(theme, toggleButton);
    saveTheme(theme);
  });
}
