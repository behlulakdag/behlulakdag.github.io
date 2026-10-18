// Weekly class schedule: day tabs plus a level filter. Without JavaScript the whole week is listed.

export const LEVEL_LABELS = {
  all: "Tümü",
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

// Classes marked "open" (every level welcome) show up whatever level is picked.
export function matchesLevel(classLevel, filter) {
  return filter === "all" || classLevel === "open" || classLevel === filter;
}

// The gym runs classes Monday–Saturday. Open on today's tab; on Sunday show Monday.
// Tab index 0 = Monday; Date.getDay() 0 = Sunday.
export function defaultDayIndex(date, dayCount = 6) {
  const mondayBased = (date.getDay() + 6) % 7;
  return mondayBased < dayCount ? mondayBased : 0;
}

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

export function initSchedule() {
  const schedule = document.querySelector("[data-schedule]");
  if (!schedule) return;

  const tablist = schedule.querySelector("[data-day-tabs]");
  const levelBar = schedule.querySelector("[data-level-filter]");
  const status = schedule.querySelector("[data-schedule-status]");
  const days = [...schedule.querySelectorAll("[data-day]")];
  let activeLevel = "all";
  let activeDay = defaultDayIndex(new Date(), days.length);

  const tabs = days.map((day) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "day-tab";
    tab.id = `${day.id}-tab`;
    tab.role = "tab";
    tab.setAttribute("aria-controls", day.id);
    // Short label on the tab ("Pzt"), full day name stays as the panel heading for screen readers
    tab.textContent = day.dataset.short;
    tab.setAttribute("aria-label", day.querySelector(".day__title").textContent);
    tablist.append(tab);

    day.role = "tabpanel";
    day.setAttribute("aria-labelledby", tab.id);
    return tab;
  });

  const levelButtons = Object.entries(LEVEL_LABELS).map(([level, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "level-button";
    button.dataset.level = level;
    button.textContent = label;
    levelBar.append(button);
    return button;
  });

  function render({ moveFocus = false } = {}) {
    tabs.forEach((tab, index) => {
      const isActive = index === activeDay;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      days[index].hidden = !isActive;
    });
    if (moveFocus) tabs[activeDay].focus();

    for (const button of levelButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.level === activeLevel));
    }

    const day = days[activeDay];
    let shown = 0;
    for (const item of day.querySelectorAll("[data-level]")) {
      const visible = matchesLevel(item.dataset.level, activeLevel);
      item.hidden = !visible;
      if (visible) shown += 1;
    }
    day.querySelector("[data-empty]").hidden = shown > 0;
    status.textContent = `${day.querySelector(".day__title").textContent}: ${shown} ders`;
  }

  tablist.addEventListener("click", (event) => {
    const index = tabs.indexOf(event.target.closest(".day-tab"));
    if (index === -1) return;
    activeDay = index;
    render();
  });

  tablist.addEventListener("keydown", (event) => {
    const next = nextTabIndex(tabs.indexOf(document.activeElement), event.key, tabs.length);
    if (next === null) return;
    event.preventDefault();
    activeDay = next;
    render({ moveFocus: true });
  });

  levelBar.addEventListener("click", (event) => {
    const button = event.target.closest(".level-button");
    if (!button) return;
    activeLevel = button.dataset.level;
    render();
  });

  schedule.classList.add("is-interactive");
  tablist.hidden = false;
  levelBar.hidden = false;
  render();
}

if (typeof document !== "undefined") initSchedule();
