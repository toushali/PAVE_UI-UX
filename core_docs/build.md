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

---
---

# PART 2 — Provider Portal (Pro1) — Build Plan (Sessions 11–20)

> **Source:** `FSD Pave …` §6 (Provider Portal feature scope), §5.1 (provider auth), §10.3 (Dr. Brain training), §15.3 (5-tier status), §16.1 & §16.3 (design + interactions), §17.1 (10-page scope). Cross-check `PAVE_-_Delivery_Planner` milestones M2/M4/M5.
> **Deliverable:** The Provider Portal in **two design styles — `pro1/` and `pro2/`** — exactly like the patient app's `v1`/`v2`: *same screens, same elements, same copy; different design system + illustrations.* This Part builds **Pro1** (design style 1) as a self-contained static prototype in `pro1/` — its own `css/`, `js/`, `assets/`, pages — sibling to `v1/` and `v2/`. **Pro2** (design style 2) is Part 3 (Sessions 21–24), a re-skin of Pro1's pages. No backend; vanilla JS only (inline panels, tab switching, table sort/filter, step forms, mock auto-refresh). Mock data, internally consistent.
> **Target:** **Desktop-optimized, 1100px max-width content, light mode only.** Data-dense clinical aesthetic; **monospace for every number/metric/financial value/timestamp**; minimal borders; clean layout; smooth transitions.

The Provider Portal is a **different app** from the patient PWA — it does **not** reuse the phone frame or the patient design system. Pro1 gets its own design system in Session 11; Pro2 gets a second, distinct one in Session 21.

## Toggle integration (client-demo switcher)

The bottom-left "tweaks" toggle becomes a **4-way view switcher** so the client can flip through every prototype from any page:

```
Patient · v1     Patient · v2     Provider · Pro1     Provider · Pro2
```

- Extend the switcher (in each app's `js/app.js`) from a v1⇄v2 path swap into a **small popover menu** listing all four, each linking to that prototype's entry: `v1/app/today.html`, `v2/app/today.html`, `pro1/index.html`, `pro2/index.html`.
- It must render identically (self-styled inline) in all four apps and highlight the current one. (Pro1 ships it as a 3-way menu in Session 11 — Pro2 not built yet — then Session 21 promotes it to 4-way across all apps.)
- Folder layout after both parts:
  ```
  d:\PAVE\
  ├── index.html            → menu / redirect (Patient v1 · v2 · Provider Pro1 · Pro2)
  ├── v1/  v2/              → patient designs (Sessions 1–10)
  ├── pro1/                → provider portal, design style 1 (Sessions 11–20)
  │    ├── index.html  css/  js/  assets/  app/
  └── pro2/                → provider portal, design style 2 (Sessions 21–24)
       ├── index.html  css/  js/  assets/  app/   (same pages as pro1, restyled)
  ```

## Ground rules (apply to every provider session)

- **Self-contained:** every provider page links `pro1/css/{tokens,base,components}.css` + `pro1/js/app.js`; nothing shared with v1/v2.
- **Monospace numbers everywhere** — KPIs, revenue, counts, minutes, timestamps, CPT codes (FSD §16.1). Add a `--font-mono` token; wrap metrics in a `.num` class.
- **Persistent shell on every screen:** fixed **left sidebar nav** (Dashboard · Work Queue · Patients · Approvals · Reports · Revenue · Org Admin · Dr. Brain · Settings) + **top bar** (provider name + credentials, org name, notifications bell, avatar) + main content capped at 1100px.
- **5-tier status badge** (FSD §15.3), reused everywhere: Enrolled = neutral/no badge · On Track = white · Needs Attention = **amber** · Ready to Bill = **green** · Claim Approved = approved indicator. Never red for "needs attention."
- **Motion (FSD §16.3):** fade-and-rise on page mount; inline action panels **slide down/up** (content persists while closing); panel switching on the same row **cross-fades**; different row → old closes first; **status change = scale-pulse**; **Approve = confirmation banner from top, auto-dismiss after 4s**. Honor `prefers-reduced-motion` (opacity-only).
- **Mock data (consistent across provider screens, and with the patient app where they overlap):** provider **Dr. Brandon Stillman, MD**; org **Stillman Rehabilitation Group**; a panel of ~8 patients incl. **John Carter** (M54.5 Low back pain); RTM **CPT 98975–98981**; realistic review-minute / check-in / revenue figures. Timestamps server-style, non-editable in the UI.
- **No real API/auth/PHI** — static prototype. Numbers are mock but must add up within a screen (e.g. KPI totals match the queues).
- **End-of-session check:** open the new screen(s) at ~1280px, confirm sidebar + top bar render, the 3-way toggle switches to v1/v2/provider, and monospace metrics + status badges look right.

---

## Session 11 — Provider foundation: design system + shell + 3-way toggle

**Goal:** Lock the provider design system and the persistent shell so later screens are pure assembly; wire the client-demo toggle.

**Build:**
1. Create `pro1/` structure: `css/`, `js/`, `assets/icons/`, `app/`, `index.html`.
2. `css/tokens.css` — clinical light palette (professional slate/blue primary, clean neutrals, subtle lines), **status colors** (neutral · white · amber · green · approved), `--font-sans` (UI) + **`--font-mono`** (metrics), type scale, spacing (dense), small radii, subtle shadows, `--content-max: 1100px`, motion tokens.
3. `css/base.css` — reset, UI typography, `.num` monospace utility, **app shell**: fixed left sidebar + top bar + scrollable main (1100px), page fade-and-rise + reduced-motion guard.
4. `css/components.css` — **sidebar nav** (icon + label, active state, 9 items), **top bar**, **KPI stat card** (mono big number + label + delta), **5-tier status badge**, primary/secondary/ghost buttons, **confirmation banner** (top, auto-dismiss 4s).
5. `js/app.js` — skeleton: active-nav highlighting, hooks for inline panels / tabs / table sort, and the **3-way view toggle** (popover: Patient v1 · Patient v2 · Provider). Back-port the same 3-way toggle into `v1/js/app.js` and `v2/js/app.js`.
6. `index.html` → provider entry → `app/dashboard.html` (after login in real app).

**Done when:** a placeholder dashboard renders the sidebar + top bar at 1280px, monospace KPI numbers show, and the toggle switches between all three prototypes from any page.

---

## Session 12 — Provider login (OAuth + MFA)

**Goal:** Provider entry — passwordless enterprise sign-in (FSD §5.1). Desktop, centered card.

**Build `app/login.html`:**
1. Branded split/centered layout: PAVE logo + "Provider Portal" + one-line value ("Review your panel and bill RTM in under 15 minutes a day.").
2. **Sign in with Google** and **Sign in with Microsoft** buttons (brand marks). No password field.
3. **MFA step** (second view, toggled): "Enter your 6-digit authenticator code" → 6 mono boxes with auto-advance → "Verify." Note "MFA can't be disabled" reassurance.
4. Session/security footnotes: 15-min inactivity timeout, login events logged (display only).

**Done when:** OAuth buttons → MFA view → Dashboard clicks through; no password anywhere; MFA boxes auto-advance.

---

## Session 13 — Dashboard (FSD §6.1)

**Goal:** The "under 15 minutes a day" hub — highest-value provider screen.

**Build in `components.css`:** **inline action panel** (slide down: Log Review Time / Log Patient Contact / Approve Claim), **work-queue card**, alert banner.

**Build `app/dashboard.html`:**
1. **KPI strip** — 4 mono cards: Active Patients · Ready to Bill · Est. Revenue Available · Claims Pending Approval.
2. **Conditional alert banner** — "3 patients approaching their billing window." (dismissible per session).
3. **Prioritized queues** — **Urgent** (at risk of missing billing window) + **Optimization** (one action unlocks billing). Each card: patient, diagnosis, what's needed, days remaining, status badge, inline action buttons.
4. **Inline action panels** — one open at a time; Log Review Time (mono minute stepper), Log Patient Contact (date), Approve Claim; row resolves + status scale-pulses on completion.
5. **Mock auto-refresh** — "Updated 12s ago" ticker every 60s (JS, cosmetic).

**Done when:** KPIs + both queues render, one inline panel opens at a time and slides, completing an action pulses the status and shows the top confirmation banner.

---

## Session 14 — Work Queue (FSD §6.2)

**Goal:** Full-page triage list, deeper than the dashboard preview.

**Build `app/work-queue.html`:**
- Split **Urgent** / **Optimization** panels.
- Each row: name · diagnosis · **check-ins vs required** · **review minutes vs required** · **contact-call status** · **days remaining** · status badge (all counts monospace).
- Inline action panels (Log Review Time · Log Patient Contact · Approve Claim · View Patient) — only one open; switching rows closes the current first.
- Row resolves on completion → status updates, row exits toward the Approval Queue.

**Done when:** rows show all metric columns in mono, single-panel behavior works, resolving a row updates its status.

---

## Session 15 — Patient Enrollment (FSD §6.3)

**Goal:** 4-step enrollment wizard that ends by triggering plan generation (mock).

**Build in `components.css`:** stepper/progress header, form fields, ICD-10 search field.

**Build `app/enroll.html`:**
1. **Step 1 Demographics** — name, DOB, email, phone, preferred channel (SMS/Email/Both).
2. **Step 2 Clinical** — ICD-10 diagnosis search (mock list incl. M54.5), history flags, treatment goals, **modality select** (Pilates · PT · OT · Osteopathy).
3. **Step 3 Provider assignment** — auto-assigned to Dr. Stillman (or select, Org-Admin view).
4. **Step 4 Review** — summary → "Create patient & generate plan" → mock "Dr. Brain is generating the plan…" → routes to Patient Detail → Plan approval.

**Done when:** all 4 steps navigate forward/back, validation is forgiving, submit routes to the plan-approval state.

---

## Session 16 — Patient Detail View (FSD §6.4)

**Goal:** The tabbed record that is the audit trail + clinical view for one patient.

**Build in `components.css`:** tab bar, timeline/calendar cell, action-log row, simple trend/adherence readouts.

**Build `app/patient.html`** (John Carter), tabs:
1. **Activity History** — chronological check-ins / review sessions / contacts (mono timestamps) + **gamification summary** (streak, badges, points — ties to patient app).
2. **Generated Plan** — Dr. Brain output by modality + **medical rationale** section (evidence basis, SaMD).
3. **Billing Window Timeline** — 30-day calendar, check-ins plotted, running totals vs thresholds (mono), projected qualification date.
4. **Action Log** — every physician-logged action with timestamp (the claim's audit trail).
5. **Outcome Charts** — pain trend (avg + direction) + adherence %.
- Header actions: Log Review Time · Log Patient Contact · Approve Claim · **Approve Plan** (pre-activation).

**Done when:** tabs cross-fade, all five render with consistent mock data, Approve Plan / Approve Claim show confirmation banners.

---

## Session 17 — Approval Queue + Reports (FSD §6.5, §6.6)

**Goal:** Close the billing loop and expose analytics + export.

**Build `app/approvals.html`:**
- Rows of claims at full qualification: patient · billing period · qualifying **CPT codes** · **est. reimbursement** (mono).
- **Expandable detail** — full qualifying-event breakdown with timestamps.
- **Individual approve** (confirm → claim locks) and **Batch Approve All**; approved rows lock and move to Reports.

**Build `app/reports.html`:**
- **Analytics** summary table — CPT distribution, revenue by period (mono figures).
- **Active queue** — approved claims awaiting CSV export.
- **Historical records** — searchable/filterable table (by date, patient, CPT), expired claims via filter.
- **CSV export** — button triggers a mock download + logs an "export event" line.

**Done when:** approve (single + batch) locks rows and moves them to Reports; report tables filter; export shows a mock confirmation.

---

## Session 18 — Revenue Calculator + Data Table (FSD §6.7, §6.8)

**Goal:** Sales/onboarding projection tool + the master patient table.

**Build `app/revenue.html`:** inputs (panel size, engagement rate, billing-tier assumptions) → **live** outputs (monthly/annual RTM revenue, CPT breakdown, ROI vs subscription). Read-only, recompute on input (JS). All figures monospace.

**Build `app/patients.html`:** complete patient table — **sortable / searchable / filterable** by status bucket; computed 5-tier status badges; inline quick actions (open Patient Detail, Log Review Time). Sorting/filtering in vanilla JS.

**Done when:** revenue outputs update live on input; the table sorts, searches, and filters by status with mono columns.

---

## Session 19 — Org Admin View + Settings (FSD §6.9, §6.10)

**Goal:** Group-practice management + account settings.

**Build `app/org-admin.html`:**
- Aggregate dashboard — total patients across providers, revenue pipeline, claims pending (mono).
- **Provider list** — enrolled-patient count + claims approved per provider.
- **Patient assignment** — reassign patients between providers.
- **Org CSV export** (consolidated) + **provider management** (invite / deactivate / roles).

**Build `app/settings.html`:** Profile (name, credentials, email, OAuth connection status) · Notification thresholds (email/SMS) · **MFA management** (reset authenticator) · Org settings (Org-Admin only: practice name, provider list, billing config / invoices).

**Done when:** Org Admin shows cross-provider aggregates + reassignment; Settings sections render with the MFA and notification controls.

---

## Session 20 — Dr. Brain Training UI + final QA + README (FSD §10.3–10.4)

**Goal:** Dr. Stillman's model-training surface, then validate the whole provider prototype.

**Build `app/dr-brain.html`:**
1. **Conversational chat** — training thread with Dr. Brain (mock messages), input box (this is the one intentional chat in PAVE — it's provider↔AI, not provider↔patient).
2. **Document upload** — drop zone (PDF/DOCX) + indexed list.
3. **Knowledge base management** — table of sources: add / remove / flag.
4. **Sandbox controls** — run a test enrollment in staging, review sandbox output, **Promote to production** (human sign-off) + **Rollback**; model version tag.
5. All training actions appended to a logged, timestamped list.

**Final QA (run on every provider screen):**
- Content capped at 1100px; sidebar + top bar persist; desktop layout holds ~1024–1440px.
- **Every metric is monospace**; status badges follow the 5-tier system; amber (not red) for "needs attention."
- Inline panels slide + single-open; panel switching cross-fades; status changes pulse; Approve banner auto-dismisses at 4s; `prefers-reduced-motion` respected.
- Mock data consistent (Dr. Stillman, Stillman Rehab Group, John Carter, CPT 98975–98981); KPI totals reconcile with the queues.
- **3-way toggle** works from every provider page and from v1/v2.

**Finalize `pro1/README.md` + root `index.html`:** screen→file map, "static prototype, no backend," and the Patient v1 · v2 · Provider switcher.

**Done when:** all 10 provider screens + login + Dr. Brain open and interlink, the QA checklist passes, and the client can demo Patient v1, Patient v2, and the Provider Portal from one toggle.

---

## Session → screen map (Provider Portal)

| Session | Screens / deliverables | FSD |
| --- | --- | --- |
| 11 | Provider tokens/base/components, sidebar+topbar shell, 3-way toggle | §16.1 |
| 12 | `login.html` (OAuth + MFA) | §5.1 |
| 13 | `dashboard.html` (KPIs, queues, inline panels, auto-refresh) | §6.1 |
| 14 | `work-queue.html` | §6.2 |
| 15 | `enroll.html` (4-step) | §6.3 |
| 16 | `patient.html` (5 tabs) | §6.4 |
| 17 | `approvals.html`, `reports.html` (+ CSV) | §6.5–6.6 |
| 18 | `revenue.html`, `patients.html` (data table) | §6.7–6.8 |
| 19 | `org-admin.html`, `settings.html` | §6.9–6.10 |
| 20 | `dr-brain.html` (training + sandbox) + QA + README | §10.3–10.4 |

**Scope notes:** Provider Portal = the 10 MVP screens (§17.1) + OAuth/MFA login + Dr. Brain training UI. **Deferred / optional (phase-2 designs, not in these 10 sessions):** API Cost Dashboard (§12), Backend Audit/Usage report screens (§14), Platform-Administrator backend, Stripe subscription-management UI (§13) — add as Sessions 21+ if the client wants them mocked. The provider portal is a single design (no v1/v2 variant) unless the client requests alternates later.

---
---

# PART 3 — Provider Portal (Pro2) — second design style (Sessions 21–24)

> **✅ IMPLEMENTED (revised approach) — done in one pass, not Sessions 21–24.**
> Per client direction, Pro2 is a **colour-scheme swap only**, not a separate
> restyle/copy. The provider portal stays **one codebase** (`pro1/`); toggling
> swaps just the theme tokens (`html[data-ptheme]`):
> - **Pro1 = white-green** (matches Patient v1) — the default (`:root` in `pro1/css/tokens.css`).
> - **Pro2 = clinical blue** (the original Session 11 palette) — `html[data-ptheme="pro2"]`.
>
> A head bootstrap on each page reads `?ptheme=pro1|pro2` (set by the toggle) and
> persists it in `localStorage`. The toggle is now **4-way** across `v1`, `v2`,
> `pro1`, and its accent follows the live theme. No `pro2/` folder exists — nothing
> is duplicated. The Sessions 21–24 plan below (full separate re-skin) is
> **superseded** and kept only for historical reference.
>
> **Original plan (superseded) — Relationship to Pro1:** exactly like patient `v1`→`v2`. Pro2 reuses **Pro1's pages, structure, copy, and mock data unchanged** — only the **design system (tokens/base/components) and illustrations** differ. Build Pro1 first (Sessions 11–20); Pro2 is a re-skin track.
> **Deliverable:** `pro2/` — a full, self-contained copy of `pro1/` with a **visibly distinct** clinical design system. Same 10 screens + login + Dr. Brain. Same desktop/1100px, light-mode-only, **monospace-metrics** rules (those are product constraints, not style choices — they hold in both).
> **The two styles must be clearly different** (as v1 is calm/editorial and v2 is gamified/vibrant). Suggested split — adjust to taste: **Pro1 = clean, airy, editorial-clinical** (serif or humanist headings, generous whitespace, hairline tables); **Pro2 = dense, modern dashboard** (bold sans, tinted status cards, stronger accent color, chunkier data viz). Keep both professional and trustworthy — this is a physician billing tool.

## Ground rules (Pro2)

- **Do not change pages/copy/data** — if a screen needs new markup, prefer adding it to *both* Pro1 and Pro2 so the two stay element-for-element equivalent.
- Same product constraints as Pro1: 1100px desktop, light mode, monospace numbers, 5-tier status badges, the §16.3 motion set, `prefers-reduced-motion`.
- `pro2/` is fully self-contained (own `css/`, `js/`, `assets/`, pages) — nothing shared with pro1/v1/v2.
- Each re-skin session: open the group at ~1280px, confirm it reads as a different design from Pro1 while showing the same data, and the **4-way toggle** works.

---

## Session 21 — Pro2 foundation: duplicate, restyle the shell, promote toggle to 4-way

**Goal:** Stand up `pro2/` as a working copy of Pro1, give it its own design system + shell, and make the client-demo switcher 4-way.

**Build:**
1. Duplicate `pro1/` → `pro2/` (all pages, js, assets). Pages/copy/data stay identical.
2. Rewrite `pro2/css/tokens.css` — **design style 2** palette, type (distinct display face), spacing, radii, shadows, status colors, `--font-mono` (metrics stay mono), `--content-max: 1100px`.
3. Rewrite `pro2/css/base.css` + `pro2/css/components.css` — restyle the shared shell + components to style 2: **sidebar nav, top bar, KPI stat card, 5-tier status badge, buttons, confirmation banner, inline action panel**. Keep the same class names so Pro1's pages render unchanged.
4. **Promote the toggle to 4-way** in `v1`, `v2`, `pro1`, `pro2` `js/app.js`: popover menu **Patient v1 · Patient v2 · Provider Pro1 · Provider Pro2**, current one highlighted.
5. Update root `index.html` to list all four.

**Done when:** `pro2/app/dashboard.html` renders the restyled shell + KPIs (same numbers as Pro1, different look), and the 4-way toggle jumps between all four prototypes from any page.

---

## Session 22 — Pro2 re-skin: data-dense screens

**Goal:** Restyle the highest-density screens to design style 2.

**Re-skin (style 2, same data/markup):**
- `dashboard.html` — KPI strip, alert banner, Urgent/Optimization queues, inline action panels.
- `work-queue.html` — the metric-column rows + inline panels.
- `patients.html` — the sortable/searchable/filterable data table + status badges.

**Done when:** all three read as a distinct design from Pro1, metrics stay monospace, status badges follow the 5-tier system, inline panels + table interactions still work.

---

## Session 23 — Pro2 re-skin: flows + detail screens

**Goal:** Restyle the forms and record screens to design style 2.

**Re-skin (style 2, same data/markup):**
- `enroll.html` — 4-step wizard (stepper, fields, ICD-10 search).
- `patient.html` — 5 tabs (Activity History, Generated Plan, Billing Timeline, Action Log, Outcome Charts).
- `approvals.html` + `reports.html` — claim rows/expanders, analytics + historical tables, CSV export.
- `revenue.html` — live calculator.

**Done when:** each renders in style 2 with tabs cross-fading, steps navigating, approvals locking, and the revenue calc recomputing — all with mono figures.

---

## Session 24 — Pro2 re-skin: remaining screens + final QA

**Goal:** Finish Pro2 and validate the full four-prototype set.

**Re-skin (style 2):** `org-admin.html`, `settings.html`, `login.html` (OAuth + MFA), `dr-brain.html` (training + sandbox).

**Final QA (Pro2 + cross-prototype):**
- Every Pro2 screen is element-for-element equivalent to Pro1 (same data, same features) but a **visibly different design**.
- 1100px cap, sidebar/top bar persist, monospace metrics, 5-tier badges (amber not red), §16.3 motion, `prefers-reduced-motion`.
- **4-way toggle** works from every page of all four prototypes and highlights the current one.
- Root `index.html` + `pro2/README.md` list all four prototypes.

**Done when:** the client can open one URL and flip through **Patient v1 · Patient v2 · Provider Pro1 · Provider Pro2** — each a complete, self-contained, coherent prototype.

---

## Session → screen map (Provider Pro2)

| Session | Deliverable |
| --- | --- |
| 21 | Duplicate pro1→pro2, style-2 design system + shell, **4-way toggle** |
| 22 | Re-skin dashboard · work-queue · patients (data-dense) |
| 23 | Re-skin enroll · patient · approvals · reports · revenue |
| 24 | Re-skin org-admin · settings · login · dr-brain + QA + README |

**Full picture:** Sessions 1–10 = Patient (v1) → later re-skinned as v2; Sessions 11–20 = Provider **Pro1**; Sessions 21–24 = Provider **Pro2**. Four prototypes, one 4-way toggle. Deferred/optional (Sessions 25+): API Cost Dashboard (§12), backend audit/usage reports (§14), platform-admin backend, Stripe subscription UI (§13) — mock in whichever provider style(s) the client wants.
