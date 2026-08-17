# PAVE — Open Gaps & Client Decisions

> **15 Aug 2026.** Only what is still open. Resolved items (S1–S16) are in [build.md](build.md) and git history.
> **3 portals** — Provider 16 screens · Admin 13 · Patient PWA 15. Verified: 44 pages, 0 markup/link/asset errors.
> **Not verified: nothing has been opened in a browser.** QA matrix = 154 portal + 168 patient checks, never run.

---

## 1. Client decisions — these block work

| # | Decision | Why open | Recommendation |
|---|---|---|---|
| 1 | **Responsive scope** | FSD §16.1 says desktop-only, 1100px. Build is now responsive. Spec and build disagree on paper | Amend §16.1: responsive to 768px, essential-actions subset below |
| 2 | **Dark mode** | §17.2 says out of scope; it is shipped in both portals | Decide before QA — it doubles the matrix to 308 checks |
| 3 | **Post-approval plan editing** | §17.2 and M3 §4 say plans are frozen after approval; `patient.html` makes them editable | Remove from `patient.html`, keep on `plan-review.html` |
| 4 | **Org Admin record access** | §4 says Org Admins cannot see clinical records. No restricted view exists — they can open any patient | Design it. **Only decision with a compliance edge** |
| 5 | **Brand name** | Docs say PAVE; code, logos, titles, storage keys and ~60 toast strings say Kivie | Pick one — blocks consolidating the copy |
| 6 | **Cat art format** | Cat companion is PNG; everything else, including its own medallions, is SVG. Softens at 176px on tablet | Redraw 3 cat stages as SVG |
| 7 | **`--st-ready` contrast** | Green status badge is 3.53:1, under AA. It is the §15.3 status colour, so a design call | `#14714D` passes at 5.2:1 |
| 8 | **Reminders screen** | In no core doc; duplicates Settings' notification controls | Fold into Settings, or keep and de-duplicate |
| 9 | **Dr. Brain training placement** | Training sits in Provider, governance of the same model in Admin. M5 assigns training to the admin engineer | Move training to Admin |
| 10 | **Complaint intake channel** | See §2 | Decide the channel, or declare it off-system |
| 11 | **Patient service worker** | Built in S16; the removed UI spec deferred it, FSD §17.1 + M1 §4 budget it | Keep |

Decisions **2, 5, 7, 8** change work already done — clear those first.

---

## 2. New finding — complaints have no way in 🟠

`admin/complaints.html` correctly restricts intake to the **Platform Administrator** (M4 §7). Reporters are patients, guardians and providers, but every record is entered by the admin.

**The gap is upstream:** no designed way to *raise* one. The patient app offers only "Call the office"; the provider portal offers nothing; and complaints appear in **neither the FSD nor user-stories** — only M2/M4. So entry into a regulated 6-year MDR register is entirely off-system.

Defensible as-is: a complaint can carry a regulatory clock, so admin-mediated intake keeps severity assessment with someone qualified to judge it. The decision is whether to design the inbound channel or state that it is deliberately off-system.

---

## 3. Open gaps

### Provider Portal

| ID | Gap | Sev |
|---|---|---|
| B4.6 | Every patient link opens John Carter — 4 of 5 status tiers have no detail view | 🟠 |
| B5.3 | Billing reports has no date range (§14.5, M4 §2). Admin has it; provider does not | 🟠 |
| B7.2 | Card-entry modal shows a native card form; §13.1 says card data never touches PAVE | 🟠 |
| B2.1 | Work-queue cards not dismissible (§6.1, M2 §2) | 🟡 |
| B2.2 | Rows do not exit to Approvals on resolution (§16.3) | 🟡 |
| B2.5 | Auto-refresh is a cosmetic ticker — nothing updates | 🟡 |
| B2.7 | Log Contact has no note field (M2 §3) | 🟡 |
| B3.2 | Treatment goals is free text; M2 §4 wants structured selection | 🟡 |
| B3.4 | ICD-10 is a 5-option datalist — no multi-code, no async search or states | 🟡 |
| B3.7 | No save-draft on enrollment against a 15-min timeout | 🟡 |
| B4.3 | Billing calendar does not align to weekdays; no legend | 🟡 |
| B4.4 | No projected-qualification state for an unqualified patient | 🟡 |
| B4.5 | Activity history has no pagination or filtering | 🟡 |
| B4.8 | Gamification summary lacks badge list with earn dates and broken-streak signal (§8.2, §8.5) | 🟡 |
| B5.2 | Claim evidence inconsistent — one claim full, two summary-only (§6.5) | 🟡 |
| B5.4 | Report status filter is substring matching; badges do not encode status | 🟡 |
| B5.5 | CSV export has no field/date config, progress or failure state | 🟡 |
| B5.6 | Patients table missing adherence column; date sort is string-based | 🟡 |
| B7.1 | Settings dead links — login history (§14.4), invoices (§13.3) | 🟡 |
| B7.3 | Settings has no role gating; no plain-physician view | 🟡 |
| B7.4 | Reassignment is single-patient; menu action only toasts | 🟡 |
| B7.5 | Org Admin has no per-provider drill-down or outcome metrics (§6.9) | 🟡 |
| B7.8 | Dr. Brain training actions not logged in-portal (§10.3) | 🟡 |
| B7.9 | Knowledge base has no upload progress, errors, empty state or pagination | 🟡 |
| B7.11 | Dr. Brain chat has no streaming, typing, error or cost state | 🟡 |
| B2.3 · B2.6 · B2.8 · B3.3 · B3.5 · B4.7 | Panel cross-fade · priority invisible · banner dismissal not per-session · history flags mismatch · no step-4 edit links · back-link not contextual | 🟢 |

### Platform Admin

| ID | Gap | Sev |
|---|---|---|
| C8 | MDR has no per-report reference number, submission record or deadline tracker | 🟠 |
| C5 | Audit log has no faceted filters (actor, action type) | 🟡 |
| C7 | No incident, failed-job or SMS/email delivery-failure view (§9.2) | 🟡 |
| C13 | Console reuses the provider design system despite being able to erase PHI | 🟡 |

### Cross-cutting

| ID | Gap | Sev |
|---|---|---|
| A8.5 | **QA matrix never run** — 322 checks | 🟠 |
| D2.x | No screen-reader or keyboard verification of the S12 work | 🟠 |
| D3.3 | No global patient search — the most frequent action has no affordance | 🟠 |
| A3.5 | Pagination on 2 tables only | 🟡 |
| A5.5 | Native date pickers undesigned — will break the 44px row rhythm | 🟡 |
| D1 | Loading states exist as components, unused on real screens | 🟡 |
| D2.10 | Dark-mode contrast only partly audited (depends on decision 2) | 🟡 |
| D4.5 | ~60 inline toast strings block tone review and i18n (blocked on decision 5) | 🟡 |
| A3.6 · A4.4 · A4.5 · D3.2 | Sticky headers opt-in · sparkline aspect distortion · no touch chart readout · no breadcrumbs | 🟢 |

### Patient PWA

| ID | Gap | Sev |
|---|---|---|
| — | PWA icons are placeholder — drawn from the design system's leaf, not a designer export | 🟠 |
| PT-4 | Cat art is PNG (decision 6) | 🟠 |
| PT-7 | Prototype frame chrome ships in CSS; gate behind a flag before build | 🟡 |

**Noted, not a gap:** 18 selectors are unreferenced in both portals, but most are deliberate component-library entries (`.skeleton`, `.slider`, `.input--error`). Dead ≠ deletable — left in place by choice.

---

## 4. Next

1. Clear §1 with the client — **2, 5, 7, 8 first**, they change delivered work.
2. Run the QA matrix in a browser. Largest single risk: 17 sessions verified statically, none in a viewport.
3. Work §3 — ordinary engineering, nothing blocked.

---

## Appendix — portal & screen inventory

**3 portals, 40 feature screens.** The FSD specifies 2 portals and budgets 15 screens; it also defines a Platform Administrator (§4) with PHI export/delete powers (§3.4) and five report families (§14) — and allocates that role no screen. The admin console is the missing third of a four-role model, not scope creep. *Org Admin is a role inside the Provider Portal, not a portal.*

| Portal | Role(s) | Screens | FSD |
|---|---|---|---|
| **Provider** `pro1/` | Physician · Org Admin (elevated) | **14** + 404, session-expired | §6 |
| **Patient PWA** `v1/` | Patient (60–85) | **15** | §7, §8 |
| **Platform Admin** `admin/` | Platform Administrator | **11** + sign-in, 404, session-expired | §4, §14, §12, §3.4 |

**Provider (14):** Dashboard · Work Queue · Enrollment · Plan Review · Patient Detail · Approvals · Billing reports · Revenue Calculator · Patients · Org Admin · Settings · Dr. Brain · Sign in · Reminders*
**Patient (15):** splash · login · verify · onboarding · session-expired · today · checkin · confirmation · exercises · progress · rewards · settings · help · offline · notifications
**Admin (11):** Overview · Complaints & MDR · AI Governance · Platform reports · HIPAA Audit · Data Requests · API costs · Provider accounts · Organizations · Platform settings · Sign in

\* Reminders is discretionary — decision 8.

**Scope note:** the Delivery Planner budgets a designer for **15 screens**; the real surface is **40**. Not drift — five patient auth/support files sit under one FSD "screen", the admin console was never budgeted, and two FSD-mandated provider screens are absent from its own page count. Re-baseline before committing to M1's two-week design window.
