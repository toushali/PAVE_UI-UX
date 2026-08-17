# PAVE — Session-wise Build Plan
### Closing the gaps in `pro1/` · `admin/` · `v1/` · `v2/`

> **Date:** 14 Aug 2026
> **Companion doc:** [gap-analysis.md](gap-analysis.md) — the *what* and *why* (Provider + Admin). This file is the *in what order*.
> **New in this file:** a responsiveness audit of **all four** surfaces, including the patient PWAs (`v1`, `v2`), which the gap analysis did not cover.
> **Note:** `pave_ui.md` (the patient-app UI spec) has been removed from `core_docs/`.
> Citations to it below are retained as the provenance for each patient-app requirement —
> the relevant content is quoted inline, so no finding depends on the file being present.
>
> **Unit of work:** a **session** = one focused working block with a single theme, its own definition-of-done, and no half-finished state left behind. Day ranges are indicative (design + front-end combined).

---

## 1. How to use this plan

1. **Sessions are ordered by dependency, not by importance.** S1 unblocks almost everything; do not skip it.
2. Two tracks run **in parallel** — the Portal track (S1–S12, provider + admin) and the Patient track (S13–S16, v1 + v2). They share no files.
3. Every session ends with its **Definition of done** checked against the [QA matrix](#8-responsive-qa-matrix). A session is not done because the code changed; it is done because the matrix passes for the screens it touched.
4. **Four decisions block specific sessions** — see [§9](#9-decisions-that-block-sessions). Get them answered before those sessions start, not during.

---

## 2. Responsiveness audit — all four surfaces

### 2.1 Scoreboard

| Surface | Files | Width-based `@media` rules | Verdict |
|---|---|---|---|
| **Provider** `pro1/` | 15 screens | **3** (padding at 1024, login at 860, revenue at 900) | ❌ Desktop-only |
| **Admin** `admin/` | 7 screens | **2** (login at 860, revenue at 900 — unused) | ❌ Desktop-only |
| **Patient v1** `v1/` | 17 screens | **1** (`min-width: 480px`) | ⚠️ Mobile-only, and it **breaks in landscape** |
| **Patient v2** `v2/` | 17 screens | **1** (identical) | ⚠️ Same — `tokens.css`, `base.css`, `app.js` are **byte-identical** to v1 |

> `v1` and `v2` share `tokens.css`, `base.css` and `app.js` byte-for-byte; `components.css` differs by only 33 lines. **Every patient finding below applies to both, and every fix lands in both.**

### 2.2 Provider & Admin — summary

Detailed in [gap-analysis §A](gap-analysis.md#section-a--responsive-design-gaps). Headlines: fixed 236 px sidebar with no collapse; tables with no scroll container; `.kpigrid`/`.grid-2`/`.form2`/`.qrow__main` locked to fixed tracks; modals with no `max-height`; touch targets 32–38 px against M6's 48 px requirement; ~60 inline `style` attributes carrying layout decisions that media queries cannot override.

Both portals share one stylesheet lineage — `admin/css/*` is a copy of `pro1/css/*` minus the plan-editor block — so **every CSS fix in S1–S5 must be applied to both**, or they will drift.

### 2.3 Patient v1 / v2 — what is genuinely good

Worth stating plainly, because the patient app is **ahead of the provider portal** on the things that matter for its audience:

| ✅ | Evidence |
|---|---|
| Touch targets meet spec | `--tap-min: 48px`, `--tap-btn: 60px`, `--tap-hero: 72px` (`tokens.css:96-99`) — the provider portal's are 32–38 px |
| Type floor respected | `--fs-body: 18px`, `--fs-caption: 16px`, nothing smaller (pave_ui.md §9) |
| Accessibility modes shipped | `.text-lg` (+15 %), `.text-sm`, `.high-contrast` as token overrides (`tokens.css:111-140`) |
| Dynamic viewport units | `100dvh` with `100vh` fallback on `body` and `.app` — the provider portal uses `100vh` only |
| Safe-area handling | `padding: … max(var(--sp-2), env(safe-area-inset-bottom))` on `.tabbar` — the provider portal has none |
| Reduced motion | Guarded in 11 places plus inside the animated SVG assets |
| Real week grid | Streak calendar is `repeat(7, 1fr)` — the provider's billing calendar is `repeat(10, 1fr)` and doesn't align to weekdays |
| Fluid pain scale | `repeat(auto-fit, minmax(44px, 1fr))` |
| Always-visible nav | Bottom tab bar, icon **+** label, no hamburger — exactly per pave_ui.md §2.3 |

### 2.4 Patient v1 / v2 — findings

| ID | Finding | Sev |
|---|---|---|
| **PT-1** | **Landscape breaks the app.** `base.css:149` is `@media (min-width: 480px)` — **width-only**. Every phone in landscape is ≥ 480 px wide (iPhone SE 667, Pro Max 844), so **rotating the device switches the app into desktop device-mock mode**: a 390 px column on a grey `#E6EAE6` backdrop, height `min(844px, 100dvh − 32px)` ≈ 358 px. A patient who rotates their phone sees the app shrink into a box. Fix: gate the frame on `min-width: 480px` **and** `min-height: 700px`, or on `(pointer: fine)`. | 🔴 |
| **PT-2** | **No tablet layout — the app is mobile-*only*, not "mobile-first responsive."** FSD §16.2 says *"Mobile-first **responsive** — primary use case is smartphone via PWA."* At ≥ 480 px the app becomes a fixed **390 × 844 phone mock**, so on an iPad it is a small phone in a grey field. **Adults 60–85 are disproportionately tablet users** — this is a product gap, not a prototype-styling choice. Needs a real ≥ 768 px layout (wider content column, larger art, two-up cards on Progress/Rewards). | 🔴 |
| **PT-3** | **`--content-max: 440px` never binds.** The frame is 390 px, so the token is dead inside it — nothing caps content once the frame is removed for tablet (PT-2). | 🟡 |
| **PT-4** | **Illustration and control sizes are fixed px.** Hero ring 200×200, timer ring 200×200 (dead CSS — see PT-8), garden plant 152, medals 168/144/128/104, check-in plant 120×132. Fine at 390 px; they neither shrink at 320 px (Galaxy Fold cover, iPhone SE 1st gen — 200 px ring + 40 px page padding leaves 80 px of slack) nor grow on tablet. Needs `clamp()`/`min()`. | 🟠 |
| **PT-5** | **No PWA manifest, no service worker, no icons.** Nothing in the repo: no `manifest.json`, no `sw.js`, no `apple-touch-icon`, no `apple-mobile-web-app-capable`, no `apple-mobile-web-app-status-bar-style`. `theme-color` is present ✅. FSD §5.2 and §17.1 make the PWA a **core MVP deliverable**, and `splash.html` actively coaches the patient through "Add to Home Screen" — **for an app that cannot currently be installed**. pave_ui.md §1 scopes the *service worker* out of the static prototype, but the manifest, icons and meta tags are static assets and should exist for the install flow to demo truthfully. | 🟠 |
| **PT-6** | **Two hard-coded viewport heights.** `.app { height: 100dvh }` is right ✅, but `min(844px, …)` and the 200 px rings mean short viewports (landscape, or a 667 px-tall SE with browser chrome) clip the check-in hero and the confirmation overlay. | 🟡 |
| **PT-7** | **Frame chrome would ship to production.** The 390 px rounded border, `#E6EAE6` backdrop and drop shadow are *prototype presentation*, not product. They must be behind a flag or removed before build, or a desktop patient gets a decorative phone bezel. | 🟡 |
| **PT-8** | *(Resolved — decision, not a gap)* **Exercise Detail is an in-page popup, and that stands.** The earlier spec described a separate `exercise-detail.html` slide-up sheet with a large countdown ring. What is built is a popup inside `exercises.html` carrying the same payload — illustration, guidance, timer, mark-as-done — with no route change and no back-stack for a 60–85 audience. **Decided 14 Aug 2026: keep the popup.** Only consequence: the unused 200 px `.timer__ring` rule is now dead CSS — delete it in **S15**. | ✅ |

---

## 3. Session index

| # | Session | Track | Depends on | Est. |
|---|---|---|---|---|
| ~~S1~~ | ~~De-inline layout styles + breakpoint tokens~~ ✅ | Portal | — | *done* |
| ~~S2~~ | ~~Portal re-placement (E.0)~~ ✅ | Portal | — | *done* |
| ~~S3~~ | ~~Responsive app shell — sidebar → rail → drawer~~ ✅ | Portal | S1 | *done* |
| ~~S4~~ | ~~Top-bar account + notification menus (D.6)~~ ✅ | Portal | S3 | *done* |
| ~~S5~~ | ~~Layout primitives — the fixed grids~~ ✅ | Portal | S1 | *done* |
| ~~S6~~ | ~~Data tables — scroll, priority, card fallback~~ ✅ | Portal | S1, S5 | *done* |
| ~~S7~~ | ~~Overlays, forms, touch targets, charts~~ ✅ | Portal | S1, S5 | *done* |
| ~~S8~~ | ~~Confirmations on destructive actions~~ ✅ | Portal | — | *done* |
| ~~S9~~ | ~~Empty / loading / error states + validation~~ ✅ | Portal | S5 | *done* |
| ~~S10~~ | ~~Provider auth completion~~ ✅ | Portal | S3 | *done* |
| ~~S11~~ | ~~Admin missing screens~~ ✅ | Portal | S2, S9 | *done* |
| ~~S12~~ | ~~Accessibility pass~~ ✅ | Portal | S3–S7 | *done* |
| ~~S13~~ | ~~Unify v1+v2 → one portal + Choose your companion~~ ✅ | Patient | — | *done* |
| ~~S14~~ | ~~Patient landscape + short-viewport fix~~ ✅ | Patient | S13 | *done* |
| ~~S15~~ | ~~Patient tablet layout~~ ✅ | Patient | S14 | *done* |
| ~~S16~~ | ~~PWA installability~~ ✅ | Patient | S13 | *done* |
| **S17** | Content reconciliation + full QA sweep | Both | all | 1.5–2 d |

**Critical path:** S1 → S3 → S4 → S12 → S17
**Parallelisable immediately:** S2, S8 (no dependencies) · S13 unblocks the whole Patient track and needs only a decision

```
Portal   S1 ──┬── S3 ── S4 ─────────┐
              ├── S5 ──┬── S6 ──────┤
              │        └── S7 ──────┼── S12 ──┐
         S2 ──┴─────────── S11 ─────┤          │
         S8 ───────────────────────-┤          ├── S17
         S9 ────────────────────────┤          │
              S3 ── S10 ────────────┘          │
Patient  S13 ─┬─ S14 ── S15 ───────────────────┤
              └─ S16 ──────────────────────────┘
```

---

## 4. Portal track — foundations

### S1 · De-inline layout styles + breakpoint tokens  ✅ **DONE — 14 Aug 2026**
**Why first:** ~60 inline `style` attributes carry layout decisions (`grid-template-columns:120px 1fr auto`, `max-width:420px`, `width:auto`, `font-size:44px`). **Inline styles beat media queries** — every later session is blocked or forced into `!important` until these are classes. *(gap-analysis A8.4, A8.1, A8.2)*

**Files:** `pro1/css/tokens.css`, `pro1/css/components.css`, all 15 `pro1/app/*.html`, mirrored to `admin/`

**Tasks**
- [ ] Add `--bp-sm: 640px`, `--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1280px` and document the ladder in a comment block
- [ ] Make `--sidebar-w`, `--topbar-h`, `--content-max`, `--page-pad` overridable per breakpoint
- [ ] Introduce fluid type/spacing where it earns it: `--fs-h1`, `--fs-display`, `--page-pad` via `clamp()`
- [ ] Sweep every `style="…"` carrying layout (width, grid, flex, max-width, font-size) into a utility or component class; leave only genuine one-off colour tokens
- [ ] Re-run the sweep on `admin/` — **diff `pro1/css/components.css` against `admin/css/components.css` at the end of every CSS session** and keep the delta to the plan-editor block alone

**Done when:** `grep -c 'style="' pro1/app/*.html admin/app/*.html` returns only colour/one-off cases; a single media query in `components.css` can visibly re-lay-out any screen without `!important`.

---

### S2 · Portal re-placement  ✅ **DONE — 14 Aug 2026**
**Why early:** it changes *which pages exist in which portal*, so doing it after the shell work means building the shell twice. *(gap-analysis E.0, C11, C11a, B7.5a)*

**Tasks**
- [ ] Move `pro1/app/api-costs.html` → `admin/app/api-costs.html`; fix relative asset paths
- [ ] Remove the `api-costs` entry from `pro1/js/app.js:32`; add it to the admin `NAV` array
- [ ] De-duplicate §12 against the "AI & token usage" tab in `admin/app/reports.html` — API costs becomes the finance system-of-record (all six services, budgets, per-event log, accounting CSV); the §14.3 tab keeps AI-specific token attribution, cross-linked
- [ ] Add the practice-scoped §14 slice to `pro1/app/org-admin.html`: login frequency, avg review time, claim-approval rate, plan-approval time (§14.1); dropout indicators 7/14/30 days (§14.2)
- [ ] Rename for clarity: **"Billing reports"** (provider) · **"Platform reports"** (admin)

**Done when:** no provider-facing screen displays PAVE's vendor spend; Org Admin shows practice-scoped activity metrics; the two "Reports" are distinguishable by name.

---

## 5. Portal track — responsive retrofit

### S3 · Responsive app shell  ✅ **DONE — 14 Aug 2026**
*(gap-analysis A1.1–A1.6, A1.4)*

**Tasks**
- [ ] Implement the four-state shell:
  - `≥1280px` sidebar 236 px expanded · content capped 1100 px
  - `1024–1279` sidebar expanded · content fluid
  - `768–1023` **icon rail 68 px** with accessible tooltip labels
  - `<768` **off-canvas drawer** — hamburger, scrim, focus trap, Esc-to-close, body-scroll-lock, focus restore
- [ ] Top bar: absorb `topbar__meta` (name/org) into the account menu; hide the auto-refresh ticker < 768 px; keep title + hamburger + bell + avatar
- [ ] Add a **skip-to-content** link ahead of the 11 nav items
- [ ] Group the 11 nav items (Clinical · Business · Admin) — required for the rail to be legible
- [ ] Move the prototype-switcher FAB out of the drawer-trigger's corner, or hide it < 768 px
- [ ] Apply identically in `admin/js/app.js` (6 nav items)

**Done when:** every screen is navigable at 390 px with no horizontal page scroll from the shell; keyboard can open, traverse and close the drawer without losing focus.

---

### S4 · Top-bar account + notification menus  ✅ **DONE — 14 Aug 2026**
*(gap-analysis D.6 — full spec there)*

**Tasks**
- [ ] Convert `<span class="avatar">` → `<button>` in both portals; build the account menu (identity block · My profile · Settings · notification prefs · help · **Sign out**)
- [ ] Build the notification panel: unread **count** in the dot, Unread/Today/Earlier grouping, badge vocabulary reused from `reminders.html`, footer (Mark all read · Settings · View all), empty state
- [ ] Wire the admin feed to the Overview "Needs attention" data source; single source of truth for all counts — including the hardcoded sidebar badges at `pro1/js/app.js:26-29` *(D3.5)*
- [x] Settle the three-surface split *(D6.3)*: bell = peek · Reminders = history + triage · Settings = channels only — the bell footer now points "View all" at Reminders and "Notification settings" at Settings. *(Admin has no preferences screen until S11, so it shows "View all alerts" → Overview and no settings link.)* Removing the duplicated Settings controls remains an S17 item
- [ ] Extend `initMenus()` rather than adding a third dropdown pattern; right-aligned variant with collision handling *(A6.4)*
- [ ] Below 768 px both render as bottom sheets

**Blocked by decision:** "Switch organization" — only if a provider can belong to >1 org *(§9)*. Admin "Settings" item has no destination until **S11**.

**Done when:** a user can sign out of both portals; the bell opens a readable feed with an accurate count; both work as sheets at 390 px.

> **As built (S9/S10 additions):** two new screens per portal — `404.html` and `session-expired.html` — bring the counts to 16 provider / 10 admin. Both are error/session states rather than features, so gap-analysis AB.2 and AB.4 keep their feature counts of 14 and 11.

---

### S5 · Layout primitives  ✅ **DONE — 14 Aug 2026**
*(gap-analysis A2)*

| Class | To |
|---|---|
| `.kpigrid` | `repeat(auto-fit, minmax(200px, 1fr))` → 4/2/1 |
| `.grid-2` | 1 col < 900 px |
| `.form2` | 1 col < 640 px |
| `.qrow__main` | stack < 900 px |
| `.threshrow` | fluid label, wrap < 560 px |
| `.revout` | 1 col < 900 px (the outer `.revgrid` is already handled) |
| `.sumrow dt` | stacked dt/dd < 560 px |
| `.cal` | `repeat(7, 1fr)` week grid — **borrow the patient app's**, which already does this correctly |
| `.panelclaim` | stack < 600 px |
| `.search input` | `width: 100%; max-width: 260px` |
| `.chatwrap` | `min-height` + `dvh` |

**Done when:** no fixed-track grid remains in `components.css`; KPI numbers never clip.

---

### S6 · Data tables  ✅ **DONE — 14 Aug 2026**
*(gap-analysis A3)* — `.qtable` appears on **17 of 22 screens**; this is the single highest-volume fix.

**Tasks**
- [ ] Wrap every table in an `overflow-x: auto` container with a min-width and edge-fade affordance
- [ ] Column-priority system (`data-priority="1|2|3"`) — declare which columns survive 768 px
- [ ] **Stacked card fallback < 600 px** ("label: value" rows) — an 8-column table is unreadable even with scroll
- [ ] Sticky `thead` for long tables (patients, HIPAA audit)
- [ ] `.wqpanel__inner` expandable rows: explicit stack order, full-width primary action on narrow
- [ ] Design a pagination / load-more pattern — 48-patient panels, 154-patient orgs, 6-year audit logs *(A3.5, B5.8, C5)*

**Done when:** no table causes page-level horizontal scroll at any breakpoint; every table is readable at 390 px.

> **As built:** sticky `thead` is opt-in via `.tablewrap--tall` rather than global. A plain
> `overflow-x` container computes `overflow-y: auto`, which makes it the scroll parent and
> kills viewport-relative stickiness — so stickiness is scoped to tables that declare a max
> height (patients, HIPAA PHI-access). The scroll affordance is an inset box-shadow, not a
> floated pseudo-element, so it cannot disturb table layout.

---

### S7 · Overlays, forms, touch targets, charts  ✅ **DONE — 14 Aug 2026**
*(gap-analysis A4, A5, A6, A7)*

**Tasks**
- [ ] Modals: `max-height`, internal scroll, sticky footer, `dvh` not `vh`; **bottom sheets < 640 px**
- [ ] Toast: queue/offset so multiple banners don't stack on identical coordinates; keep clear of the top bar on mobile
- [ ] `@media (pointer: coarse)`: all controls ≥ 44 px, primary ≥ 48 px — `.btn` (38), `.btn--sm` (32), `.iconbtn` (38), `.chipopt` (34), `.switch` (26), `.stepper button` (34), `.alertbar__x` (24)
- [ ] `env(safe-area-inset-*)` on drawer, sticky footers, FAB — **copy the patient app's `.tabbar` approach**
- [ ] Enrollment stepper: compact "Step 2 of 4" + progress bar < 620 px; sticky wizard footer on mobile
- [ ] `inputmode` / `autocomplete` on phone, minutes and money inputs
- [ ] Charts: fluid axis labels (or drop to 3 at narrow), single-column stacking, `.trend` label collision, `.spark` aspect distortion

**Done when:** no control under 44 px on a coarse pointer; no modal traps its own footer off-screen.

---

## 6. Portal track — correctness & completeness

### S8 · Confirmations on destructive actions  ✅ **DONE — 14 Aug 2026**
*(gap-analysis D.1, B5.1, B7.6, B7.10, B4.1)* — **no dependencies; can start day one.**

Every one of these is currently **one click → toast**, irreversible:
- [ ] Approve claim · **Batch approve all** · Approve plan
- [ ] Deactivate provider · Reassign patient (state the billing-window consequence)
- [ ] Promote model to production · Roll back *(§10.4 requires documented human sign-off)*
- [ ] Remove KB source · Mark complaint resolved
- [ ] Pattern reference: the PHI-delete type-to-confirm modal is correct — **match it**, scaling friction to consequence

---

### S9 · Empty / loading / error states + validation  ✅ **DONE — 14 Aug 2026**
*(gap-analysis D.1, B3.1, C9)* — the library already defines `.spinner`, `.skeleton`, `.errmsg`; **no screen uses them.**

- [ ] **Empty:** patients (none yet / no results), both work queues, reports, historical records, reminders, KB, activity history, all 5 audit tabs, complaints, data requests, per-event log
- [ ] **Loading:** first-paint skeletons, table loading, chart loading, and a **real** Dr. Brain generation state with timeout + failure paths *(B3.6 — currently a 1.4 s fake)*
- [ ] **Error:** failed save, network loss, export failure, plan-generation failure, invalid OTP, 404/500 pages
- [ ] **Validation:** enrollment wizard (M2 §4 "each field validated before advancing"), settings, complaint intake, invite provider, budget limits, resolution record
- [ ] **Disabled:** contextual action states — no "Approve plan" on an already-approved plan
- [ ] Enrollment **save-draft** — a 15-min idle timeout currently destroys in-progress work *(B3.7)*

---

### S10 · Provider auth completion  ✅ **DONE — 14 Aug 2026**
*(gap-analysis B6.1–B6.6)*

- [ ] First-time **MFA enrolment** (QR + secret + recovery codes), per FSD §5.1
- [ ] **Account locked** after 5 failed attempts + self-service email unlock
- [ ] OTP **error state** with attempt counter
- [ ] **Idle-timeout warning** modal + session-expired screen (the patient app has one; the provider portal doesn't)
- [ ] "Lost your device?" recovery flow; OAuth failure / consent-denied

---

### S11 · Admin missing screens  ✅ **DONE — 14 Aug 2026**
*(gap-analysis C1, C2, C3, C4, C5, C6, C7, C8, C10)*

- [ ] **Provider accounts** — platform-wide list, create/suspend, MFA reset *(FSD §4)*
- [ ] **Organizations** — list, plan, patient count, suspend *(§2.2)*
- [ ] **Data requests: pending queue** — intake → triage → approve/reject workflow *(§3.4)*; today the page shows only completed history while Overview claims 1 pending
- [ ] **Platform settings** — budget thresholds, retention policy, regulatory contact, vendor/BAA register *(§12.2, §14)*
- [ ] **Date-range pickers** on all reports and audit logs; replace the substring filter *(§14.5)*
- [ ] Audit-log **faceted** filters (actor, action type) — date range and pagination are done; facets remain
- [x] MDR escalation: the named recipient of record and reporting deadline now live in Platform settings; the per-MDR reference number and submission record remain
- [x] AI Governance lookup: idle / not-found / multi-result / record states — done 14 Aug 2026
- [ ] Consider a stronger visual identity for a console that can permanently delete PHI *(C13)*

---

### S12 · Accessibility pass  ✅ **DONE — 14 Aug 2026**
*(gap-analysis D.2)*

- [ ] Tabs → `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, arrow keys (Patient Detail 5, Admin Reports 3, HIPAA Audit 5)
- [ ] Sortable headers → focusable buttons + `aria-sort`
- [ ] Modals → `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap + restore
- [ ] Panels → `aria-expanded` / `aria-controls`; menus → `aria-haspopup`, `role="menu"`, arrow keys
- [ ] Remove colour-only status: `contact-yes/no` ✓/✗ glyphs, `.num.under` *(WCAG 1.4.1)*
- [ ] Live regions for auto-refresh, filter counts, row removal
- [ ] `.badge--ontrack` white-on-white — documented exception or stronger border *(D2.8)*
- [x] Dark-mode meta text lifted above AA — `--c-ink-3` went `#6C7772` → `#8B9791` (~3.8:1 → ~5.7:1 on `--c-surface`). A **full** dark palette audit still depends on decision 2
- [ ] Verify with a real screen reader and keyboard — roles and focus order are wired but unproven in a browser
- [ ] **Decide on `--st-ready`** (gap-analysis D2.8a): the green status badge is 3.53:1, under AA. `#14714D` would pass at 5.2:1, but it is an FSD §15.3 status colour — a design call, not a bug fix

---

## 7. Patient track — v1 + v2

> **After S13 there is one patient portal** carrying a runtime companion switch. Until then, apply every change to **both** `v1/` and `v2/` — `tokens.css`, `base.css` and `app.js` are byte-identical, so keep them that way and diff at the end of each session.

### S13 · Unify `v1`+`v2` into one portal with a **Choose your companion** option  ✅ **DONE — 14 Aug 2026**

**Supersedes the earlier "retire one variant" plan.** `v1` and `v2` are not competing designs to choose between — they are the *same* portal carrying two different **companion motifs**. Ship one portal and let the patient pick.

**The choice:** 🌱 **Plant** or 🐱 **Cat**. The companion is the streak/recovery metaphor — it grows as the streak grows — and it carries the reward medallions with it.

**Surfaced in two places**
- **Onboarding**, as a step in the first-run flow — a warm, low-stakes choice that earns engagement before the first check-in
- **Settings**, changeable at any time, with no loss of streak, points or badges

#### What actually differs today

| | `v1` — Plant | `v2` — Cat |
|---|---|---|
| Art | Inline **SVG**, 3 files + 3 in `myart/` | Raster **PNG**, 3 files |
| Growth stages | **5** (`data-stage` 1–5, additive `data-grow` layers) | **3** (kitten → young → wise, `<img src>` swap) |
| Mechanism | CSS layer reveal inside one inline SVG | JS swaps the image source |
| CSS delta | 33 lines in `components.css` — the stage-layering block + `.celebrate .plant` sizing + a reduced-motion guard | — |
| Everything else | `tokens.css`, `base.css`, `app.js` **byte-identical** | |

**Companion appears on 9 screens:** `today` · `confirmation` · `progress` · `rewards` · `notifications` · `splash` · `login` · `onboarding` · `session-expired`.

#### Tasks

**Foundation**
- [ ] Pick the survivor directory (either works — `v1` has the richer stage model); delete the other **after** lifting its art across
- [ ] Move `cat-1-kitten / cat-2-young / cat-3-wise` into the survivor's `assets/art/`
- [ ] Add `data-companion="plant|cat"` on `<html>`, set by a **pre-paint bootstrap script** in every `<head>` — mirror the provider portal's theme bootstrap so the companion never flashes on load
- [ ] Persist to `localStorage` (`kivie-companion`), default `plant`
- [ ] Normalise the two into **one `.companion` component**: `<div class="companion" data-stage="1..5">`, with the plant path keeping its CSS layer reveal and the cat path swapping `src` — one contract, one call site per screen

**The chooser**
- [ ] **Onboarding step** — two large cards, side by side, each showing the companion at a mid growth stage. ≥48 px targets, icon **+** text label, no default pre-selected trap. Copy frames it as company, not configuration: *"Who's keeping you company?"*
- [ ] **Settings row** — same two options, current one marked; switching re-renders live with the gentle scale-pulse, never a page reload
- [ ] Announce the change politely for AT (`aria-live="polite"`), and honour `prefers-reduced-motion`

**Medallions**
- [ ] Today's badge art (`badge-bronze/gold/platinum/locked.svg`, plus the `myart/` set) is **companion-agnostic** — one shared set
- [x] Second medallion set — **the designed cat medallions already existed in `v2/assets/art/` (paw emblem)** and were imported as `badge-*-cat.svg`; v1's leaf originals became `badge-*-plant.svg`. All four tiers, both motifs
- [x] Locked/earned states exist for both sets (bronze · gold · locked · platinum)

**Cleanup**
- [ ] Update root `index.html` and the prototype-switcher in `js/app.js` (both portals) — four entries become three
- [ ] Remove `illustrations-animated.html` — a design-reference page, not a product screen (gap-analysis AB.3)
- [x] Assets cleaned: 48 → 27 files. Removed unused icon/illustration libraries, superseded `myart/` duplicates and the unsuffixed badge copies. `pain-face-1/3` were **retained** — they are referenced dynamically (`app.js:204`) and a static scan wrongly called them unused
- [x] Fixed a companion leak: `notifications.js` hard-coded plant art, so a cat patient saw a plant in notification previews
- [ ] Update gap-analysis AB.3 / AB.6 to the single-portal count

#### Two design calls this forces *(§9 decision 7)*

1. ~~**Stage count.**~~ ✅ **Resolved by inspection, not by decision.** Both motifs ship **three** art files, used identically across the 9 companion screens. The five-stage `data-stage`/`data-grow` layering in `components.css` was an earlier iteration that **no markup ever referenced** — dead CSS, now deleted. Nothing selects a stage by streak length either. The build is three-stage; the plan's premise was wrong.
2. **Raster vs vector.** Cat art is PNG; every other illustration in the app is SVG. PNG will not scale crisply for the S15 tablet layout, where companion art grows. **Recommendation: redraw the cat as SVG** — otherwise tablet gets a soft, heavier image next to crisp vector everywhere else.

**Done when:** one patient portal remains; a patient can pick Plant or Cat at onboarding and change it in Settings; the choice persists, applies before paint, and swaps both the streak companion and the reward medallions across all 9 screens.

### S14 · Landscape + short-viewport fix *(PT-1, PT-6)*  ✅ **DONE — 15 Aug 2026**
**No dependencies. Highest value-per-hour in the whole plan.**
- [ ] Gate the device frame on height as well as width: `@media (min-width: 480px) and (min-height: 700px)` — or on `(pointer: fine)`
- [ ] Verify 390×667, 667×390, 844×390, 320×568
- [ ] Audit the check-in hero and confirmation overlay for clipping on short viewports
- [ ] **Done when:** rotating a phone no longer collapses the app into a device mock

### S15 · Tablet layout *(PT-2, PT-3, PT-4, PT-7)*  ✅ **DONE — 15 Aug 2026**
- [ ] Real `≥768px` layout — retire the fixed 390 px frame in favour of a fluid column honouring `--content-max`, widened for tablet
- [ ] Two-up cards where they earn it (Progress stats, Rewards badge grid); tab bar stays bottom-anchored and always visible
- [x] Fixed art converted to `clamp()` — companion, medallion and sheet art now scale with viewport, with a floor for 320px and a ceiling at the original size
- [ ] Put the prototype frame chrome (bezel, `#E6EAE6` backdrop, shadow) behind a `?frame=1` flag so it never ships
- [ ] Delete the unused 200 px `.timer__ring` rule — dead CSS since Exercise Detail was settled as an in-page popup (PT-8)
- [ ] **Done when:** an iPad renders a genuine tablet layout, not a phone in a grey field

### S16 · PWA installability *(PT-5)*  ✅ **DONE — 15 Aug 2026**
**No dependencies.**
- [ ] `manifest.json` — name, short_name, `start_url`, `display: standalone`, theme/background colour, icon set (192/512 + maskable)
- [ ] `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` in every `<head>`
- [x] Icon assets generated at 192/512 (any + maskable), 180 apple-touch, 32 favicon. **Placeholder art**: `logo.svg` is a 742×227 wordmark and cannot be a square icon, so the icon is drawn from the design system's own leaf bezier on `--pine`. Swap for a designer export before launch
- [x] Service worker **built** — cache-first assets, stale-while-revalidate HTML, offline fallback. It explicitly **never caches PHI**: non-GET, cross-origin and any `/api/` path are skipped, since a service-worker cache is exactly the 'unsecured location' FSD §3.4 forbids
- [ ] **Done when:** `splash.html`'s "Add to Home Screen" coaching describes something that actually happens

---

## 8. Responsive QA matrix

Run for **every** screen a session touched.

| Breakpoint | Proxy | Verify |
|---|---|---|
| 1440 | Desktop | Content capped 1100 px, centred |
| 1280 | Laptop | Sidebar expanded · queues side-by-side · charts 2-up |
| 1024 | Small laptop / iPad landscape | Rail or expanded · tables intact · KPI 4→2 |
| 768 | iPad portrait | Drawer nav · KPI 2-up · grids 1-col · tables scroll |
| 390 | iPhone | Drawer · stacked cards · sheets not modals · 48 px targets |
| 390×667 | Short viewport | `dvh` correct · modals reachable · **patient app not in device-mock mode** |
| 320 | Fold cover / SE1 | No overflow · art scales down |

**Portal:** 22 screens × 7 = **154 checks.**
**Patient:** 15 screens × 7 = **105 checks**, plus a **companion axis** on the 9 screens that show it (today · confirmation · progress · rewards · notifications · splash · login · onboarding · session-expired) = **+63**, so **168 total**.
Before S13 the same coverage costs **210** across two directories and delivers only one motif per build — which is the argument for doing S13 first.

Add a `+ dark mode` axis **only** if that decision lands in favour of keeping it — it doubles the portal matrix to 308.

---

## 9. Decisions that block sessions

| # | Decision | Blocks | Ref |
|---|---|---|---|
| 1 | **Responsive scope** — amend FSD §16.1 (currently "desktop-optimized, 1100 px"). Recommendation: full responsive to 768 px; deliberate "essential actions" subset below | S3, S5, S6, S7 | gap-analysis E.1.1 |
| 2 | **Dark mode** — in or out (out per FSD §17.2, but shipped) | S12 (doubles the a11y audit and QA matrix) | D5.1 |
| 3 | **Post-approval plan editing** — in or out (out per §17.2, but shipped on `patient.html`) | S8, S9 | D5.2 |
| 4 | **Org Admin clinical-record restriction** — §4 says Org Admins cannot access patient clinical records; no restricted view is designed | S3 (nav), S11 | B7.7 |
| 5 | **Brand name** — PAVE (docs) vs Kivie (code, logos, titles, `localStorage` keys) | S17 | D4.4 |
| 6 | **Patient service worker** — the (removed) UI spec deferred it; FSD §17.1 and M1 §4 both list the PWA as core MVP | S16 | PT-5 |
| 7 | **Cat art format** — the cat companion is PNG while everything else, including its own paw medallions, is SVG. S15 now grows companion art to 176px on tablet, where PNG will visibly soften. Recommendation: redraw the three cat stages as SVG. *(Stage count was resolved by inspection — both motifs are three-stage.)* | *(art task, no code blocked)* | AB.3, PT-4 |
| 8 | **Dr. Brain training UI placement** — sits in Provider while governance of the same model sits in Admin. Recommendation: move training to Admin | *(new session if moved)* | AB.5 |
| 9 | **Reminders screen** — keep as a provider screen or fold into Settings. In no core doc; duplicates Settings controls | S17 | AB.2, D6.3 |

**Resolved**

| # | Decision | Outcome |
|---|---|---|
| ~~7 (old)~~ | Exercise Detail — separate route vs in-page popup | ✅ **Popup stands** (14 Aug 2026). Dead `.timer__ring` CSS deleted in S15 |
| ~~4 (old)~~ | API cost dashboard ownership | ✅ **Moved to Platform Admin** (S2 — gap-analysis E.0) |

---

## 10. S17 · Content reconciliation + final sweep  ◐ **PARTIAL — 15 Aug 2026**

- [x] Demo data reconciled: both portals now share **2026-07-16** as today (the provider portal was 8 days behind); the header read *Tuesday, July 8* — **2026-07-08 was a Wednesday**, so the weekday was wrong for either date; Sofia Reyes 15/16 → 14/16 to match her claim evidence. The KPI strip was in fact coherent (6 qualified, 3 windows closed, $988 of $2,140 approvable) but nothing said so — the captions now state the relationship
- [ ] Resolve the brand name across titles, logos, `localStorage` keys, toast copy *(D4.4)*
- [ ] Centralise toast strings — ~60 inline `data-confirm` attributes block tone review and i18n *(D4.5)*
- [ ] Breadcrumbs, global patient search, contextual back-links *(D3.2, D3.3, B4.7)*
- [ ] Design the four non-`Ready to bill` patient states — every patient link currently lands on the same record *(B4.6)*
- [x] Print stylesheet — chrome and controls dropped, tables print whole with repeating headers, expandable evidence prints **open** (it is the audit trail), badges become outlines to survive mono printing
- [ ] Full QA matrix, both tracks
- [ ] **Structural JS checks are part of the suite now:** every function called in the init sequence must be defined, and no top-level function may be defined twice. `node --check` validates syntax only — it passed while `initTabs` was missing from the admin build and would have thrown on every tabbed page
- [ ] **Link audit must cover JS-built hrefs, not just HTML.** `notifMenu()`/`acctMenu()` construct links in `app.js`; an HTML-only scan misses them (this is how the admin bell shipped pointing at a provider-only page)
- [ ] Resolve the **Reminders** screen: keep it or fold it into Settings (gap-analysis AB.2 #14, D6.3) — it appears in no core doc
- [ ] Re-baseline the design estimate: the Delivery Planner budgets **15 screens**, the real surface is **40** (gap-analysis AB.6)
- [x] Dead CSS: `.hero__ring*` removed (12 rules, superseded by `.xphero`). **Survey of the rest — 18 selectors are dead in both portals, but most are deliberate component-library entries** (`.skeleton`, `.spinner--lg`, `.slider`, `.input--error`): dead ≠ deletable, and stripping them would remove the design system's vocabulary. Left in place by choice
- [ ] Update [gap-analysis.md](gap-analysis.md) status column

**Still open in S17** — each needs a decision or a browser, not more code:
- [ ] **Brand name** — PAVE vs Kivie (decision 5). Touches every title, logo, `localStorage` key and toast string
- [ ] **`--st-ready` contrast** — 3.53:1, under AA (D2.8a, decision). An FSD §15.3 status colour, so a design call
- [ ] **Reminders screen** — keep or fold into Settings (decision 9)
- [ ] Centralise the ~60 inline `data-confirm` strings (D4.5) — blocked on the brand-name decision, since the copy contains it
- [ ] Global patient search, breadcrumbs, contextual back-links (D3.2–D3.3, B4.7)
- [ ] The four non-*Ready to bill* patient states (B4.6) — every patient link still lands on John Carter
- [ ] **Full QA matrix, both tracks** — 154 portal + 168 patient checks. Needs a browser; nothing below has ever been opened in a viewport
- [ ] Screen-reader and keyboard verification of the S12 work

---

## Appendix — rough totals

| Track | Sessions | Est. |
|---|---|---|
| Portal foundations (S1–S2) | 2 | 1.5–2.5 d |
| Portal responsive (S3–S7) | 5 | 9–13 d |
| Portal correctness (S8–S12) | 5 | 9.5–13.5 d |
| Patient (S13–S16) | 4 | 5.5–8.5 d |
| Reconciliation (S17) | 1 | 1.5–2 d |
| **Total** | **17** | **27–39.5 d** |

Combined design + front-end, single-threaded. The two tracks are independent, so two people finish in roughly 60 % of the elapsed time. Estimates assume the §9 decisions are answered **before** the sessions they block. Decision 7 gates the whole patient track, and S13's range **excludes new illustration work** — two extra cat growth stages and a second medallion set are design deliverables, not front-end time.

> **Scope note.** The Delivery Planner budgets a designer for **15 screens** (10 provider + 5 patient). The real surface is **40** across three portals — see gap-analysis [AB.6](gap-analysis.md#ab6-totals). That is not drift: five patient auth/support files sit under a single FSD "screen", the Platform Admin console was never budgeted, and two FSD-mandated provider screens are absent from the FSD's own page count. Re-baseline before committing to M1's two-week design window.
