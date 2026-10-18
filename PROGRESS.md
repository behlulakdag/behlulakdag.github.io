# Progress

## 2026-10-18 — Session 1: setup and content gathering

**Done**
- Tooling verified: Git, GitHub CLI, VS Code, Live Server all installed.
- GitHub username changed `KedyliCali` → `behlulakdag` (display name: Behlül Akdağ). Site will live at `behlulakdag.github.io`.
- Profile photo pulled from Fiverr → `assets/img/profile.webp` (480px, WebP).
- Decision: Claude writes the code, short explanations only. Goal: complete the whole PLAN.md.

**Collected content**

| Item | Link |
| --- | --- |
| LiftLog | https://github.com/behlulakdag/liftlog (local: `C:\Users\virus-pc\Desktop\liftlog`) |
| To-Do (JavaFX) | https://github.com/behlulakdag/to-do-list |
| Roblox: Smash for Eggs | https://www.roblox.com/games/76963129106581/Smash-for-Eggs |
| Roblox: Build a Chef | https://www.roblox.com/games/99828445522100/Build-a-Chef |
| Roblox: Garbage King | https://www.roblox.com/games/95207961242884/GARBAGE-KING (code: https://github.com/behlulakdag/garbage-king-showcase) |
| Fiverr | https://www.fiverr.com/behlul_akdag |
| Upwork | https://www.upwork.com/freelancers/~01e754c0666160751d |
| LinkedIn | https://www.linkedin.com/in/behlulakdag/ |

**Plan changes**
- Roblox cards: the three games above replace "ULTRAKILL-style FPS" and "BrickSmash" from PLAN.md.

## 2026-10-18 — Session 1 (cont.): Phase 1 built and live

**Done**
- Repo `behlulakdag/behlulakdag.github.io` created; site live at https://behlulakdag.github.io/
- `index.html`: header, hero terminal (static), about, 5 project cards, services, contact form, footer.
- CSS split into `fonts.css`, `variables.css`, `base.css`, `sections.css`; mobile first, 640px and 960px breakpoints.
- Images: Roblox thumbnails from the Roblox thumbnails API, LiftLog cover composed from `liftlog/docs/screenshots`, profile photo cropped from `Downloads/behlul2.png` (watermark removed). All WebP.
- Fonts self-hosted (latin + latin-ext woff2) — mobile Lighthouse went 81 → 99–100.
- Lighthouse on live site: mobile 99–100 / 100 / 100 / 100, desktop 100 / 100 / 100 / 100.
- Checked at 375px and 1366px: no horizontal scroll, no broken images, no console errors.

**Still needed from Behlül**
- Formspree account + form ID → replace `YOUR_FORM_ID` in `index.html` (form doesn't send until then).
- Add https://behlulakdag.github.io/ to Fiverr and Upwork profiles (Phase 1 gate).
- Optional: a real To-Do app screenshot (card currently uses a code-style cover).

## 2026-10-18 — Session 1 (cont.): Phase 2 interactions

**Done**
- JS split into ES modules (`js/main.js` → `theme.js`, `terminal.js`, `reveal.js`, `filter.js`).
- Theme toggle: saved in localStorage, falls back to OS setting; inline head script prevents a wrong-theme flash.
- Terminal typing: static HTML is the no-JS / reduced-motion fallback; height locked so no layout shift; click skips.
- Scroll reveal: IntersectionObserver, staggered; hiding class is added by JS only (safe if JS fails), off with reduced motion.
- Project filter: buttons generated from card categories; aria-pressed + live result count.
- Header fixed for 320–375px phones (no horizontal scroll).
- Unit tests: `npm test` (Node built-in runner), 15 passing. One test keeps the terminal fallback text and JS script in sync.
- Live Lighthouse: mobile 100/100/100/100 (LCP 1.3s, CLS 0.011), desktop 100 across the board.

**Still open from Phase 2**
- Roblox gameplay GIF/video on card hover — needs 10–15s gameplay clips from Behlül.

**Next step**
- Phase 3: three demo business sites (kafe, berber, spor salonu), TR/EN switch, live GitHub section.
