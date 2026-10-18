// Menu category tabs (WAI-ARIA tabs pattern). Without JavaScript all categories stay visible side by side.

// Arrow keys wrap around; Home/End jump to the ends. Returns null for keys the tabs don't handle.
export function nextTabIndex(currentIndex, key, tabCount) {
  switch (key) {
    case "ArrowRight":
      return (currentIndex + 1) % tabCount;
    case "ArrowLeft":
      return (currentIndex - 1 + tabCount) % tabCount;
    case "Home":
      return 0;
    case "End":
      return tabCount - 1;
    default:
      return null;
  }
}

export function initMenuTabs() {
  const tablist = document.querySelector("[data-menu-tabs]");
  const panels = [...document.querySelectorAll("[data-menu-panel]")];
  if (!tablist || panels.length < 2) return;

  const tabs = panels.map((panel) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "menu-tab";
    tab.id = `${panel.id}-tab`;
    tab.role = "tab";
    tab.textContent = panel.querySelector(".menu-panel__title").textContent;
    tab.setAttribute("aria-controls", panel.id);
    tablist.append(tab);

    panel.role = "tabpanel";
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
    return tab;
  });

  function select(index, { moveFocus = false } = {}) {
    tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute("aria-selected", String(isSelected));
      // Roving tabindex: only the selected tab is in the Tab order, arrows move between tabs
      tab.tabIndex = isSelected ? 0 : -1;
      panels[i].hidden = !isSelected;
    });
    if (moveFocus) tabs[index].focus();
  }

  tablist.addEventListener("click", (event) => {
    const index = tabs.indexOf(event.target.closest(".menu-tab"));
    if (index !== -1) select(index);
  });

  tablist.addEventListener("keydown", (event) => {
    const next = nextTabIndex(tabs.indexOf(document.activeElement), event.key, tabs.length);
    if (next === null) return;
    event.preventDefault();
    select(next, { moveFocus: true });
  });

  select(0);
  tablist.hidden = false;
  tablist.closest(".menu").classList.add("has-tabs");
}

if (typeof document !== "undefined") initMenuTabs();
