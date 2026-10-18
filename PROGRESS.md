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

## 2026-10-18 — Session 1 (cont.): Phase 3 — gym demo

**Done**
- `demos/spor-salonu/`: "Demir Atölyesi", fictional power gym in Ataşehir (Behlül picked the brand and asked for both interactions).
  - SVG hero: power rack with a barbell loaded in competition plate colors, chalk bowl, "PR 272,5 kg" sticker; hazard-stripe borders.
  - Membership calculator (`js/membership.js`): monthly / 3-month (−10%) / yearly (−25%), student −20% on eligible plans (not coaching), per-month rounded to 10 ₺, shows period total and saving. Native radios/checkbox styled as segmented control and switch.
  - Weekly schedule (`js/schedule.js`): day tabs (opens on today, Sunday → Monday), level filter where "Her seviye" classes match every level, empty-state message, live status text. Without JS the full week shows as a 3-column board.
- Fixed: hero highlight block covered the line above on phones; beginner badge contrast (green lightened to #36975a).
- Portfolio card #08 — desktop grid is now three full rows (software · games · demos).
- Tests: 44 passing.
- Lighthouse (live): home 100 ×4; gym 100 / 100 / 100 / SEO 60 (intentional `noindex`).

## 2026-10-18 — Session 1 (cont.): Phase 3 — TR / EN

**Done**
- `lang/tr.json` + `lang/en.json` (same keys), `js/i18n.js`. Turkish stays written in the HTML; 93 elements carry `data-i18n` / `data-i18n-html` / `data-i18n-attr` keys.
- Language choice: saved choice > `?lang=en` link > browser language > Turkish. Only a button click is saved; the link and browser language are re-checked each visit.
- Square language button next to the theme button shows the target language ("EN" / "TR"). Header becomes two rows under 480px.
- Terminal script, filter labels, result count and theme button label all follow the `languagechange` event. Contact form topics now send stable values (`website-quote`, `internship-job`, `other`) whatever the language.
- English visitors: head script hides the page until `en.json` is applied (preloaded, 1.5s safety timeout) → no visible swap. Lighthouse en-US mobile CLS 0.093 → 0.
- Demo sites stay Turkish only (they are Turkish businesses).
- Tests: 61 passing. New checks: same keys in both JSON files, every HTML key exists, Turkish HTML text and attributes match `tr.json`, terminal fallback matches `tr.json`.
- Lighthouse (live): TR mobile 99/100/100/100, EN mobile 98/100/100/100 (LCP 2.1s, CLS 0), EN desktop 100 ×4.

**For Behlül**
- Use `https://behlulakdag.github.io/?lang=en` on Upwork so clients land on English.
- English copy was written by Claude — read it once and adjust anything that doesn't sound like you.

## 2026-10-18 — Session 1 (cont.): Phase 3 — live GitHub section

**Done**
- `js/github.js` + section `#github` (04, between Services and Contact; Contact is now 05).
  - GitHub REST API `users/behlulakdag/repos`: forks, archived and private repos dropped, newest push first, max 6 cards (4 today).
  - Card: name (whole card clickable), description, language dot (GitHub colors as `--lang-*` tokens), stars only when > 0, "3 gün önce güncellendi" via `Intl.RelativeTimeFormat` (follows TR/EN).
  - Language bar + legend from repos' primary languages.
  - Request starts only when the section is within 600px of the viewport; response cached in sessionStorage for 10 minutes (60 calls/hour limit). Skeleton cards reserve space; error state hides cards and points to the profile link. No JS → profile link only.
- Tests: 68 passing (repo selection, language shares, slugs, relative time in TR and EN).
- Lighthouse (live): TR mobile 100 ×4, EN mobile 99/100/100/100, TR desktop 100 ×4; no GitHub request during page load.

**For Behlül**
- `to-do-list` has no description on GitHub, so its card says "Açıklama henüz eklenmedi." Add one on GitHub (repo page → ⚙ next to About) and the card updates by itself.

**Phase 3 status**
- All tasks done. Gate is yours: put the demo screenshots (`assets/img/projects/demlik.webp`, `ustura.webp`, `demir-atolyesi.webp`) into your Fiverr gigs.

## 2026-10-18 — Session 1 (cont.): Phase 4 — 3D barbell

**Done**
- `tools/blender/barbell.py` builds the model headless (Blender 5.2, `--background --factory-startup`): competition plates in real sizes/colours (25 red → 2.5 black) with lip + hub profile, collars with green knobs, two stands with green cradles, wood/rubber platform with green lines. Joined into one mesh, 12 materials, ~6.5k faces.
- `assets/models/barbell.glb`: 527 KB raw → 110 KB with `gltf-transform optimize --compress meshopt`.
- `assets/img/barbell.webp` (7 KB, transparent): rendered with the web viewer's exact camera (FOV, direction, distance, frame offset) so the static image and live model line up; a test checks the Blender and JS camera constants match.
- `js/hero-model.js`: Three.js 0.170.0 via import map (jsDelivr). Desktop only (≥960px, mouse, no data saver, WebGL). Starts on the visitor's first mouse move / scroll / key, then idle; draggable (OrbitControls, no zoom/pan), slow auto-rotate (off with reduced motion), pauses off-screen. Phones always show the static render.
- Layout: model box sits behind the terminal's top-right corner (layers: model < dashed panel < window < chips); hero clips overflow. og-image refreshed.
- Tests: 77 passing.
- Lighthouse (live): TR desktop 100 ×4 (TBT 0), TR mobile 99/100/100/100, EN mobile 98/100/100/100; no 3D requests during page load.

**Next step**
- Phase 4: terminal secret commands (`help`, `projects`, `gym`, easter egg).
- Later (Behlül): custom domain purchase, LiftLog APK link when it ships.
