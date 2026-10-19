// Scroll helpers: highlight the menu link of the section you're reading, and a "back to top" button.

// The section whose top has passed the reading line wins; above the first one, nothing is active.
// `sections` are in page order: [{ id, top }] with `top` relative to the viewport.
export function activeSectionId(sections, readingLine) {
  let active = null;
  for (const section of sections) {
    if (section.top <= readingLine) active = section.id;
  }
  return active;
}

// Show the button once the visitor is more than a screen and a bit down the page.
export function shouldShowBackToTop(scrollY, viewportHeight) {
  return scrollY > viewportHeight * 1.2;
}

const FALLBACK_LABEL = "Başa dön";

export function initNavigation(translate = () => undefined) {
  const links = [...document.querySelectorAll(".site-nav__list a[href^='#']")];
  // Every section is tracked (not only those with a menu link), so reading About or GitHub clears the highlight
  const sections = [...document.querySelectorAll("main section[id]")];
  const header = document.querySelector(".site-header");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.hidden = true;
  button.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>';
  const label = () => button.setAttribute("aria-label", translate("header.backToTop") ?? FALLBACK_LABEL);
  label();
  document.addEventListener("languagechange", label);
  document.body.append(button);

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    // Keyboard users land back at the start of the page, not on a button that is about to disappear
    document.querySelector(".brand")?.focus({ preventScroll: true });
  });

  let scheduled = false;
  function update() {
    scheduled = false;
    const readingLine = (header?.offsetHeight ?? 64) + window.innerHeight * 0.25;
    const activeId = activeSectionId(
      sections.map((section) => ({ id: section.id, top: section.getBoundingClientRect().top })),
      readingLine,
    );
    for (const link of links) {
      if (link.getAttribute("href") === `#${activeId}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    button.hidden = !shouldShowBackToTop(window.scrollY, window.innerHeight);
  }

  // At most one update per frame, however fast the scroll events arrive
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}
