# PAVE — Patient App (static prototype)

A clickable, mobile-first front-end prototype of the PAVE patient PWA, for
adults 60–85. **Static HTML + CSS with minimal vanilla JS** — no backend, no
real auth, no API calls, no framework. All data is mock/placeholder and kept
consistent across screens.

> Built from `pave_ui.md` (UI build spec) per the 10-session plan in `build.md`.

## How to open

Open **`index.html`** in a browser — it redirects into the app at
`auth/splash.html`. Any static server works (e.g. VS Code Live Server). No
build step, no install.

On desktop the app renders as a **centered ~390px phone frame**; on a real
phone it fills the screen. Design width is ~390px, **light mode only**.

## Flow

```
splash → login → verify → onboarding → Today
                                         │
     ┌───────────────────────────────────┼───────────────────────────────┐
   Today            Exercises          Progress          Rewards   (bottom tabs)
     │                  │
  Check-in          Exercise detail
     │              (slide-up + timer)
  Confirmation
  (celebration)
```

The **Daily Check-In** is the highest-priority path (the billable event):
Today → Check-In → Confirmation.

## Screen map

| # | Screen | File | In tab bar? |
| --- | --- | --- | --- |
| 1 | Splash / Install | `auth/splash.html` | No |
| 2 | Login (magic link) | `auth/login.html` | No |
| 3 | OTP / Verify | `auth/verify.html` | No |
| 4 | Onboarding | `auth/onboarding.html` | No |
| 5 | **Today / Home** | `app/today.html` | **Yes** |
| 6 | **Daily Check-In** | `app/checkin.html` | No (from Today) |
| 7 | Confirmation / Celebration | `app/confirmation.html` | No (overlay) |
| 8 | **Exercise Plan** | `app/exercises.html` | **Yes** |
| 9 | Exercise Detail (timer) | `app/exercise-detail.html` | No (slide-up) |
| 10 | **Progress** | `app/progress.html` | **Yes** |
| 11 | **Rewards** | `app/rewards.html` | **Yes** |
| 12 | Reminder / Notification Settings | `app/settings.html` | No |
| 13 | Help / FAQ | `app/help.html` | No |
| 14 | Session Expired / Re-auth | `auth/session-expired.html` | No |
| 15 | Offline (banner + fallback) | `app/offline.html` | No |

## Project structure

```
pave-patient-app/
├── index.html            → entry, redirects to auth/splash.html
├── css/
│   ├── tokens.css        → design tokens + large-text / high-contrast modes
│   ├── base.css          → reset, typography, phone-frame app shell, motion
│   └── components.css    → all shared components
├── js/
│   └── app.js            → tab nav, expand/collapse, done toggles, pain scale,
│                           pill groups, mic stub, timer, OTP, switches, segmented
├── assets/
│   ├── icons/            → inline-able stroke SVGs (currentColor)
│   ├── illustrations/    → modality line-art + physician placeholder
│   └── plant/            → plant growth-stage motif (streak)
├── auth/                 → splash, login, verify, onboarding, session-expired
└── app/                  → today, checkin, confirmation, exercises,
                            exercise-detail, progress, rewards, settings,
                            help, offline
```

## Mock data (consistent across screens)

- **Patient:** John Carter · john.carter@email.com · (555) 123-4567
- **Physician:** Dr. Stillman
- **Plan (4 modalities):** Pilates (Pelvic tilt, Roll-up) · Mobility (Cat–cow) ·
  Strengthening (Glute bridge) · Breathing (Box breathing)
- **Streak:** 12 days (plant growth stage 4) · **Points:** 480 · **Adherence:** 24/30
- **Reminder time:** 9:00 AM

## Prototype-only helpers

A few screens include a small "Preview …" button to demonstrate alternate
states without a backend:
- **Today** — toggle the check-in hero between *undone* and *checked-in*.
- **Check-In** — preview the *already checked in today* done panel.
- **Login** — the "Send my link" → sent state; Confirmation animates on load.

## Design & accessibility notes

- **Tokens only** — colors, spacing, radii, type sizes come from `tokens.css`.
- **Large everything** — body ≥ 18px, primary buttons 56–64px, tap targets ≥ 48px.
- **Large-text** and **High-contrast** modes (Settings / Onboarding) apply
  app-wide instantly via `html.text-lg` / `html.high-contrast`.
- **Motion** respects `prefers-reduced-motion` (opacity-only fallbacks).
- **Positive-only** — missed days are neutral (never red); no shaming states.
- **Plant motif** (not a fire streak) recurs on Today, Confirmation, Rewards.
- **"Call the office"** replaces chat wherever a patient might expect messaging.

## Deliberately NOT built (out of MVP scope)

No video players · no in-app chat/messaging · no streak-freeze/repair ·
no password fields · no dark mode · no reward redemption/store ·
no real API/auth/backend. See `pave_ui.md` §10.
