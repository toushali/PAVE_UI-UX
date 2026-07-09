# PAVE Patient App — Build Plan

> **Source:** `pave_ui.md` (PAVE Patient App PWA UI Build Spec).
> **Deliverable:** Clickable static HTML + CSS prototype. No backend, no framework. Vanilla JS only for tab nav, expand/collapse, done toggles, and the exercise timer. Mock data inline, consistent across screens.
> **Target:** Mobile-first, ~390px width, light mode only, adults 60–85 (large everything, one hero action per screen).

This plan splits the work into **10 sessions**. Each session is self-contained, ends with something openable in a browser, and builds on the shared layer from Session 1. Follow the spec's Build Order (Section 8): foundation → core loop → progress → auth → supporting.

---

## Ground rules (apply to every session)

- **Never hardcode** colors, spacing, radii, or font sizes — use the tokens from `tokens.css` (Section 4). If a value isn't a token, add it as a token first.
- **Respect hard constraints** (Section 1 / Section 10): no video, no chat (use "Call the office"), no password, no dark mode, no streak-freeze, no points store, no real API. Tap targets ≥ 48px, primary buttons 56–64px, body text ≥ 18px.
- **Every screen** links the same 3 CSS files (`tokens.css`, `base.css`, `components.css`) + `app.js`, and inherits the app shell.
- **Motion:** fade-and-rise on mount, scale-pulse on success; always honor `prefers-reduced-motion` (opacity-only fallback).
- **Mock data (keep identical everywhere):** patient "John", physician "Dr. Stillman", 4-modality plan (Pilates · Mobility · Strengthening · Breathing), 12-day streak, sample badges/milestones.
- **End-of-session check:** open the new screen(s) in a browser at 390px, run the relevant Accessibility checklist items (Section 9), confirm bottom tab bar + shell render correctly.

---

## Session 1 — Foundation: design system + app shell

**Goal:** Lock the shared layer so every later screen is pure assembly. Nothing screen-specific ships yet except scaffolding.

**Build:**
1. Create the full folder structure (Section 7): `css/`, `js/`, `assets/{icons,illustrations,plant}/`, `auth/`, `app/`, `index.html`, `README.md`.
2. `css/tokens.css` — all `:root` custom properties from Section 4 (color, typography, spacing, radius, shadow, tap targets, motion). Include the `.text-lg` scaling class on `<html>` (~+15%).
3. `css/base.css` — reset, humanist sans stack, base typography (18px min body), app-shell layout: fixed top bar + scrollable capped content (`--content-max`) + fixed bottom tab bar. Mount fade-and-rise animation + reduced-motion guard.
4. `css/components.css` — **app shell** and **bottom tab bar** (4 tabs: Today · Exercises · Progress · Rewards, icon + text, active state).
5. `js/app.js` — skeleton: tab navigation highlighting, and empty hooks for expand/collapse, done-toggles, timer (filled in later sessions).
6. `assets/icons/` — inline-able SVGs: 4 tab icons, phone, check, mic, gear, back.
7. `index.html` → redirect/link to `auth/splash.html`.

**Done when:** a placeholder screen using the shell renders the top bar + tab bar correctly at 390px, tab switching visibly changes the active tab.

---

## Session 2 — `today.html` (reference screen) + finalize core components

**Goal:** Build Today end-to-end as the screen that proves the design system, and complete the remaining reusable components it needs (Section 8, Phase A step 2).

**Build in `components.css`:** Primary button (+ sticky variant), secondary/ghost button, Card, Stat block, **Plant/streak SVG** (4–5 growth stages: sprout → leaves → small plant → flowering) in `assets/plant/`.

**Build `app/today.html`** (Section 6, screen 5):
1. Top bar: "Good morning, John" + date + gear (→ Settings).
2. Hero check-in card — large circular "Go" button "Do today's check-in"; state-aware (undone = gentle pulse; done = green check + "See you tomorrow.").
3. Streak block with growing-plant SVG + "12-day streak."
4. "Your plan today" mini checklist preview (tap → Exercises).
5. Accountability line: "Dr. Stillman can see your updates."

Wire the undone ↔ done states as a JS toggle for demo purposes.

**Done when:** Today looks warm and polished, both check-in states demo-able, plant SVG renders, links to Exercises/Settings work.

---

## Session 3 — `checkin.html` (highest priority screen)

**Goal:** The billable daily check-in — fastest, clearest path in the app (Section 6, screen 6). Single scrollable page.

**Build in `components.css`:** **Face/segment pain scale** (0–10, large tappable, `--c-pain-0 → 10` ramp, selected value shown large), **pill toggle group** (Better/Same/Worse, single-select), **checklist row** (`.is-done` scale-pulse + soft green fill).

**Build `app/checkin.html`:**
1. Title "How are you today?"
2. Pain scale 0–10.
3. "Exercises completed today" — big checklist rows.
4. "Compared to yesterday" — Better / Same / Worse pills.
5. "Add a note for your doctor (optional)" — collapsed, expands to textarea + big mic (voice-to-text) button.
6. Sticky primary button "Submit today's check-in."

**States:** default (empty), partially filled (submit stays enabled — forgiving), **already-submitted** friendly done-state ("You've checked in today ✓ — come back tomorrow"), never an error. Auto-save draft in memory (JS). Submit → Confirmation.

**Done when:** all inputs interactive, all three states demo-able, submit navigates to `confirmation.html`.

---

## Session 4 — `confirmation.html` (full-screen celebration overlay)

**Goal:** Reward the check-in and close the loop (Section 6, screen 7).

**Build in `components.css`:** **Badge tile** (earned = full color + date; locked = grayscale + hint) and **toast/confirmation banner** (slide from top, auto-dismiss ~4s) — reused later in Rewards.

**Build `app/confirmation.html`** as a full-screen overlay:
- Big check → "Your doctor can see your update." → plant grows a leaf (animation) → points tick +10 → optional badge/milestone reveal (dignified, gentle confetti in `--c-celebrate`) → "Come back tomorrow" + next reminder time → big "Done" button (→ Today).
- Sound OFF by default. Respect reduced-motion (drop transforms, keep opacity).

**Done when:** the full celebration sequence plays, reduced-motion fallback verified, "Done" returns to Today. **This completes the core billable loop** (Today → Check-In → Confirmation).

---

## Session 5 — `exercises.html` + `exercise-detail.html` (with timer)

**Goal:** The exercise plan browse + the deliberate no-video exercise experience (Section 6, screens 8–9; Phase B step 4).

**Build in `components.css`:** **Call-the-office button** (phone icon + "Call the office"), exercise card, static line-illustration icons per modality in `assets/illustrations/`.

**Build `app/exercises.html`:**
- Sections by modality (Pilates · Mobility · Strengthening · Breathing). Each exercise = big card: name, one plain-language line, frequency ("2× today"), completion tick, static icon.
- To-do vs done-today states (soft green + check). Read-only — no edit affordances.
- "Have questions? Call the office" line at the bottom (no chat).
- Tap a card → Exercise Detail slides up.

**Build `app/exercise-detail.html`** (slide-up sheet):
- Exercise name → static illustration → "What this helps" one-liner → large numbered steps → **built-in timer**: big countdown ring (e.g. "Hold 15s") with start/pause + optional gentle end-chime → big "Mark as done" (syncs to today's check-in).
- Timer logic in `app.js`. Make it feel premium and hand-held.

**Done when:** plan browses correctly, detail slides up, timer counts down with start/pause, "Mark as done" reflects back to the checklist state.

---

## Session 6 — `progress.html`

**Goal:** "How am I doing?" — reassuring, never alarming (Section 6, screen 10; Phase C).

**Build:**
1. **Streak calendar** — month grid, big cells, checkmarked days, today highlighted; missed days neutral/uncolored (never red).
2. **Adherence ring** — big % in a friendly ring + plain language ("You've checked in 24 of 30 days — great going.").
3. **Pain trend** — big directional sentence ("Your pain is trending down") + simple this-week-vs-last-week bar. Directional and reassuring, not a clinical chart.

All copy positive-only. Reuse Stat block; build the calendar grid and ring as new (token-driven) components in `components.css`.

**Done when:** calendar, ring, and trend all render at 390px with mock data; no red/alarming states anywhere.

---

## Session 7 — `rewards.html`

**Goal:** Motivate via badges, points, milestones — warm and dignified, never childish (Section 6, screen 11; Phase C).

**Build in `components.css`:** **Milestone/journey path** (vertical stepper, next milestone highlighted).

**Build `app/rewards.html`:**
1. **Points total** — big, framed as "progress points" (no redemption/store).
2. **Badge gallery** — grid of badge tiles (reuse Session 4 component); earned = full color + date, locked = grayscale + "how to earn."
3. **Milestone journey** — vertical stepper (First week → First month → Pain down 20/40/60%), next highlighted ("2 days to your 14-day badge!").
4. *Phase-2 (only if core screens complete):* "Share my progress" card.

Reuse the plant motif to tie Today / Confirmation / Rewards together.

**Done when:** points, badge grid (earned + locked), and milestone path all render; naming is dignified. **This completes screens 5–11 (the priority set).**

---

## Session 8 — Auth entry: `splash.html`, `login.html`, `verify.html`

**Goal:** Passwordless entry flow (Section 6, screens 1–3; Phase D). No password fields anywhere.

**Build `auth/splash.html`:** Centered logo + "Healthcare. Simplified." tagline → install card showing iOS "Share → Add to Home Screen" steps with icons + small toggle to preview Android steps → "Continue" → Login.

**Build `auth/login.html`:** Title "Welcome to PAVE" → one large field "Enter your email or phone" → giant "Send my link" → caption "No password to remember, ever." States: default, "link sent" (big check + "Check your phone/email"), resend.

**Build `auth/verify.html`:** Title "Enter your code" → 6 large single-digit boxes with auto-advance (JS) → "Resend code" ghost button → subtle "Why am I doing this?" help link. → Onboarding.

**Done when:** splash → login → verify → onboarding path clicks through; no password field exists; auto-advance works.

---

## Session 9 — `onboarding.html` + `settings.html`

**Goal:** Trust/identity/reminder setup and reminder controls (Section 6, screens 4 & 12; Phase D/E). Both use the reminder time control and the large-text toggle.

**Build `auth/onboarding.html`:**
1. Trust card — physician photo + "Your recovery plan from Dr. Stillman." (mock).
2. Up to 3 skippable welcome cards (dot indicators): *your plan · check in each day · watch your progress grow.*
3. Confirm details — pre-filled name + contact, single "Yes, that's me."
4. **Large-text toggle** (wires the `.text-lg` class from Session 1).
5. **Pick daily reminder time** — big time control.

**Build `app/settings.html`:** Big daily-reminder time picker → channel toggle (SMS / Email) → streak-nudge on/off → large-text toggle → high-contrast toggle. ~4–5 controls, back to Today.

**Done when:** large-text toggle visibly scales the whole app from both screens; time picker + toggles interactive; onboarding → Today completes.

---

## Session 10 — Supporting states + final QA pass

**Goal:** Finish the supporting screens and validate the whole prototype (Section 6, screens 13–15; Phase E + Section 9 audit).

**Build in `components.css`:** **Offline banner** (full-width, non-alarming, "We'll save your check-in and send it when you're back.").

**Build:**
- `app/help.html` — short FAQ ("How do I check in?", "I forgot to check in yesterday", "How do I install the app?") as big expandable rows (reuse expand/collapse) → prominent "Call the office" button at top and bottom.
- `auth/session-expired.html` — friendly "Let's get you back in" → email/phone field → "Send my link." Never a scary tone.
- `app/offline.html` — full-screen fallback (reassuring copy + retry) + wire the offline banner component into the shell.

**Final QA (run the Section 9 checklist on every screen):**
- Body text ≥ 18px, nothing below 16px; tap targets ≥ 48px; primary buttons 56–64px.
- Text contrast ≥ 4.5:1; bottom nav always visible; no icon-only actions.
- Large-text mode + `prefers-reduced-motion` work everywhere.
- No red/shaming states; "Call the office" present wherever chat would be expected; voice input on the doctor-note field.
- Confirm none of the Section 10 forbidden items exist (video, chat, password, dark mode, streak-freeze, points store, real API).
- Verify mock data (John, Dr. Stillman, 12-day streak, 4-modality plan, badges) is consistent across all screens.

**Finalize `README.md`:** screen → file map, "static prototype, no backend" note, mock-data notes, how to open (`index.html`).

**Done when:** all 15 screens open and interlink, the accessibility checklist passes, and the README is complete.

---

## Session → screen map

| Session | Screens / deliverables | Phase |
| --- | --- | --- |
| 1 | Tokens, base, shell, tab bar, JS skeleton, structure | A |
| 2 | `today.html` + core components | A |
| 3 | `checkin.html` | B |
| 4 | `confirmation.html` | B |
| 5 | `exercises.html`, `exercise-detail.html` (timer) | B |
| 6 | `progress.html` | C |
| 7 | `rewards.html` | C |
| 8 | `splash.html`, `login.html`, `verify.html` | D |
| 9 | `onboarding.html`, `settings.html` | D/E |
| 10 | `help.html`, `session-expired.html`, `offline.html` + QA + README | E |

**Priority note:** Sessions 1–7 deliver the priority screens (1–11 core, minus auth). If time is constrained, ship through Session 7 first; auth and supporting states (8–10) can follow.
