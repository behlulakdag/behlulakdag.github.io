// TR / EN switch. Turkish is written in the HTML (for search engines and no-JS visitors);
// every translatable element carries a key into lang/tr.json and lang/en.json.
//   data-i18n="key"            → textContent
//   data-i18n-html="key"       → innerHTML (only for our own JSON with inline markup)
//   data-i18n-attr="attr:key;…" → attributes such as alt, aria-label, title, value

export const SUPPORTED_LANGUAGES = ["tr", "en"];
export const DEFAULT_LANGUAGE = "tr";
export const LANGUAGE_STORAGE_KEY = "lang";

// Priority: a choice the visitor made before → ?lang= in the link → browser language → Turkish.
export function pickLanguage({ stored, query, browserLanguages = [] }) {
  if (SUPPORTED_LANGUAGES.includes(stored)) return stored;
  if (SUPPORTED_LANGUAGES.includes(query)) return query;
  for (const tag of browserLanguages) {
    const base = String(tag).toLowerCase().split("-")[0];
    if (SUPPORTED_LANGUAGES.includes(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

export function otherLanguage(lang) {
  return lang === "tr" ? "en" : "tr";
}

export function lookup(dictionary, key) {
  return key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

export function format(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match));
}

// "alt:projects.liftlogAlt;title:x.y" → [["alt", "projects.liftlogAlt"], ["title", "x.y"]]
export function parseAttrSpec(spec) {
  return spec
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const separator = pair.indexOf(":");
      return [pair.slice(0, separator).trim(), pair.slice(separator + 1).trim()];
    });
}

/* ---------- Browser side ---------- */

let currentLanguage = DEFAULT_LANGUAGE;
let currentDictionary = null;
const dictionaryCache = new Map();

export function t(key, values) {
  if (!currentDictionary) return undefined;
  const value = lookup(currentDictionary, key);
  return typeof value === "string" ? format(value, values) : value;
}

export function getLanguage() {
  return currentLanguage;
}

async function loadDictionary(lang) {
  if (!dictionaryCache.has(lang)) {
    // URL is relative to this module, so it works from any page depth
    const url = new URL(`../lang/${lang}.json`, import.meta.url);
    dictionaryCache.set(
      lang,
      fetch(url).then((response) => {
        if (!response.ok) throw new Error(`${url} → ${response.status}`);
        return response.json();
      }),
    );
  }
  return dictionaryCache.get(lang);
}

function applyDictionary(dictionary, lang) {
  for (const element of document.querySelectorAll("[data-i18n]")) {
    const value = lookup(dictionary, element.dataset.i18n);
    if (typeof value === "string") element.textContent = value;
  }
  for (const element of document.querySelectorAll("[data-i18n-html]")) {
    const value = lookup(dictionary, element.dataset.i18nHtml);
    if (typeof value === "string") element.innerHTML = value;
  }
  for (const element of document.querySelectorAll("[data-i18n-attr]")) {
    for (const [attribute, key] of parseAttrSpec(element.dataset.i18nAttr)) {
      const value = lookup(dictionary, key);
      if (typeof value === "string") element.setAttribute(attribute, value);
    }
  }

  document.documentElement.lang = lang;
  document.title = dictionary.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", dictionary.meta.description);

  const toggle = document.querySelector("[data-lang-toggle]");
  if (toggle) {
    const target = otherLanguage(lang);
    toggle.textContent = target.toUpperCase();
    toggle.lang = target;
    toggle.setAttribute("aria-label", dictionary.lang.switchLabel);
  }
}

export async function setLanguage(lang, { save = true } = {}) {
  const dictionary = await loadDictionary(lang);
  currentLanguage = lang;
  currentDictionary = dictionary;
  applyDictionary(dictionary, lang);
  if (save) {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // storage blocked: the switch still works for this visit
    }
  }
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

// Resolves once the starting language is applied. If the JSON can't be loaded the page simply stays Turkish.
export async function initI18n() {
  let stored = null;
  try {
    stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // ignore
  }
  const lang = pickLanguage({
    stored,
    query: new URLSearchParams(location.search).get("lang"),
    browserLanguages: navigator.languages ?? [navigator.language],
  });

  try {
    // Only an explicit choice is remembered; browser-detected language is re-checked next visit
    await setLanguage(lang, { save: Boolean(stored) });
  } catch (error) {
    console.warn("Translations could not be loaded; staying in Turkish.", error);
    return false;
  } finally {
    // The head script hides the page for English visitors until this point
    document.documentElement.classList.remove("i18n-pending");
  }

  const toggle = document.querySelector("[data-lang-toggle]");
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      setLanguage(otherLanguage(currentLanguage)).catch((error) => console.warn(error));
    });
  }
  return true;
}
