// Project filter: category buttons above the grid show only the matching cards.
// Buttons are built from the categories the cards actually have, so "Web siteleri" appears once demo cards exist.

export const FILTER_LABELS = {
  all: "Tümü",
  software: "Yazılım",
  game: "Oyun",
  web: "Web siteleri",
};

export function availableFilters(cardCategories) {
  const present = new Set(cardCategories);
  return ["all", ...Object.keys(FILTER_LABELS).filter((key) => key !== "all" && present.has(key))];
}

export function matchesFilter(cardCategory, activeFilter) {
  return activeFilter === "all" || cardCategory === activeFilter;
}

export function resultLabel(count) {
  return `${count} proje gösteriliyor`;
}

export function initFilter() {
  const bar = document.querySelector("[data-filter-bar]");
  const status = document.querySelector("[data-filter-status]");
  const items = [...document.querySelectorAll(".project-grid > li")];
  if (!bar || items.length === 0) return;

  const categoryOf = (item) => item.querySelector("[data-category]")?.dataset.category;
  const filters = availableFilters(items.map(categoryOf));
  if (filters.length < 3) return; // "Tümü" plus a single category would filter nothing

  const buttons = filters.map((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = FILTER_LABELS[filter];
    button.dataset.filter = filter;
    button.setAttribute("aria-pressed", String(filter === "all"));
    bar.append(button);
    return button;
  });

  bar.hidden = false;

  bar.addEventListener("click", (event) => {
    const clicked = event.target.closest(".filter-button");
    if (!clicked) return;
    const activeFilter = clicked.dataset.filter;

    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button === clicked));
    }

    let shown = 0;
    for (const item of items) {
      const isMatch = matchesFilter(categoryOf(item), activeFilter);
      item.hidden = !isMatch;
      if (isMatch) {
        shown += 1;
        // Restart the entry animation on every filter change
        item.classList.remove("is-filtered-in");
        void item.offsetWidth;
        item.classList.add("is-filtered-in");
      }
    }

    if (status) status.textContent = resultLabel(shown);
  });
}
