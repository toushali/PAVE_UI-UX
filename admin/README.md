# PAVE — Platform Admin console (`admin/`)

Static, clickable prototype of the **Platform Administrator** surface (FSD §4) — the
system-level operations & compliance console that sits alongside the patient and
provider apps. Reuses the **provider clinical design system** with the same calm
green identity, distinguished by the **"Platform Admin"** wordmark and a
**"System-wide access"** tag.

> No backend. Vanilla JS, mock data, internally consistent with the patient/provider apps.

## How to open
Open **`index.html`** → redirects to `app/login.html`. Sign in with Google/Microsoft →
MFA → **Overview**. The bottom-left **toggle** switches between all four prototypes
(Patient · Provider · **Platform Admin**).

## Screens (8)

| Screen | File | FSD |
| --- | --- | --- |
| Login (OAuth + MFA, restricted) | `app/login.html` | §5.1 |
| Overview (system health) | `app/overview.html` | §14 |
| Complaints & MDR | `app/complaints.html` | §15A |
| AI Governance (prompt registry + traceability) | `app/ai-governance.html` | §10.5 |
| Platform reports (provider · patient · AI/token) | `app/reports.html` | §14.1–14.3 |
| API cost & usage | `app/api-costs.html` | §12 |
| HIPAA Audit (5 log views) | `app/hipaa-audit.html` | §14.4 |
| Data Requests (export / delete PHI) | `app/data-requests.html` | §3.4 |

> **S2 (14 Aug 2026):** **API cost & usage** (§12) moved here from the provider portal —
> it reports PAVE's platform vendor spend (Claude · Twilio · Supabase · Stripe · SendGrid ·
> storage), which is an operations concern, not a physician's. §12 is the finance
> system-of-record; the §14.3 tab in Platform reports is the token-attribution cut.
> See [core_docs/gap-analysis.md](../core_docs/gap-analysis.md) §E.0.

## What it demonstrates
- **Complaints & MDR** — intake modal, status pipeline (Open → Investigating → Escalated → Resolved), MDR escalation + notify, resolution records, 6-yr retention.
- **AI Governance** — append-only prompt version registry, model-version traceability, per-plan lookup, read-only prompt viewer.
- **Platform reports** — tabbed provider / patient / AI-token analytics with charts, dropout flags, plan/training logs.
- **HIPAA Audit** — immutable PHI-access / failed-auth / export / admin-action / session logs, CSV export.
- **Data Requests** — export or **permanently delete** any patient's PHI, gated by a type-to-confirm modal; all actions logged.

## Structure
```
admin/
├── index.html            → redirect to app/login.html
├── css/  tokens · base · components   (copied from provider/, green tokens)
├── js/   app.js           (shell injection, tabs, panels, modals, menus, 5-way toggle)
└── app/  the 8 screens
```
The sidebar + top bar are injected by `renderShell()` in `app.js`; every page is a
`<div class="app" data-shell>` placeholder + its content.

## Not built (static prototype)
Real auth/PHI/backends; the actual audit-log store, complaint DB, prompt registry,
report queries, and PHI export/delete pipelines are all mocked.
