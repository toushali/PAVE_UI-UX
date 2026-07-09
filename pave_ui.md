# PAVE — Patient App (PWA) UI Build Spec

> **For:** Claude Code
> **Task:** Read this spec and produce a plan to build **static HTML + CSS** files (one file per screen, plus a shared stylesheet and shared components) that prototype the PAVE patient-facing Progressive Web App.
> **Deliverable type:** Clickable static front-end prototype. No backend, no real auth, no API calls. Use mock/placeholder data. Minimal vanilla JS is allowed **only** for tab navigation, expand/collapse panels, and simple state toggles (done/undone). Do **not** pull in a framework.
> **Source of truth:** PAVE Functional Scope Document v5.0 (MVP) + PAVE Delivery Planner. This file distills the patient-app portion into buildable UI.

---

## 0. How to use this file (read me first, Claude Code)

1. Read Sections 1–4 to internalise the constraints, principles, and design tokens.
2. Build the shared layer first: `tokens.css` → `base.css` → `components.css` → the bottom tab bar + app shell.
3. Then build screens in the order in Section 8 (Build Order).
4. Every screen inherits the tokens and shared components — do **not** hardcode colors, spacing, or font sizes that aren't in Section 4.
5. Respect the hard boundaries in Section 1. If a design idea here conflicts with those boundaries, the boundary wins.

---

## 1. Hard product constraints (do not violate)

These come straight from the FSD MVP scope. They shape the whole UI.

| Constraint | Design consequence |
| --- | --- |
| **Audience is adults 60–85**, low tech literacy | Large everything. One primary action per screen. No hamburger menus, no gestures required. |
| **Mobile-first PWA**, light mode **only** | Design at ~390px width. No dark mode. Installable (manifest + service worker later — out of scope for static prototype, but structure the shell for it). |
| **No video** exercise demos | Exercise instructions are **text + static illustration + timer**. Never scaffold a video player. |
| **No in-app messaging / chat** | Replace with a prominent **"Call the office"** affordance where a patient might expect chat. |
| **No streak-freeze** | Missing a day resets the streak to zero. Don't design a "freeze" or "repair" UI. |
| **Magic link, no password ever** | Login is email/phone → link → OTP. No password field anywhere. |
| **Touch targets ≥ 48px** (we go bigger — see tokens) | Primary buttons 56–64px tall. Full-row tap zones. |
| **Read-only plan** | Patient can mark exercises done but cannot edit the plan. |
| **Daily check-in = the billable event** | The check-in flow is the highest-priority screen. Make it the fastest, clearest path in the app. |

---

## 2. Design principles

1. **One hero action per screen.** Ambiguity kills completion for this demographic.
2. **Warm, not clinical.** Rounded cards, soft shadows, encouraging copy, generous whitespace. The opposite of the dense provider portal.
3. **Always-visible navigation.** Flat bottom tab bar with icon **+ text** label. No hidden nav.
4. **Positive-only states.** Missed days are shown neutrally, never in red or with shaming language. There is no "you're failing" screen.
5. **Gentle motion.** Fade-and-rise on mount, scale-pulse on success. Slow and soft — never fast or flashy.
6. **Accessibility is a headline feature.** High contrast, large-text toggle surfaced early, voice input where typing is required.
7. **Signature motif: a growing plant/garden** represents the streak and recovery journey — used instead of a "fire" streak. Reuse this motif across Today, Confirmation, and Rewards.

---

## 3. Information architecture & navigation

### Bottom tab bar (persistent, 4 tabs)

```
[ Today ]   [ Exercises ]   [ Progress ]   [ Rewards ]
```

- Icon + text label on each. Active tab has color fill + label weight change.
- The **Daily Check-In** is launched as the hero action **from Today** (not its own tab), and also deep-linkable from the SMS reminder.
- Confirmation/Celebration is a **full-screen overlay**, not a tab.
- Settings, Help, Profile, and auth screens sit **outside** the tab bar (accessed from a small avatar/gear on Today, or entered via deep link).

### Screen inventory

| # | Screen | Route (file) | In tab bar? | MVP status |
| --- | --- | --- | --- | --- |
| 1 | Splash / PWA Launch & Install prompt | `splash.html` | No | Core |
| 2 | Login (magic link) | `login.html` | No | Core |
| 3 | OTP / MFA verify | `verify.html` | No | Core |
| 4 | Onboarding (welcome + confirm details) | `onboarding.html` | No | Core |
| 5 | **Today / Home** | `today.html` | Yes | Core |
| 6 | **Daily Check-In** | `checkin.html` | No (launched from Today) | Core |
| 7 | Check-In Confirmation / Celebration | `confirmation.html` | No (overlay) | Core |
| 8 | **Exercise Plan** | `exercises.html` | Yes | Core |
| 9 | Exercise Detail (with timer) | `exercise-detail.html` | No (slides up from #8) | Core |
| 10 | **Progress** | `progress.html` | Yes | Core |
| 11 | **Rewards / Achievements** | `rewards.html` | Yes | Core |
| 12 | Reminder / Notification Settings | `settings.html` | No | Core (in Delivery Planner) |
| 13 | Help / "How do I…" | `help.html` | No | Supporting |
| 14 | Session Expired / Re-auth | `session-expired.html` | No | Supporting |
| 15 | Offline state (banner + full-screen fallback) | component + `offline.html` | No | Supporting |

Screens 1–11 are the priority. 12–15 are supporting states.

---

## 4. Design system / tokens

> Put these in `tokens.css` as CSS custom properties on `:root`. Colors below are a **proposed** warm, accessible, recovery-themed palette (green/teal primary ties to the plant motif). They are easily swappable — the FSD did not fix a patient-app palette. Keep all contrast ≥ WCAG AA (4.5:1 for text).

### Color

```css
:root {
  /* Brand / primary — calm recovery green-teal */
  --c-primary:        #147D64;  /* buttons, active states, plant */
  --c-primary-dark:   #0C5C49;  /* pressed */
  --c-primary-soft:   #E4F2ED;  /* soft fills, done states */

  /* Accents */
  --c-accent-amber:   #C77700;  /* gentle "attention", NOT red */
  --c-success:        #147D64;
  --c-celebrate:      #F2B705;  /* badge gold, confetti */

  /* Neutrals — warm, not cold gray */
  --c-ink:            #1F2421;  /* primary text, ~15:1 on bg */
  --c-ink-2:          #4A544E;  /* secondary text */
  --c-line:           #D9E0DC;  /* hairlines / borders */
  --c-bg:             #FBFAF6;  /* warm off-white app bg */
  --c-surface:        #FFFFFF;  /* cards */

  /* Pain scale ramp (calm → alert), used on the face scale */
  --c-pain-0:         #4FA88B;
  --c-pain-5:         #E0A93B;
  --c-pain-10:        #C05A4A;
}
```

### Typography

- Use a highly legible humanist sans. Stack: `"Inter", "Segoe UI", system-ui, -apple-system, sans-serif`.
- **Minimum body size is 18px.** Numbers that matter (streak, pain, points) are large.

```css
:root {
  --fs-display: 40px;  /* streak number, pain number */
  --fs-h1:      28px;  /* screen titles, greeting */
  --fs-h2:      22px;  /* section headers */
  --fs-body-lg: 20px;  /* primary body, button labels */
  --fs-body:    18px;  /* minimum body */
  --fs-caption: 16px;  /* secondary/meta — do not go smaller */

  --lh-tight: 1.25;
  --lh-body:  1.5;

  --fw-regular: 400;
  --fw-medium:  600;
  --fw-bold:    700;
}
```

- Provide a **large-text mode**: a `.text-lg` class on `<html>` that scales the `--fs-*` variables up ~15%. Toggle surfaced in Onboarding and Settings.

### Spacing (8px base)

```css
:root {
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;
  --page-pad: 20px;        /* left/right screen padding */
  --content-max: 440px;    /* center content, cap width */
}
```

### Radius, shadow, targets, motion

```css
:root {
  --radius-card: 20px;
  --radius-btn:  16px;
  --radius-pill: 999px;

  --shadow-card: 0 2px 12px rgba(20,60,45,0.06);
  --shadow-lift: 0 8px 28px rgba(20,60,45,0.12);

  --tap-min:  48px;   /* absolute minimum */
  --tap-btn:  60px;   /* primary button height */
  --tap-hero: 72px;   /* the check-in Go button ring */

  --motion-fast: 160ms;
  --motion-base: 260ms;
  --motion-slow: 420ms;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);  /* soft */
}
```

### Motion behaviours to implement

| Interaction | Behaviour |
| --- | --- |
| Screen mount | Content fades in and rises ~12px (`--motion-base`) |
| Exercise detail open | Sheet slides up from bottom |
| Mark exercise done | Row scale-pulses + soft green fill |
| Check-in submitted | Full-screen confirmation; plant grows a leaf; points tick up |
| Badge earned | Gentle badge reveal; optional confetti (celebrate color); sound OFF by default |
| Tab switch | Instant content swap with a quick cross-fade |

Respect `prefers-reduced-motion: reduce` — drop transforms, keep opacity only.

---

## 5. Shared components (`components.css`)

Build these once, reuse everywhere:

- **App shell**: fixed top bar (screen title + optional back/gear) + scrollable content + fixed bottom tab bar. Content is centered and capped at `--content-max`.
- **Bottom tab bar**: 4 items, icon + label, active state.
- **Primary button**: full-width, `--tap-btn` tall, `--radius-btn`, `--c-primary`. Sticky variant for form submit.
- **Secondary/ghost button**.
- **Card**: `--c-surface`, `--radius-card`, `--shadow-card`, `--sp-5` padding.
- **Checklist row**: full-row tap target, big checkbox left, label, optional meta right; `.is-done` state (soft green + check).
- **Pill toggle group**: e.g., Better / Same / Worse — big pills, single-select.
- **Face/segment pain scale**: 0–10, large tappable, color ramp `--c-pain-0 → 10`, selected value shown large.
- **Stat block**: big number + label (streak, adherence %, points).
- **Badge tile**: earned (full color + date) vs locked (grayscale + "how to earn" hint).
- **Plant/streak illustration**: an inline SVG that grows with streak length (define 4–5 growth stages: sprout → leaves → small plant → flowering). Reused on Today, Confirmation, Rewards.
- **Milestone/journey path**: vertical stepper with next milestone highlighted.
- **Call-the-office button**: phone icon + "Call the office" — appears wherever chat would normally be.
- **Toast / confirmation banner**: slides from top, auto-dismiss ~4s.
- **Offline banner**: full-width, non-alarming, "We'll save your check-in and send it when you're back."

---

## 6. Screen-by-screen specs

Each screen: purpose → layout (top to bottom) → key components → states → notes.

### 1. Splash / Install (`splash.html`)
- **Purpose:** Warm first impression + Add-to-Home-Screen coaching.
- **Layout:** Centered logo + "Healthcare. Simplified." tagline on `--c-bg`; below it an install card that (for the prototype) shows the iOS "Share → Add to Home Screen" steps with icons. A "Continue" button proceeds to Login.
- **Notes:** In the real app, detect iOS vs Android; in the static prototype, show iOS steps and a small toggle to preview Android steps.

### 2. Login — Magic Link (`login.html`)
- **Purpose:** Passwordless entry.
- **Layout:** Screen title "Welcome to PAVE" → one large field "Enter your email or phone" → giant primary button "Send my link" → reassurance caption **"No password to remember, ever."**
- **States:** default; "link sent" confirmation (big check + "Check your phone/email"); resend.

### 3. OTP / MFA Verify (`verify.html`)
- **Purpose:** One-time code entry, guided.
- **Layout:** Title "Enter your code" → 6 large single-digit boxes with auto-advance → big "Resend code" ghost button → subtle "Why am I doing this?" help link.

### 4. Onboarding (`onboarding.html`)
- **Purpose:** Trust + confirm identity + set reminder.
- **Layout:**
  1. **Trust card** — physician photo + name: "Your recovery plan from **Dr. Stillman**." (mock)
  2. Max 3 skippable welcome cards: *your plan · check in each day · watch your progress grow* (dot indicators).
  3. **Confirm your details** — pre-filled name + contact, single "Yes, that's me" button.
  4. **Large-text toggle** shown here.
  5. **Pick your daily reminder time** (big time control) — do this on day one; it drives adherence.

### 5. Today / Home (`today.html`) — landing hub
- **Purpose:** Get the patient into today's check-in; show the streak.
- **Layout (top → bottom):**
  1. Top bar: greeting "Good morning, John" + date + small gear (→ Settings).
  2. **Hero check-in card** — a large circular "Go"-style button: *"Do today's check-in"*. State-aware: undone = gentle pulse; done = green check + "See you tomorrow."
  3. **Streak block** with the growing-plant SVG + "12-day streak."
  4. **"Your plan today"** preview — mini checklist of today's exercises (tap → Exercises).
  5. Accountability line: "Dr. Stillman can see your updates."
- **States:** check-in undone (default) vs done.

### 6. Daily Check-In (`checkin.html`) — highest priority
- **Purpose:** Log the daily billable event in under 2 minutes. Single page, everything visible.
- **Layout (top → bottom), all on one scrollable page:**
  1. Title "How are you today?"
  2. **Pain scale** — large face/segment 0–10, color ramp, selected number shown big.
  3. **Exercises completed today** — big checklist rows.
  4. **Compared to yesterday** — three big pills: Better / Same / Worse.
  5. **"Add a note for your doctor (optional)"** — collapsed; expands to a textarea with a **big mic (voice-to-text)** button. Clearly optional.
  6. **Sticky primary button:** "Submit today's check-in."
- **States:**
  - Default (empty).
  - Partially filled (submit still enabled — nothing is required except being present; keep it forgiving).
  - **Already submitted today** → show a friendly done-state instead of the form ("You've checked in today ✓ — come back tomorrow"), not an error.
- **Notes:** On submit → go to Confirmation. Timestamp is server-side/invisible (no UI). Auto-save draft in memory so a mis-tap doesn't lose input.

### 7. Confirmation / Celebration (`confirmation.html`) — full-screen overlay
- **Purpose:** Reward the check-in, close the loop.
- **Layout:** Big check → **"Your doctor can see your update."** → plant grows a leaf animation → points tick +10 → if a badge/milestone fired, reveal it (dignified, optional gentle confetti) → "Come back tomorrow" + next reminder time → big "Done" button (returns to Today).
- **Notes:** Sound OFF by default. Respect reduced-motion.

### 8. Exercise Plan (`exercises.html`)
- **Purpose:** Browse the assigned plan by modality; mark done.
- **Layout:** Sections with big headers by modality (Pilates · Mobility · Strengthening · Breathing). Each exercise = big card: name, one plain-language line, frequency ("2× today"), completion tick. Static line-illustration/icon per exercise to break up text. A "Have questions? **Call the office**" line at the bottom (no chat).
- **States:** to-do vs done-today (soft green + check). Read-only — no edit affordances.
- **Interaction:** tap a card → Exercise Detail slides up.

### 9. Exercise Detail (`exercise-detail.html`) — slide-up sheet
- **Purpose:** Guide one exercise well **without video**.
- **Layout:** Exercise name → static illustration → "What this helps" one-liner → **large numbered steps** (generous spacing) → **built-in timer**: a big countdown ring for holds/reps ("Hold 15s") with start/pause and an optional gentle end-chime → big "Mark as done" (syncs to today's check-in).
- **Notes:** This timer + text flow is the deliberate replacement for the missing video. Make it feel hand-held and premium.

### 10. Progress (`progress.html`)
- **Purpose:** "How am I doing?" — reassuring, never alarming.
- **Layout:**
  1. **Streak calendar** — month grid, big cells, checkmarked days, today highlighted; missed days uncolored/neutral (never red).
  2. **Adherence** — big % in a friendly ring + plain language: "You've checked in 24 of 30 days — great going."
  3. **Pain trend** — a big directional sentence ("Your pain is trending down") + a simple this-week-vs-last-week bar. Directional and reassuring, not a clinical chart.
- **Notes:** All copy positive-only.

### 11. Rewards / Achievements (`rewards.html`)
- **Purpose:** Motivate via badges, points, milestones.
- **Layout:**
  1. **Points total** — big, framed as "progress points" (no redemption/store).
  2. **Badge gallery** — grid of badge tiles; earned = full color + earn date; locked = grayscale + "how to earn" hint.
  3. **Milestone journey path** — vertical stepper (First week → First month → Pain down 20/40/60%), next milestone highlighted with "2 days to your 14-day badge!".
  4. Optional (flag as phase-2): **"Share my progress"** card for family/doctor.
- **Notes:** Warm and dignified naming ("Consistency: 30 Days"), never childish.

### 12. Reminder / Notification Settings (`settings.html`)
- **Layout:** Big daily-reminder **time picker** → channel toggle (SMS / Email) → streak-nudge on/off → large-text toggle → high-contrast toggle. Keep to ~4–5 controls. Back to Today.

### 13. Help (`help.html`)
- **Layout:** Short FAQ ("How do I check in?", "I forgot to check in yesterday", "How do I install the app?") as big expandable rows → prominent **"Call the office"** button at top and bottom.

### 14. Session Expired (`session-expired.html`)
- **Layout:** Friendly "Let's get you back in" → email/phone field → "Send my link." Never a scary error tone.

### 15. Offline (`offline.html` + banner component)
- **Banner:** appears at top of any screen when offline. **Full-screen fallback:** reassuring copy + retry, only when no cached content exists.

---

## 7. Suggested file structure

```
pave-patient-app/
├── index.html                → redirects/links to splash.html (entry)
├── css/
│   ├── tokens.css            → :root custom properties (Section 4)
│   ├── base.css              → resets, typography, layout, app shell
│   └── components.css        → shared components (Section 5)
├── js/
│   └── app.js                → tab nav, expand/collapse, done toggles, timer (vanilla, minimal)
├── assets/
│   ├── icons/                → inline-able SVG icons (tabs, phone, check, mic)
│   ├── illustrations/        → static exercise line-art, physician photo (placeholder)
│   └── plant/                → plant growth-stage SVGs
├── auth/
│   ├── splash.html
│   ├── login.html
│   ├── verify.html
│   ├── onboarding.html
│   └── session-expired.html
├── app/
│   ├── today.html
│   ├── checkin.html
│   ├── confirmation.html
│   ├── exercises.html
│   ├── exercise-detail.html
│   ├── progress.html
│   ├── rewards.html
│   ├── settings.html
│   ├── help.html
│   └── offline.html
└── README.md                 → how to open the prototype, screen map, mock-data notes
```

- Every screen links the same 3 CSS files + `app.js`.
- Use **mock data inline** in each HTML file (patient name "John", "Dr. Stillman", a sample 4-modality plan, a 12-day streak, sample badges). Keep mock data consistent across screens.

---

## 8. Build order (phased plan for Claude Code)

**Phase A — Foundation**
1. `tokens.css`, `base.css`, app shell + bottom tab bar in `components.css`.
2. Build **`today.html`** end-to-end as the reference screen that proves the design system.

**Phase B — The core loop (highest value)**
3. `checkin.html` → `confirmation.html` (the billable path).
4. `exercises.html` → `exercise-detail.html` (with the timer).

**Phase C — Progress & motivation**
5. `progress.html`, `rewards.html` (plant motif, badges, milestone path).

**Phase D — Auth & onboarding**
6. `splash.html`, `login.html`, `verify.html`, `onboarding.html`.

**Phase E — Supporting**
7. `settings.html`, `help.html`, `session-expired.html`, `offline.html`.

Deliver a short `README.md` mapping screens → files and noting this is a static prototype (no backend).

---

## 9. Accessibility checklist (verify on every screen)

- [ ] Body text ≥ 18px; key numbers large; nothing below 16px.
- [ ] All tap targets ≥ 48px; primary buttons 56–64px.
- [ ] Text contrast ≥ 4.5:1 against its background.
- [ ] Navigation always visible (bottom tab bar) — no hamburger, no required gestures.
- [ ] Every actionable element has a visible text label (not icon-only).
- [ ] Large-text mode works via the `.text-lg` toggle.
- [ ] `prefers-reduced-motion` honored (opacity-only fallbacks).
- [ ] Missed/failed states are neutral and non-shaming — no red "failure" screens.
- [ ] Voice input available on the doctor-note field.
- [ ] "Call the office" is present wherever a patient might expect chat.

---

## 10. Scope guardrails — do NOT build these (out of MVP)

- ❌ Any **video** player or video exercise demos.
- ❌ Any **in-app chat / messaging** between patient and provider.
- ❌ **Streak-freeze / repair** mechanics.
- ❌ **Password** fields or password reset.
- ❌ **Dark mode**.
- ❌ **Reward redemption / points store** (points are progress-only).
- ❌ Real API/auth/backend calls (this is a static prototype).

Anything marked "phase-2" or "optional" above (e.g., share-progress card, Android install preview) is nice-to-have — build only if the core 15 screens are complete.

---

*Distilled from PAVE FSD v5.0 (MVP) and PAVE Delivery Planner. Palette and motifs are proposed and adjustable; product constraints in Section 1 are fixed.*