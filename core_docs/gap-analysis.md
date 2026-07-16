# PAVE — Design Gap Analysis (v1 patient · pro1 provider)

> **Sources reconciled:** FSD v5.0 · Delivery Planner · **milestone specs M1–M6**
> ([M1](M1-Foundation-Auth-Design.md)…[M6](M6-QA-Hardening-Launch.md)) · [user-stories.md](user-stories.md).
> **Scope:** UI/UX design coverage of screens & elements in the current build —
> `v1/` (patient PWA) and `pro1/` (provider portal). Not backend logic.
>
> **Legend:** ✅ Done · 🟡 Partial (screen exists, element missing/deviating) · ❌ Missing · ⬛ Not in current design scope (needs a new surface)
>
> **Headline:** The **core 15 MVP screens (10 provider + 5 patient) are ~95% covered** at
> the design level. Remaining work is: **1 missing operator screen** (API Cost Dashboard),
> **a small punch-list of elements**, **one spec deviation** (On-Track badge colour), and a
> whole **Platform-Admin surface** that M1–M6 reveal but the current design never scoped.
>
> **▶ Build status (per [build.md](build.md)): ✅ COMPLETE.** Parts 1 (Provider), 2 (Patient),
> and 3 (Platform-Admin) are all built and verified. Every punch-list item — Groups A, B, **and C** —
> is done. The Platform-Admin surface now exists as [`admin/`](../admin/) on the 5-way toggle.

---

## 1 · Patient Portal — `v1/`  ·  FSD §5.2, §7, §8 · M1, M3

FSD/M3 core = **5 screens**; v1 ships those + home (`today`), help & offline.

| # | Requirement (FSD / M-ref) | Story | Status | Action |
|---|---|---|---|---|
| 1 | Login / magic-link + expired-session (M1, M3) | P-1,P-5 | ✅ | `splash·login·session-expired` |
| 2 | **Guided MFA setup** — pick SMS/email OTP, large-text step-by-step (M1 §98, M3) | P-2 | ✅ | `verify.html` rebuilt as guided 3-step MFA setup (channel → code → confirmation); mirrored to v2 |
| 3 | Welcome + contact confirm + **notification channel (SMS/email/both)** (M3 §194, §9.4) | P-3 | ✅ | onboarding "How should we reach you?" step added (SMS/Email/Both); mirrored to v2 |
| 4 | Add-to-home (PWA install) (M1) | P-4 | ✅ | `splash`+`help` |
| 5 | Check-in: 0–10 pain slider · activities checkboxes · Better/Same/Worse · optional note (M3 §51-55) | P-6…P-9 | ✅ | all four present, 48px targets |
| 6 | Check-in confirmation + **one-per-day duplicate message** (M3 §61) | P-10 | ✅ | confirmation + "already checked in / come back tomorrow" present |
| 7 | Exercise plan by modality; per-exercise detail (text); completion marking (M3 §64-69) | P-11…P-13 | ✅ | 5 dedicated exercise pages |
| 8 | Progress: streak · adherence % · pain this-week-vs-last · gamification summary (M3 §72-76) | P-14…P-16 | ✅ | `progress.html` |
| 9 | Gamification: streak milestones (7/14/30/60/90) · badges w/ earn dates · points · celebrations (M3 §84-111) | P-17…P-20 | ✅ | `rewards` + milestone celebration |
| 10 | Settings / notifications: opt out of engagement reminders (M3 §193-197) | P-21 | ✅ | Notifications card — per-type opt-out switches + Text/Email/Both + always-on note + "Saved"; mirrored to v2 |
| 11 | Account / help / offline | P-22 | ✅ | present |

**Patient gaps:** ✅ all closed (guided MFA setup, onboarding channel, settings opt-out) in **both v1 and v2**.

---

## 2 · Provider Portal — `pro1/`  ·  FSD §6, §10, §16 · M2, M3, M5

Core = **10 screens**; pro1 ships all 10 + Login + Dr. Brain.

| # | Requirement (FSD / M-ref) | Story | Status | Action |
|---|---|---|---|---|
| 1 | Login — OAuth + mandatory MFA + 15-min timeout (M1) | PR-1,PR-2 | ✅ | present |
| 2 | Dashboard — KPI strip · dismissible alert banner · Urgent+Optimization queues · 60s auto-refresh (M2 §82-111) | PR-3…PR-8 | ✅ | all present + status pulse + inline panels |
| 3 | Work Queue — rows (all columns) + inline actions, one panel at a time, cross-fade/close-then-open (M2 §112-135) | PR-6,PR-7 | ✅ | `work-queue.html` |
| 4 | Enrollment — 4-step: demographics **+ channel**, ICD-10, **medical-history flags**, **treatment goals**, modalities, review (M2 §136-165) | PR-9 | ✅ | all step-2 fields confirmed present |
| 5 | Enrollment → **plan review & Approve Plan** before activation, then invite (M2 §160-165, M3 §135-140) | PR-10,PR-13 | ✅ | `plan-review.html` added — SaMD gate, plan+rationale, Approve→invite success; enroll routes here |
| 6 | Patient Detail — 5 tabs: Activity(+gamification) · Generated Plan+rationale · Billing Timeline · Action Log · Outcomes (M3 §142-168) | PR-11,PR-12,PR-14,PR-15,PR-16 | ✅ | 5 tabs present |
| 7 | Approval Queue — expandable evidence · individual + **batch** approve · claim lock (M4 §33-51) | PR-17…PR-19 | ✅ | present incl. Batch-Approve-All |
| 8 | **5-tier status badges** (M2 §51-56) | PR-20 | ✅ | On Track = white outlined badge per §15.3 (both themes); all 5 tiers distinct |
| 9 | Reports — CPT dist · revenue/period · **totals & avg-per-claim** · trend graphs · historical search/filter (incl. expired) · CSV (M4 §52-72) | PR-21…PR-23 | ✅ | line graphs + summary figures present |
| 10 | Revenue Calculator (M4 §74-90) | PR-24 | ✅ | `revenue.html` |
| 11 | Data Table — sortable/searchable/status-filter + 5-tier + quick actions (M4 §92-99) | PR-25 | ✅ | `patients.html` |
| 12 | Dr. Brain — chat · upload · KB mgmt · sandbox test-enroll · promote/rollback · model-version tags (M5 §60-93) | PR-26…PR-28 | ✅ | `dr-brain.html` |
| 13 | Settings — profile/OAuth · MFA reset · notification thresholds · org settings (M4 §126-142) | PR-29 | ✅ | present |
| 14 | Settings → **Stripe payment method / plan change** (Stripe Elements card, upgrade/downgrade) (M5 §34-46, §13) | PR-29 | ✅ | payment-method card + Update-card modal (Stripe-Elements style) + Change-plan modal added |
| 15 | **API Cost Dashboard** — spend total · per-service breakdown · token log · trend charts · budget alerts · CSV (M5 §119-137, §12) | PR-30 | ✅ | `api-costs.html` built + in nav — KPIs, trend, per-service, budgets, event log, CSV |

**Provider gaps:** ✅ all closed (API Cost Dashboard, Plan-Review/Approval, On-Track white badge, Stripe card/plan-change).

---

## 3 · Org Admin (elevated provider)  ·  FSD §6.9 · M4

| # | Requirement (M4 §101-124) | Story | Status | Action |
|---|---|---|---|---|
| 1 | Aggregate dashboard (patients · pipeline · claims) | OA-1 | ✅ | KPIs |
| 2 | Provider list (counts + claims) | OA-2 | ✅ | table |
| 3 | Patient reassignment (logged) | OA-3 | ✅ | reassign control |
| 4 | Org-level CSV export | OA-4 | ✅ | present |
| 5 | Provider mgmt — invite · **deactivate · manage roles** | OA-5 | ✅ | Manage dropdown (Edit role · Reassign · Deactivate→dims row) + Invite modal captures role |
| 6 | Org billing settings — subscription + invoice access | OA-6 | ✅ | in `settings.html` |

---

## 4 · Surfaces revealed by M1–M6 but **never scoped in the current design** ⬛

M1–M6 build UIs for a **Platform-Administrator** role (FSD §4) and other admin/ops screens
that live *outside* the 15 client-facing screens. **✅ Now built as the [`admin/`](../admin/) surface** (5th prototype on the toggle).

| Surface (M-ref) | What it is | Status |
|---|---|---|
| **API Cost Dashboard** (M5 §12) | Operator cost view — spend, tokens, trends, budget alerts, CSV | ✅ `pro1/app/api-costs.html` (provider portal) |
| **Complaint Handling & MDR** admin UI (M2 §76-80, M4 §143-150, §15A) | Intake form, status (Open/Investigating/Resolved/Escalated), MDR escalation flag, 6-yr retention | ✅ `admin/app/complaints.html` |
| **Prompt Version Registry / Model Traceability** (M5 §95-117, §10.5) | Append-only prompt-version lookup, model-version per plan, admin query view | ✅ `admin/app/ai-governance.html` |
| **Backend Reports** (M5 §139-169, §14) | Provider-activity · patient-activity · AI/token-usage · **HIPAA audit** (PHI access, failed-auth, exports, admin actions, sessions) — all CSV | ✅ `admin/app/reports.html` + `hipaa-audit.html` |
| **Data export / deletion** admin function (M1 §57, §3.4) | Export or permanently delete any patient's PHI | ✅ `admin/app/data-requests.html` (type-to-confirm) |

> These were genuine MVP UI deliverables in M4–M5. **They are now designed** as the
> `admin/` Platform-Admin console (7 screens incl. login), reachable from the 5-way toggle
> and the root launcher — using the same green clinical design system.

---

## 5 · Design-spec alignment (FSD §16 / M-files)

| Item | Spec | Build | Verdict |
|---|---|---|---|
| Provider: 1100px, light, monospace metrics, minimal borders | §16.1 | ✅ | matches |
| Patient: mobile-first, 48px targets, warm/accessible (60–85) | §16.2 | ✅ | matches |
| Provider interactions: panels, cross-fade, scale-pulse, top banner (4s), fade-rise, 60s refresh | §16.3, M2 | ✅ | all 12 behaviours present |
| **On Track = white badge** | §15.3, M2 §53 | ✅ | now a white outlined badge in both themes (Session 4) |

---

## 6 · Corrections vs. the first-pass gap analysis
Re-checking against M1–M6 upgraded several items to ✅:
- Provider **enrollment** already captures notification **channel**, **medical-history flags**, and **treatment goals** (was flagged partial).
- Patient **check-in duplicate-day** message already exists (was flagged partial).
- Reports **totals / avg-per-claim** figures already present.

New items **added** this pass (from M-files): Stripe card/plan-change UI (§13), Complaint/MDR admin (§15A), Prompt Version Registry (§10.5), Backend Reports incl. HIPAA audit (§14), Data export/deletion (§3.4).

---

## 7 · Prioritised punch-list — progress

**A · Demo-critical (client-facing screens) — ✅ DONE**
1. ✅ **Provider · API Cost Dashboard** (PR-30) — build.md S1.
2. ✅ **Provider · Plan Review & Approval** (PR-10, PR-13) — build.md S2.
3. ✅ **Patient · Onboarding** — guided MFA setup + channel choice (P-2, P-3), v1 + v2 — build.md S5, S7.

**B · Element polish / spec alignment — ✅ DONE**
4. ✅ **Provider · On-Track badge = white** per §15.3 (PR-20) — build.md S4.
5. ✅ **Org Admin · deactivate + role** controls (OA-5) — build.md S3.
6. ✅ **Provider · Settings** — Stripe card / plan-change UI (PR-29) — build.md S3.
7. ✅ **Patient** — settings opt-out toggles (P-21), v1 + v2 — build.md S6, S7.

**C · New surface — ✅ DONE**
8. ✅ **Platform-Admin portal** (`admin/`): Overview · Complaints/MDR · AI Governance (Prompt Version Registry) · Backend Reports · HIPAA Audit · Data export/deletion — build.md S8–S13.

> **Status: ✅ ALL COMPLETE.** Groups A, B, and C are done and verified across both provider
> themes (Pro1/Pro2), both patient designs (v1/v2), and the new Platform-Admin console — all
> reachable from the 5-way toggle and the root launcher. Every FSD/M1–M6 UI deliverable now
> maps to a screen in the prototype.
