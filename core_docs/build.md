# PAVE — Gap-Completion Build Plan

> **Source:** [gap-analysis.md](gap-analysis.md) (punch-list) · [user-stories.md](user-stories.md) · FSD v5.0 · milestone specs [M1](M1-Foundation-Auth-Design.md)–[M6](M6-QA-Hardening-Launch.md).
> **Deliverable:** the same clickable **static HTML + CSS + vanilla-JS** prototype. No backend, no framework. Mock data inline, internally consistent.
> **Purpose:** close every gap the analysis found so all FSD/M1–M6 UI is demoable across the prototypes.

This plan supersedes the original 24-session build (patient v1/v2 + provider Pro1/Pro2 are already built). It contains **13 sessions in 3 parts**, each self-contained and openable in a browser at the end.

---

## Current architecture (what already exists — don't rebuild)

| Surface | Folder | Notes |
|---|---|---|
| Patient design 1 | `v1/` | white-green, Fraunces; self-contained (own css/js/assets/pages) |
| Patient design 2 | `v2/` | gamified indigo; **separate self-contained copy** of every patient screen |
| Provider Pro1 | `pro1/` | clinical; **default theme = white-green** (`:root` in `pro1/css/tokens.css`) |
| Provider Pro2 | `pro1/` (same code) | **colour theme only** — `html[data-ptheme="pro2"]` = blue. No separate folder |
| Prototype switcher | `js/app.js` toggle in each folder | 4-way: Patient v1 · v2 · Provider Pro1 · Pro2 |

---

## Ground rules (apply to every session)

- **Static only.** Vanilla JS for interactions; mock data inline; numbers reconcile within a screen. No real API/auth/PHI.
- **Tokens, never hardcode.** Use each folder's `tokens.css`. New colours → add a token first. `[hidden]{display:none!important}` guard already present.
- **Provider work = one codebase, two themes.** Every new/edited `pro1/` page **must** carry the head theme-bootstrap (`data-ptheme`) and use tokens so it renders correctly in **both** Pro1 (green) and Pro2 (blue). New provider pages get added to `renderShell()`'s `NAV` in `pro1/js/app.js`. **Verify every provider change in both themes.**
- **Patient work = mirror v1 → v2.** `v1/` and `v2/` are separate. Any new patient screen/element built in `v1/` **must be mirrored into `v2/`** using v2's gamified styling (Session 7 batches this, but keep the two in step).
- **Motion/interaction parity.** Provider: inline panels, cross-fade, scale-pulse, top banner (auto-dismiss ~4s), fade-rise, 60s mock refresh (FSD §16.3). Patient: fade-and-rise, scale-pulse, `prefers-reduced-motion` honored, 48px+ targets.
- **Mock identities (keep identical everywhere):** patient "John Carter" (M54.5), physician "Dr. Brandon Stillman, MD", practice "Stillman Rehabilitation Group", RTM CPT 98975–98981, 12-day streak.
- **End-of-session check:** open the new/edited screen(s), run the interaction, confirm shell/nav/toggle render. Provider screens: screenshot in **both** themes.

---

# PART 1 — Provider Portal gaps (`pro1/`, inherits into Pro2 theme)

Closes: **PR-30** (API Cost Dashboard), **PR-10/PR-13** (Plan Review & Approval), **PR-29** (Stripe card/plan-change), **OA-5** (deactivate/roles), **PR-20** (On-Track white badge).

## Session 1 — API Cost Dashboard (PR-30 · FSD §12 · M5)

**Goal:** the one fully-missing operator screen. Build `pro1/app/api-costs.html` and wire it into nav.

**Build:**
1. New page `pro1/app/api-costs.html` using the standard `data-shell` + `data-topbar` + `content__inner` scaffold and the theme-bootstrap `<head>` script.
2. Add nav item to `NAV` in `pro1/js/app.js` (e.g. `["api-costs","API costs", <icon>, ""]`) — place after Reports/Revenue.
3. **KPI strip:** total spend this month · rolling-12-month spend · projected month-end · active budget alerts. Monospace `.num`.
4. **Per-service breakdown** (card + table): Claude API, Twilio SMS, SendGrid email, Supabase DB, storage, Stripe — columns: calls/volume, unit cost, total. Include a small **stacked/── proportion bar** per service (reuse `.spark`/`.linechart` SVG pattern from Reports).
5. **Trend chart:** spend over time (reuse the `.linechart` SVG component from `reports.html`; theme-aware via `currentColor`).
6. **Per-event log** (table): timestamp · service · event type (enrollment / training / reminder) · tokens (in/out/total for Claude) · cost. Sortable via existing `data-sort`; filterable by service via existing `data-filtergroup`.
7. **Budget alerts:** per-service monthly limit rows with a threshold and a progress bar (`.pbar`) turning amber near limit; a "Set limit" control (mock).
8. **Export accounting CSV** button → `data-confirm` banner ("Accounting CSV exported · period, service, event, qty, unit, total").

**Done when:** page renders in **both** themes; sort/filter work; nav highlights; export banner fires. Screenshot Pro1 + Pro2.

---

## Session 2 — Plan Review & Approval flow (PR-10, PR-13 · FSD §6.3, §10.2 · M2/M3)

**Goal:** make the post-enrollment "review the AI plan → Approve Plan → invite sent" step an explicit screen, not just a tab action.

**Build:**
1. New page `pro1/app/plan-review.html` — the screen a physician lands on **after** submitting enrollment (update `enroll.html`'s final step / submit to route here).
2. **Header:** patient name + diagnosis + "Generated by Dr. Brain v2.3" model-version tag; a clear **"Review before your patient sees this plan"** framing (SaMD).
3. **Plan by modality** (reuse `planmod`/`planex` components from Patient Detail): each exercise with plain-language + clinical terminology + frequency.
4. **Medical rationale** panel (reuse `.rationale`): evidence basis per recommendation (§10.2 SaMD).
5. **Actions:** primary **Approve Plan** (`data-confirm` → banner "Plan approved · invitation sent to John via SMS · logged", timestamped) + secondary "Request regeneration" (mock) + "Save as draft".
6. On approve: show the invite-sent confirmation state (channel from enrollment).
7. Cross-link: keep the **Approve Plan** action in Patient Detail's Generated-Plan tab, but have it reference this same review layout for consistency.

**Done when:** enroll submit → plan-review → Approve → invite-confirmation flows in both themes; approval is timestamped/logged (mock banner).

---

## Session 3 — Provider Settings billing + Org-Admin management (PR-29, OA-5 · FSD §6.9, §6.10, §13)

**Goal:** finish the two management gaps.

**Build — `pro1/app/settings.html` (Organization/billing):**
1. **Payment method** row: Stripe-style card display ("Visa ···· 4242 · exp 08/27") + **Update card** button opening an inline **Stripe-Elements-style card field** (mock: card number / MM-YY / CVC, "Powered by Stripe" note). Card data is illustrative only.
2. **Plan / subscription** controls: current plan, **Change plan** (Individual ↔ Group, monthly ↔ annual) as a modal (reuse `data-modal-open`), immediate vs end-of-period toggle.
3. Keep **View invoices** (Stripe Customer Portal link, mock).

**Build — `pro1/app/org-admin.html` (provider management):**
4. Replace the generic per-provider **"Manage"** with an explicit menu (reuse `data-menu`): **Edit role** (Physician / Org Admin), **Deactivate** (`data-confirm` → row dims + "Deactivated · access revoked · logged"), **Reassign patients**.
5. **Invite provider** already present — confirm it captures role on invite.

**Done when:** card-update field + plan-change modal work; provider deactivate/role menu works; both themes verified.

---

## Session 4 — On-Track "white" badge alignment + provider QA sweep (PR-20 · FSD §15.3 · M2)

**Goal:** resolve the one spec deviation and regression-check Part 1.

**Build:**
1. **On-Track badge → neutral/white treatment** per §15.3, while staying distinct from **Enrolled** (also neutral). Recommended: Enrolled = plain grey text no dot; On-Track = **white/very-light fill + subtle outline + ink text** (a "clean, quiet" badge), reserving amber for Needs-Attention and green for Ready-to-Bill. Update `--st-ontrack*` tokens in **both** theme blocks in `pro1/css/tokens.css` + `.badge--ontrack`.
2. Sweep every screen that shows On-Track (dashboard, work-queue, patients, patient detail) — confirm legibility in both themes; confirm the 5 tiers stay mutually distinguishable.
3. **Provider regression (M6 §57-68):** dashboard queues + auto-refresh + dismiss; work-queue one-panel-at-a-time + cross-fade + row resolution pulse; approvals individual + batch + banner; reports filters + expired filter + CSV; data-table sort/search/status-filter; new API-costs + plan-review pages.

**Done when:** On-Track reads as calm/white and distinct from Enrolled in both themes; regression checklist passes.

---

# PART 2 — Patient Portal gaps (`v1/` then mirror `v2/`)

Closes: **P-2** (guided MFA setup), **P-3** (onboarding channel choice), **P-21** (opt-out toggles).

## Session 5 — Patient onboarding: guided MFA setup + notification channel (P-2, P-3 · FSD §7.1, §9.4 · M1/M3) — `v1/`

**Goal:** turn the bare OTP entry into the FSD's step-by-step guided first-time setup, and let the patient confirm contact + channel.

**Build (v1):**
1. **Onboarding channel step** (`v1/auth/onboarding.html`): after welcome + contact confirmation, add **"How should we reach you?"** — large SMS / Email / Both choices (big tappable cards, 48px+), with a one-line reassurance ("Reminders help your streak; sign-in codes always come through").
2. **Guided MFA setup** (extend `v1/auth/verify.html` or add `v1/auth/mfa-setup.html`):
   - Step A: choose second-factor channel (Text message / Email) — large cards.
   - Step B: "We sent a 6-digit code to ···· 4821" → the existing OTP boxes, big; **Resend** + "Didn't get it? try email instead".
   - Step C: **visual confirmation** ("You're all set — your account is protected") with a checkmark celebration.
   - Large text, plain language, one action per step (60–85 demographic).
3. Wire the flow: magic-link/login → onboarding (welcome → contact → channel) → MFA setup → `today.html`.

**Done when:** the guided flow runs end-to-end at ~390px with 48px targets; channel choice persists into settings copy.

---

## Session 6 — Patient settings: notification opt-out toggles (P-21 · FSD §9.4 · M3) — `v1/`

**Goal:** explicit control of engagement reminders (auth messages always on).

**Build (v1) — `v1/app/settings.html`:**
1. **Notifications section:** per-type rows with **SMS + Email toggles** — Daily check-in reminder · Streak at-risk nudge · Milestone congratulations. Reuse the toggle-switch component.
2. A clear, always-on, non-toggleable note: **"Sign-in codes & security messages are always sent."**
3. **Preferred channel** selector mirroring onboarding (SMS / Email / Both).
4. Opt-out change → gentle inline confirmation ("Saved. You won't get streak nudges by text.").

**Done when:** toggles flip and persist visually; auth-always-on note present.

---

## Session 7 — Mirror Sessions 5–6 into `v2/`

**Goal:** keep the two patient designs element-for-element equivalent.

**Build:**
1. Recreate the **onboarding channel step**, **guided MFA setup**, and **settings opt-out toggles** in `v2/` using v2's gamified indigo styling and components.
2. Match copy and flow exactly; only the visual design differs.
3. Verify the 4-way toggle still lands correctly on v2 auth/app pages.

**Done when:** v1 and v2 have identical onboarding/MFA/settings coverage; both render correctly.

---

# PART 3 — Platform-Admin surface (new `admin/` prototype)

Closes the ⬛ items M1–M6 build but the design never scoped: **Complaint/MDR** (§15A), **Prompt Version Registry** (§10.5), **Backend Reports + HIPAA audit** (§14), **Data export/deletion** (§3.4).

> **Approach:** a new self-contained `admin/` folder that **reuses the pro1 clinical design system** (copy `pro1/css/*` → `admin/css/*`, same shell pattern) with a distinct **"Platform Admin"** identity (ops accent + role tag) so it reads as a separate operator surface. Added to the prototype toggle as a 5th entry. Confirm with the client first if a demo Platform-Admin surface is wanted (gap-analysis Group C).

## Session 8 — Admin shell + login + toggle entry

**Build:**
1. Create `admin/` (`index.html`, `css/` copied from pro1, `js/app.js` with `renderShell()` + toggle, `app/`).
2. **Login** (`admin/app/login.html`): OAuth + MFA framing like pro1, but "Platform Administrator" label and a warning that this surface has system-wide access.
3. **Shell nav:** Overview · Complaints & MDR · AI Governance · Reports · HIPAA Audit · Data Requests.
4. **Overview** page: system-health KPIs (active orgs, providers, patients, API spend, open complaints, failed logins today) — all monospace, mock.
5. Add **"Platform · Admin"** to the toggle in every folder's `js/app.js` (v1, v2, pro1, admin) → 5-way.

**Done when:** admin portal opens, nav works, toggle reaches it from any prototype.

---

## Session 9 — Complaint Handling & MDR admin UI (§15A · M2/M4)

**Build — `admin/app/complaints.html`:**
1. **Intake form:** reporter identity, date received, description, affected patient record(s), severity.
2. **Status pipeline:** Open · Investigating · Resolved · Escalated — as filterable table + status badges (reuse tiers/colours; amber never red).
3. **MDR escalation flag** with "notify regulatory contact" action (`data-confirm`, logged).
4. **Resolution record** (expandable row): root cause, corrective action, resolution date.
5. **6-year retention** note + **Export CSV**.

**Done when:** intake → status change → escalate → resolve flow works; table filters by status.

---

## Session 10 — AI Governance: Prompt Version Registry & Model Traceability (§10.5 · M5)

**Build — `admin/app/ai-governance.html`:**
1. **Prompt version registry** (append-only table): version ID · effective date · change description · authorized-by · (view full prompt text in a modal).
2. **Model version** column (e.g. `claude-sonnet-4-…`) per registry entry.
3. **Plan-to-version lookup:** search a patient → show the exact prompt version + model that generated their plan (traceability, FDA/PCCP framing).
4. Read-only, immutable framing ("versions cannot be edited or deleted").

**Done when:** registry lists versions; prompt-text modal opens; patient lookup returns a version.

---

## Session 11 — Backend Reports: Provider · Patient · AI/Token activity (§14.1–14.3 · M5)

**Build — `admin/app/reports.html` (tabbed, reuse `data-tabs`):**
1. **Provider activity:** login frequency, patients enrolled/provider, avg review time, claim-approval rate, avg plan-approval time — tables + trend line charts.
2. **Patient activity:** check-in rates (by day/time), streak distribution, gamification engagement, **dropout indicators** (7/14/30-day no-login flags), de-identified pain-trend aggregate.
3. **AI/token usage:** total Claude calls/period, tokens per call (in/out/total) with cost, plan-generation log, training-session log.
4. Every tab: **custom date-range** control + **Export CSV**; Org-level vs platform-level note.

**Done when:** three tabs render with mock charts/tables; date-range + export controls present.

---

## Session 12 — HIPAA Audit reports + Data export/deletion (§14.4, §3.4 · M5/M1)

**Build:**
1. `admin/app/hipaa-audit.html` — five log views (tabs or filter): **PHI access** (who/what/when/IP), **failed auth**, **export events**, **admin actions** (user create/deactivate/role), **session** (start/end/idle-timeout). Immutable framing, **6-year retention**, **Export CSV** per log.
2. `admin/app/data-requests.html` — **Export patient PHI** and **Permanently delete patient PHI** admin functions with a serious confirm pattern (type-to-confirm modal, `data-confirm`, logged to audit).

**Done when:** audit logs filter/scroll; data export + delete confirmations work (mock, logged).

---

## Session 13 — Final QA, README & cross-prototype consistency

**Build:**
1. **Full sweep (M6):** every new/edited screen in v1, v2, pro1 (both themes), admin — render, run interactions, confirm nav + 5-way toggle + `[hidden]` guard + reduced-motion.
2. **Traceability:** update [gap-analysis.md](gap-analysis.md) statuses to ✅ as each item lands; confirm every user story P-/PR-/OA- + the ⬛ items now map to a screen.
3. **READMEs:** update `pro1/README.md` (adds API-costs + plan-review), add `admin/README.md`, note v1/v2 onboarding+settings additions; update root `index.html` launcher with the Platform-Admin link.
4. **Consistency pass:** mock data reconciles across patient ↔ provider ↔ admin (same patients, CPT codes, dates).

**Done when:** every gap-analysis punch-list item (Groups A, B, C) is ✅ and demoable from one launcher.

---

## Session → gap map

| Session | Closes | Story |
|---|---|---|
| 1 | API Cost Dashboard | PR-30 |
| 2 | Plan Review & Approval | PR-10, PR-13 |
| 3 | Stripe card/plan-change · Org-Admin deactivate/roles | PR-29, OA-5 |
| 4 | On-Track white badge + provider regression | PR-20 |
| 5 | Onboarding MFA setup + channel (v1) | P-2, P-3 |
| 6 | Settings opt-out toggles (v1) | P-21 |
| 7 | Mirror 5–6 into v2 | P-2, P-3, P-21 (v2) |
| 8 | Platform-Admin shell + toggle | Group C |
| 9 | Complaint & MDR UI | §15A |
| 10 | Prompt Version Registry | §10.5 |
| 11 | Backend Reports (provider/patient/AI) | §14.1–14.3 |
| 12 | HIPAA Audit + Data export/deletion | §14.4, §3.4 |
| 13 | Final QA + READMEs + traceability | all |

**Sequencing:** Part 1 (provider) and Part 2 (patient) are independent — do in either order. Part 3 (admin) is optional-pending-client-confirmation; if descoped, stop after Session 7 and mark Group C "deferred" in the gap analysis.
