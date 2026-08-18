# PAVE — UI/UX Prototype → Frontend Handover

A complete, clickable UI/UX prototype for **PAVE**, a HIPAA-compliant Remote
Therapeutic Monitoring (RTM) platform. Three portals, four roles, 39 feature screens.

**This repository is a specification, not a starting codebase.** It is plain
HTML, CSS and vanilla JS with no build step, so every design decision is
readable without tooling. You are expected to *rebuild* it in Next.js, not to
port these files. What you should carry across is the **design system, the
interaction contracts, the copy, and the accessibility work** — all documented
below.

---

## Contents

1. [Run it](#1-run-it)
2. [What you are looking at](#2-what-you-are-looking-at)
3. [Roles and demo accounts](#3-roles-and-demo-accounts)
4. [Repository layout](#4-repository-layout)
5. [Screen inventory](#5-screen-inventory)
6. [Design system](#6-design-system)
7. [Responsive contract](#7-responsive-contract)
8. [Interaction contracts](#8-interaction-contracts)
9. [Accessibility — what is already done, and what you must not lose](#9-accessibility)
10. [The patient PWA](#10-the-patient-pwa)
11. [What is mocked, and what that implies](#11-what-is-mocked-and-what-that-implies)
12. [Suggested Next.js architecture](#12-suggested-nextjs-architecture)
13. [Regulatory constraints that shape the UI](#13-regulatory-constraints-that-shape-the-ui)
14. [Open decisions — read before estimating](#14-open-decisions)
15. [Verification harness](#15-verification-harness)
16. [Definition of done](#16-definition-of-done)

---

## 1. Run it

No install, no build. Any static server:

```bash
npx serve .          # or: python -m http.server 8000
```

Open `index.html` — a chooser listing all three portals and every demo account.

> **Serve it, do not open with `file://`.** The patient portal registers a
> service worker, which requires an HTTP origin.

**If styling looks stale after a change**, the service worker is holding an old
copy. Hard-reload once (`Ctrl+Shift+R`), or unregister it in DevTools →
Application → Service Workers. See [§10](#10-the-patient-pwa).

---

## 2. What you are looking at

| | |
|---|---|
| **Product** | RTM platform — patients log daily therapeutic activity; providers monitor and bill CPT 98975–98981 |
| **Brand in code** | `Kivie` (logos, titles, ~60 toast strings). Docs say `PAVE`. **Unresolved — see [§14](#14-open-decisions)** |
| **Portals** | 3 — Patient PWA, Provider Portal, Platform Admin console |
| **Roles** | 4 — Patient, Physician/Provider, Organization Administrator, Platform Administrator |
| **Screens** | **39 feature screens** · 47 `.html` files in total (the rest are error states and folder redirects) |
| **Stack** | HTML5 + CSS custom properties + vanilla ES5-style JS. No framework, no bundler, no dependencies |
| **Source spec** | `core_docs/FSD Pave...docx.md` (the FSD) and `core_docs/user-stories.md` |

Section references like **FSD §8.3** throughout the code point at that document.
Where the prototype and the FSD disagree, the code says so in a comment.

---

## 3. Roles and demo accounts

The provider sign-in takes a **work email**, and the address decides the role
and the destination. It is prefilled with the physician, so the portal opens on
provider work by default.

| Role (FSD §4) | Email | Person | Lands on |
|---|---|---|---|
| Physician / Provider | `b.stillman@stillmanrehab.com` | Dr. Brandon Stillman, MD | Provider → Dashboard *(default)* |
| Organization Administrator | `d.okafor@stillmanrehab.com` | Dana Okafor | Provider → Dashboard, **+ Org Admin** |
| Platform Administrator | `a.rivera@pave.health` | Alex Rivera | **Platform Admin** → Overview |
| Patient | `john.carter@example.com` | John Carter | Turned away → the patient app's own door |

**MFA code is `123456` for all of them.** All four are listed as one-click demo
accounts on the sign-in screen and on the root chooser.

### What the role actually changes

| Surface | Physician | Org Admin |
|---|---|---|
| Nav items | 7 | 8 (**+ Org Admin**) |
| `org-admin.html` | Refuses with an explanation | Opens |
| `patient.html` (clinical record) | Opens | **Refuses** — FSD §4 |
| Settings → *Organization & billing* | Removed from the DOM | Shown |

**Dr. Brain training access is a fifth thing — a per-provider permission, not a
role.** The platform administrator grants or revokes it on each provider's
account record in `admin/app/provider-accounts.html`; the training page shows
the roster read-only. Model it as a permission on the user, separate from the
role enum — FSD §4's four roles do not cover it.

> **It is recorded, not yet wired, and that is intentional.** The provider
> portal has no Dr. Brain surface at all — training lives only in the admin
> console. The client's decision was to capture *who may have access* now and
> settle *what they open* later. **Do not infer a provider-side training screen
> from the presence of this permission.** Promotion to production stays a named
> clinician's sign-off under FSD §10.4 regardless.

> ⚠️ **This is not authentication.** The role is resolved from a string typed
> into a box and kept in `localStorage["kivie-provider-role"]`. **In Next.js,
> resolve the role from the identity provider's claim, server-side, and gate on
> the server.** The client-side removal here communicates *intent* — which
> surfaces exist for which role — not enforcement.

---

## 4. Repository layout

```
PAVE/
├── index.html              Portal chooser + every demo account
├── package.json            Metadata only — no dependencies, no scripts to run
│
├── patient/                Patient PWA          → its own Next.js app
│   ├── index.html            redirect to auth/splash
│   ├── manifest.json         PWA manifest (installable, standalone, portrait)
│   ├── sw.js                 service worker — READ THE COMMENTS
│   ├── auth/                 splash · login · verify · onboarding · session-expired
│   ├── app/                  today · checkin · confirmation · exercises · progress
│   │                         rewards · settings · help · notifications · offline
│   ├── css/                  tokens · base · components   (2 860 lines of components)
│   ├── js/app.js             all behaviour
│   ├── js/notifications.js   push/SMS copy deck — design reference, not runtime
│   └── assets/art, icons     plant + cat companion art, medallions, PWA icons
│
├── provider/               Provider Portal      → its own Next.js app
│   ├── app/                  12 feature screens + 404 + session-expired
│   ├── css/                  tokens · base · components
│   ├── js/app.js             shell, nav, roles, tables, modals, confirmations
│   └── assets/logo.svg, logo-light.svg
│
├── admin/                  Platform Admin       → its own Next.js app
│   ├── app/                  12 feature screens + 404 + session-expired
│   ├── css/                  tokens · base · components   (green-tinted fork of provider)
│   └── js/app.js
│
└── core_docs/
    ├── FSD Pave...docx.md    the functional spec — the authority
    ├── user-stories.md       user stories by role
    ├── build.md              build history, session by session, with rationale
    └── gap-analysis.md       what is still open, and the client decisions blocking it
```

**Read `core_docs/build.md`.** It records *why* each decision was made, including
the ones that contradict the FSD and the reasoning for doing so. It is the
closest thing to a design rationale document.

---

## 5. Screen inventory

### Patient PWA — 15 screens

| Screen | File | Notes |
|---|---|---|
| Splash | `auth/splash.html` | Companion art, brand |
| Login | `auth/login.html` | Magic link — no password, per FSD §5.1 |
| Verify | `auth/verify.html` | Link-landed state |
| Onboarding | `auth/onboarding.html` | **Confirm identity first**, then reveal preferences |
| Session expired | `auth/session-expired.html` | |
| Today | `app/today.html` | Home. Companion, points, the day's CTA |
| Check-in | `app/checkin.html` | Pain scale, better/same/worse, optional note. **The RTM qualifying event** |
| Exercises | `app/exercises.html` | Per-exercise ± logging against the prescription |
| Confirmation | `app/confirmation.html` | Points awarded, everyday + milestone celebrations |
| Progress | `app/progress.html` | Streak, history, charts |
| Rewards | `app/rewards.html` | Points total, medallion collection |
| Settings | `app/settings.html` | Companion choice, text size, contrast, channels |
| Help | `app/help.html` | |
| Notifications | `app/notifications.html` | |
| Offline | `app/offline.html` | Service-worker fallback |

### Provider Portal — 13 screens

**Clinical** — Dashboard · Work Queue · Patients · Approvals
**Business** — Billing reports · Revenue calculator
**Practice** — Org Admin *(role-gated)* · Settings
**Plus** — Enrollment (5-step wizard) · Plan Review · Patient Detail · Sign in
**Error states** — `404.html`, `session-expired.html`

### Platform Admin — 12 screens

Overview · Complaints & MDR · **Dr. Brain training** · AI Governance · Platform
reports · HIPAA Audit · Data Requests · API costs · Provider accounts ·
Organizations · Platform settings · Sign in — plus `404.html`,
`session-expired.html`

> **Dr. Brain training lives here, not in the provider portal.** Model training
> will be restricted rather than offered to every physician, so it sits beside
> the console that governs the model. But the administrator running it is not a
> clinician, and FSD §10.4 requires documented human sign-off before a model
> reaches production — so **promotion and rollback require naming the
> supervising clinician**, and the action is recorded against them. Preserve
> that: it is the difference between a logged clinical decision and an
> operations user silently changing how patients are treated.

---

## 6. Design system

### Token files are the contract

`{portal}/css/tokens.css` is the source of truth. **Never hardcode a value that
belongs in a token.** Port these into your Next.js theme layer (CSS variables,
Tailwind theme extension, or a design-tokens package — the shape survives any of
them).

**Brand ramp** — seven colours, everything else is derived:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#16294A` | All body and heading text |
| `--pine` | `#0E4A44` | Card/hero surfaces, primary actions |
| `--teal` | `#17838C` | Secondary teal surface |
| `--eucalyptus` | `#4F9C87` | Secondary fills, dividers, inactive states |
| `--cyan` | `#21B6C4` | **Progress only** — rings, points bars, active tab |
| `--clay` / `--amber` | `#C08056` / `#D9A441` | Warm accent, "ember" gradient |
| `--paper` | `#F4F7F3` | Page background |

Legacy `--c-*` names are remapped onto the ramp, so every existing usage
inherits a ramp change. Keep that indirection.

**Token families** — `--c-*` (32 colours) · `--st-*` (10 status) · `--fs-*`
(6 type sizes) · `--fw-*` (4 weights) · `--sp-*`, `--radius-*`, `--shadow-*`,
`--motion-*`, `--ease` · plus the layout tokens in [§7](#7-responsive-contract).

**Status colours (`--st-*`)** encode the FSD §15.3 five-tier patient status.
**Amber is never red** — a patient behind on their plan is not an alarm state.
That is a deliberate product decision, not a palette accident.

### Three stylesheets per portal, in order

1. `tokens.css` — custom properties only
2. `base.css` — reset, typography, layout primitives
3. `components.css` — every component

Provider and Admin share one design system (Admin is a green-tinted fork).
Patient is its own — larger type, bigger targets, warmer surfaces, built for a
**60–85 year-old audience**.

### Dark mode

Shipped in the provider and admin portals via `<html data-theme="light|dark">`,
bootstrapped by an inline script in each page `<head>` to avoid a flash. Stored
in `localStorage["kivie-provider-theme"]` / `["kivie-admin-theme"]`.

> **FSD §17.2 lists dark mode as out of scope.** It is built anyway. Confirm
> before you commit to maintaining it — it doubles the QA matrix.

---

## 7. Responsive contract

Desktop-first, `max-width` ladder. Documented at the top of each `tokens.css`.

| Breakpoint | Meaning |
|---|---|
| `1279px` | Large desktop → desktop |
| `1023px` | Desktop → tablet landscape. Sidebar collapses to an icon rail |
| `767px` | Tablet → mobile. Sidebar becomes a drawer behind a hamburger |
| `640px` | Small mobile. Tables become stacked cards |

Layout is driven by tokens, not media-query-specific rules, wherever possible:

```css
--sidebar-w     /* full → rail → 0 */
--content-max   /* content column cap */
--page-pad      /* page gutter */
--topbar-h      /* sticky header height */
--tap-min: 48px /* minimum interactive target */
```

Change the token at a breakpoint; the layout follows. Preserve this.

> **FSD §16.1 specifies desktop-only at 1100px.** The build is fully responsive.
> The spec and the build disagree on paper — see [§14](#14-open-decisions).

---

## 8. Interaction contracts

*The `data-*` hooks.*

Every behaviour is bound to a `data-*` attribute rather than a class or an ID.
**These are the interaction spec.** When you rebuild in React, the attribute
names become component props and the behaviours become hooks — but the
*contract* (what a control does, what state it can be in, what it announces)
should survive intact.

### Shared across the two desktop portals

| Hook | Contract |
|---|---|
| `data-shell` | Host element. `renderShell()` injects sidebar + topbar from one place → in Next.js this is your layout |
| `data-page`, `data-title` | On `<body>`. Drives active nav state and the topbar title |
| `data-nav="slug"` | Nav item; active when it matches `data-page` |
| `data-tabs` / `data-tab` / `data-tabpanel` | Full ARIA tablist: roving tabindex, arrow keys, `aria-selected` |
| `data-panel-toggle` / `data-panel-group` | Disclosure panels; `data-single` makes the group an accordion |
| `data-confirm="msg"` | Fire-and-forget toast |
| `data-cf-*` | Modal confirmation. `data-cf-match` requires typing a value to confirm — used for destructive actions |
| `data-modal-open` / `data-modal-close` | Focus-trapped modal |
| `data-menu` / `data-menu-trigger` | Dropdown; Escape closes, focus returns to trigger |
| `data-sort`, `data-col`, `data-dir` | Column sort. **Currently string-based — see [§14](#14-open-decisions)** |
| `data-filter`, `data-filtergroup`, `data-filterrow`, `data-empty` | Client-side filtering with an empty state |
| `data-stepper`, `data-step` | Multi-step wizard (enrollment) |
| `data-switch` | ARIA `role="switch"` toggle |
| `data-role`, `data-role-only`, `data-requires-role`, `data-forbids-role` | Role gating — see [§3](#3-roles-and-demo-accounts) |
| `data-theme-toggle` | Light/dark |
| `data-ago` | "Updated Ns ago" ticker — **cosmetic, nothing refreshes** |

### Patient PWA

| Hook | Contract |
|---|---|
| `data-companion`, `data-companion-art`, `data-companion-medal`, `data-companion-word`, `data-companion-copy` | Plant/cat motif. One choice swaps **art, medallions, alt text and copy** everywhere. `-word` substitutes the noun; `-copy="key"` substitutes a whole sentence from the motif's `copy` block — the growth notes and the nine-step journey track read differently for a plant and a cat. **Both motifs must define the same keys**, or one silently inherits the other's wording |
| `data-painscale`, `data-pain`, `data-pain-face`, `data-pain-word` | 0–4 pain scale: emoji face **above** its label, never beside |
| `data-pillgroup` / `data-pill` | ARIA radiogroup — better/same/worse |
| `data-submit-checkin` | Stamps `localStorage["kivie-checkin-day"]`, then goes to exercises |
| `data-ex-log`, `data-ex-target`, `data-ex-plus`, `data-ex-minus`, `data-ex-count`, `data-ex-extra` | Per-exercise logging. **The prescription is a floor** — see below |
| `data-day-count`, `data-finish-day` | Day completion, derived from prescriptions met |
| `data-timer`, `data-ex-timer-toggle` | Exercise timers |
| `data-grow` | Companion growth stage |
| `data-textsize-toggle`, `data-contrast-toggle` | Accessibility controls, persisted |
| `data-count-to`, `data-ms-flight`, `data-ms-page` | Celebration choreography; **all respect `prefers-reduced-motion`** |

### The exercise-logging rule — do not get this wrong

The prescribed count is a **minimum**, never a target to hit exactly:

- `+` on first press logs the **whole prescription** (not one rep)
- `+` beyond that increments freely — **there is no ceiling**
- `−` is **disabled at the prescribed count**. A patient can never log less than
  prescribed; the only route below it is unticking, which is a mis-tap undo, not
  partial credit
- Surplus displays as `"+2 extra"` and is **worth no additional points** (FSD
  §8.3 fixes the points table; paying for extra reps in rehab incentivises
  overexertion)
- `done` is derived from `logged >= target` and never set independently

---

## 9. Accessibility

Substantial work is already done. **Treat this as a floor, not a wish list** —
the patient audience is 60–85 and the platform is regulated.

### Already built

- **Skip link** on every page (WCAG 2.4.1), targeting a `tabindex="-1"` main
- **48px minimum interactive targets** via `--tap-min` (WCAG 2.5.5)
- **Never colour alone** (WCAG 1.4.1) — every status badge carries text
- **Full keyboard support** — tab traps in modals and the nav drawer, Escape to
  close with focus returned to the trigger, arrow-key tablists
- **`aria-live` regions** for anything that changes without a page load:
  exercise counts, filter results, form validation, toasts
- **`prefers-reduced-motion`** honoured throughout, including every celebration
- **Text-size and high-contrast toggles** in the patient app, persisted
- **Labelled controls** — every icon-only button has an `aria-label`; every
  image has `alt` (decorative images have `alt=""`)
- **`role="switch"` / `aria-checked`** on toggles, not styled checkboxes
- **Semantic landmarks** and heading order

### Known gaps you inherit

- **Nothing has been verified with a screen reader or in a real browser.** The
  QA matrix (154 portal + 168 patient checks) has never been run. This is the
  single largest risk in the handover.
- `--st-ready` (the green status colour) is **3.53:1 — below AA**. It affects
  every green badge. `#14714D` passes at 5.2:1. Flagged as a design decision.
- Dark-mode contrast is only partly audited.

---

## 10. The patient PWA

`patient/manifest.json` — installable, `standalone`, `portrait-primary`, with
maskable icons and two shortcuts (check-in, exercises).

### `patient/sw.js` — read the comments before you touch it

| Request type | Strategy | Why |
|---|---|---|
| HTML documents | stale-while-revalidate | Instant open, fresh next load |
| **CSS and JS** | **stale-while-revalidate** | See below |
| Images, fonts | cache-first | Versioned by filename |
| Anything under `/api/` | **never cached** | FSD §3.4 — PHI must not sit in unsecured storage |

> **A defect worth carrying forward as a lesson.** The original build used
> cache-first for CSS and JS, per the delivery plan. Cache-first is correct
> *only when filenames are content-hashed*. These are served at fixed paths, so
> cache-first pinned each device to whatever version it first saw — a style
> change then never reached it. It silently froze the styling of an onboarding
> change mid-review.
>
> **In Next.js you get content-hashed filenames for free**, which makes
> cache-first correct again. If you use `next-pwa` or Workbox, confirm that
> before assuming it.

**No PHI is ever cached.** The fetch handler only caches same-origin GET
requests for static documents and assets, and explicitly skips `/api/`. Keep
this guarantee — it is a compliance requirement, not an optimisation.

`VERSION` is a **cache generation**, currently `kivie-v3`. It has nothing to do
with a portal version; bump it whenever `PRECACHE` or a strategy changes.

### Assets

- **Plant companion**: 3 SVG stages, 4 SVG medallions
- **Cat companion**: 3 SVG stages, 4 SVG medallions
- **All 14 companion assets are vector.** Both motifs render identically at
  every size the app asks for — 44 px in onboarding, 72 px in settings, 176 px
  on the Today hero.
- **The companion art is traced SVG, and it is heavy** — 200–400 paths per file,
  ~3.4 MB across the art directory, with the plant stages the largest. It is
  correct and scalable, but it is not hand-drawn vector. **Run SVGO over it and
  consider `loading="lazy"` on the off-screen stages**; the numbers respond well
  to path simplification.
- **PWA icons** are placeholders drawn from the design system's leaf, not a
  designer export. Replace before launch.

> **A trap if you add art later.** The three cat SVGs arrived with `width` and
> `height` but **no `viewBox`**. An `<img>` sized to 44 px then renders the
> artwork at its intrinsic 500×500 and clips instead of scaling. A `viewBox` was
> added to each. Every SVG in this system carries one — keep that invariant.

---

## 11. What is mocked, and what that implies

Everything. There is no backend, no API, no persistence beyond `localStorage`.

| Storage key | Holds |
|---|---|
| `kivie-provider-theme` | Provider light/dark |
| `kivie-admin-theme` | Admin light/dark |
| `kivie-provider-role` | Signed-in email → role. **Demo only** |
| `kivie-companion` | `plant` \| `cat` |
| `kivie-checkin-day` | Whether today's check-in is submitted |

**Mock data lives inline** — in each page's markup, and in the `NOTIFS` array in
`{portal}/js/app.js`. One array drives the bell so a count can never disagree
with itself; keep that single-source discipline when it becomes an API.

### Things that *look* live but are not

- **The auto-refresh ticker** counts seconds; nothing updates
- **Work-queue cards** are not dismissible, and rows do not exit to Approvals
- **CSV export** has no field/date configuration, progress or failure state
- **Table sorting is string-based**, so dates sort incorrectly
- **Dr. Brain chat** has no streaming, typing, error or cost states
- **Loading skeletons** exist as components but are unused on real screens
- **Every patient link opens John Carter** — 4 of 5 status tiers have no detail
  view built

These are all listed with IDs in `core_docs/gap-analysis.md` §3.

---

## 12. Suggested Next.js architecture

Non-binding, but it follows the shape the prototype already has.

### Three apps, one shared design layer

```
apps/
  patient/     PWA. next-pwa or custom SW. Mobile-first.
  provider/    Physician + Org Admin, role-gated.
  admin/       Platform Administrator.
packages/
  ui/          Components ported from components.css
  tokens/      tokens.css → CSS vars / Tailwind theme
  types/       Shared domain types
```

Separate deployments matter here: the admin console can **export or delete any
patient's PHI**. Keeping it a distinct origin with its own auth is a security
posture, not a preference.

### Non-negotiables

- **Gate roles on the server.** The client-side gating in this prototype
  documents intent; it enforces nothing. A physician must not be able to fetch
  org-admin data by calling the API directly.
- **Session timeout is 15 minutes idle** (FSD §5.1), already prototyped as
  `initIdleTimeout()` → `session-expired.html`. Enforce it server-side too.
- **MFA is mandatory and cannot be disabled** on provider and admin accounts.
- **Patients use magic links**, never passwords.
- **Never render PHI into anything cacheable** — no static generation, no SW
  caching, no CDN caching of authenticated responses.
- **Card data must never touch PAVE servers** (FSD §13.1). The prototype's
  card-entry modal shows a native form; **that is wrong and is a known gap
  (B7.2)** — use Stripe Elements.

### Porting order that de-risks fastest

1. `packages/tokens` — the whole system depends on it
2. Shell + nav + role gating (provider) — proves layout, routing and auth shape
3. One data-heavy screen (Work Queue) — proves tables, filters, sort, empty states
4. Patient daily loop: today → check-in → exercises → confirmation — the
   product's core, and the most interaction-dense path
5. Everything else

---

## 13. Regulatory constraints that shape the UI

These are not styling preferences. Each one is why a screen looks the way it does.

| Constraint | Where it shows |
|---|---|
| **RTM billing (CPT 98975–98981)** | The check-in is the qualifying event and is server-timestamped on submit. Billing windows, 16-day thresholds and review-time logging all key off it |
| **FSD §15.3 five-tier status** | Amber is never red — a patient behind on their plan is not an alarm |
| **FSD §3.4 PHI handling** | No PHI in the service-worker cache, in URLs, or in analytics |
| **FSD §5.1 auth** | MFA mandatory for staff; magic links for patients; 15-minute idle timeout; all logins logged |
| **MDR complaint register** | 6-year retention. Intake is admin-only *by design*, so severity is judged by someone qualified |
| **Post-approval plan immutability** | A plan is frozen once approved (FSD §17.2). The prototype violates this on `patient.html` — a known gap |
| **Stripe-only card handling** | Card data never touches PAVE servers (FSD §13.1) |
| **Immutable audit trail** | Every PHI access and admin action is logged |

---

## 14. Open decisions

**These block or change work. Get answers before estimating.** Full list with
recommendations in `core_docs/gap-analysis.md` §1.

| # | Decision | Impact |
|---|---|---|
| 1 | **Responsive scope** — FSD §16.1 says desktop-only at 1100px; the build is fully responsive | Spec amendment, or a large simplification |
| 2 | **Dark mode** — FSD §17.2 says out of scope; it is shipped in two portals | Doubles the QA matrix to 308 checks |
| 3 | **Post-approval plan editing** — `patient.html` allows it; the FSD forbids it | Compliance |
| 4 | **Org Admin's alternative view** — the gate is built; what they see *instead of* a clinical record is not designed | New design work |
| 5 | **Brand name** — `PAVE` in docs, `Kivie` in code, logos, titles, storage keys and ~60 strings | Blocks copy consolidation and i18n |
| ~~6~~ | ~~**Cat art format**~~ — ✅ **resolved 18 Aug**: all three stages are now SVG | — |
| 7 | **`--st-ready` contrast** — 3.53:1, below AA, on every green badge | Accessibility |
| 8 | **Complaint intake channel** — no designed way for anyone to *raise* one | Regulatory register with no inbound door |
| ~~9~~ | ~~**Dr. Brain training permission**~~ — ✅ **settled**: the platform admin grants it per provider; the provider portal deliberately has no Dr. Brain surface. The grant is recorded, not yet wired to one | — |
| 10 | **Surplus reps** — built as *no extra points*. Confirm or reverse | One line |
| 11 | **The 750-point stage target** — not in the FSD; needs a source of truth | Product |

### Scope warning

The Delivery Planner budgets a designer for **15 screens**. The real surface is
**39 feature screens**. This is not scope creep — five patient auth/support
files sit under one FSD "screen", the admin console was never budgeted at all,
and two FSD-mandated provider screens are missing from its own page count.
**Re-baseline before committing to a timeline.**

---

## 15. Verification harness

The prototype was validated statically throughout. The checks worth recreating
as CI in the Next.js build:

- **Tag nesting** — a real tag-matcher, not tag counting. Counting passes on
  `</section></div>` written in the wrong order; nesting does not. This caught
  two live bugs.
- **Every local link and asset resolves** — including hrefs assembled in JS, and
  every cross-page `#fragment` landing on a real `id`.
- **Inline script syntax** on every page.
- **Boot-order integrity** — every function called at startup is defined exactly
  once. A duplicate definition silently destroyed a working function once.
- **Classes used in markup have a CSS rule.**
- **Accessibility floor** — every image has `alt`; every icon-only button is
  labelled.
- **Behaviour tests that read the shipped source** rather than restating the
  logic — e.g. the exercise stepper's state machine is extracted from
  `exercises.html` and driven directly, so the test cannot drift from the code.

---

## 16. Definition of done

Before this can be called ported:

- [ ] **Run the QA matrix in a browser** — 154 portal + 168 patient checks,
      never executed. Largest single risk in the handover.
- [ ] **Screen-reader pass** on both portals — NVDA/JAWS and VoiceOver
- [ ] **Keyboard-only pass** — every flow completable without a mouse
- [ ] Real auth: IdP integration, server-side role resolution, server-side gating
- [ ] Real API; every mock in [§11](#11-what-is-mocked-and-what-that-implies) replaced
- [ ] PWA icons replaced with designer exports
- [ ] `--st-ready` contrast resolved
- [ ] Brand name settled and applied consistently
- [ ] All 11 decisions in [§14](#14-open-decisions) answered

---

## A note on reading the code

Comments in this prototype explain **why**, not what. Where a decision
contradicts the FSD, the reasoning is written down next to it. Where something
is a known defect, it says so. Where a value is arbitrary, it says that too.

Before changing something that looks odd, search for a comment near it —
several of the odd-looking choices are load-bearing.
