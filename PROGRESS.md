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

- Hover video: Build a Chef trailer (Roblox game page preview video) cut to a 10s muted loop, `assets/video/build-a-chef.{webm,mp4}` (~750/860 KB). Desktop only, created on first hover — zero bytes on page load. Behlül decided the other two games don't need videos.
- Lighthouse after video: still 100 ×4 on mobile and desktop; page weight 261 KB (mobile).
- Note: Brave left the trailer download as an unfinished `.tmp` in Downloads (`79455518-...tmp`); safe to delete.

## 2026-10-18 — Session 1 (cont.): Phase 3 — cafe demo

**Done**
- `demos/kafe/`: "Demlik", fictional third-wave café in Kadıköy (Behlül picked the brand and illustration style).
  - Self-contained: own `variables.css` + `style.css` (reset included), shares only the font files.
  - Hand-drawn inline SVGs (cup hero, pour-over, map) colored from CSS variables; steam animation off with reduced motion.
  - Menu tabs (WAI-ARIA tabs, arrow/Home/End keys); without JS all three categories show side by side.
  - "Örnek çalışma" banner on top + footer note; address/phone marked as representative; `noindex` so it never competes with a real café.
- Portfolio card #06 (`data-category="web"`) → "Web siteleri" filter now appears automatically.
- Tests: 22 passing (`npm test`).
- Lighthouse (live): home 100 ×4; cafe 100 / 100 / 100 / SEO 60 — the 60 is only the intentional `noindex`.

## 2026-10-18 — Session 1 (cont.): Phase 3 — barber demo

**Done**
- `demos/berber/`: "Ustura", fictional classic barber in Beşiktaş (Behlül picked the brand). Oswald signage font added.
  - SVG hero: spinning barber pole (stripes animate, off with reduced motion), straight razor, round "1987" seal with text on a circle.
  - Services price list, three barbers with monogram badges (no faces), hours, representative address.
  - Appointment form (`js/booking.js`): time slots from opening hours and service length, Monday closed, today's past slots hidden (30 min lead), max 30 days ahead, Turkish mobile number validation, inline errors with `aria-invalid`, focus to first error. Submit shows a summary + explicit "demo, nothing was sent" note; nothing leaves the browser.
  - Header keeps only the "Randevu" button under 420px (320px overflowed before the fix).
- Portfolio card #07. Tests: 34 passing.
- Lighthouse (live): home 100 ×4; barber 100 / 100 / 100 / SEO 60 (intentional `noindex`).

**Known gap**
- Desktop project grid: last row has two demo cards and one empty slot until the spor salonu demo.

**Next step**
- Phase 3: demo 3 (spor salonu, membership packages), then TR/EN switch and live GitHub section.
