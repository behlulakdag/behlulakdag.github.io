// Slides sections up softly as they scroll into view.

export const REVEAL_SELECTOR = [
  ".section-title",
  ".section-lead",
  ".about__photo",
  ".about__text",
  ".project-grid > li",
  ".service-card",
  ".services__cta",
  ".contact__intro",
  ".contact-form",
].join(", ");

const STAGGER_STEP_MS = 80;
const MAX_STAGGERED_ITEMS = 4;

// Items in the same row come in one after another, but the wait never grows past a few steps.
export function staggerDelay(indexAmongSiblings) {
  return Math.min(indexAmongSiblings, MAX_STAGGERED_ITEMS) * STAGGER_STEP_MS;
}

export function initReveal() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const elements = document.querySelectorAll(REVEAL_SELECTOR);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // reveal once, then stop watching
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
  );

  for (const element of elements) {
    const siblings = [...element.parentElement.children];
    element.style.setProperty("--reveal-delay", `${staggerDelay(siblings.indexOf(element))}ms`);
    observer.observe(element);
  }

  // Hiding starts only now that the observer is in place, so a failed script never leaves content invisible
  document.documentElement.classList.add("reveal-ready");
}
