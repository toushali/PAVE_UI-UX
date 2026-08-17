# Kivie — Provider Portal

Static, clickable prototype of the Kivie Provider Portal — the physician-side
RTM compliance & billing tool (FSD §6, §16.1).

The Kivie teal-green provider style (matches the Patient PWA). This is the
single provider portal.

> No backend, no framework. Vanilla JS only. Mock data, internally consistent.
> Desktop-optimized · light mode · data-dense clinical aesthetic · **monospace for every number/metric/$/timestamp** · content capped at 1100px.

## How to open

Open **`index.html`** → redirects to `app/login.html`. Any static server works
(e.g. VS Code Live Server). Click **Sign in with Google/Microsoft → MFA → Verify**
to reach the dashboard. The bottom-left **toggle** switches between all four
prototypes — **Patient · Provider · Platform Admin**
— and its own accent follows whichever theme you're viewing.

## Component library

The CSS provides a full component set — buttons, inputs/selects/textarea,
checkboxes, radios, toggle switches, sliders, badges (5-tier status), cards,
KPIs, tabs, dropdown menus, modals/dialogs, line charts + sparklines,
spinners/skeletons — each with default · hover · active · disabled · error ·
loading states, plus the colour/status, typography, and spacing foundations.

## Screens (13)

| Screen | File | FSD |
| --- | --- | --- |
| Login (OAuth + MFA) | `app/login.html` | §5.1 |
| Dashboard | `app/dashboard.html` | §6.1 |
| Work Queue | `app/work-queue.html` | §6.2 |
| Patient Enrollment (4-step) | `app/enroll.html` | §6.3 |
| Patient Detail (5 tabs) | `app/patient.html` | §6.4 |
| Approvals | `app/approvals.html` | §6.5 |
| Billing reports | `app/reports.html` | §6.6 |
| Revenue Calculator | `app/revenue.html` | §6.7 |
| Plan Review & Approval | `app/plan-review.html` | §6.3 · §10.2 |
| Patients (data table) | `app/patients.html` | §6.8 |
| Org Admin | `app/org-admin.html` | §6.9 |
| Settings | `app/settings.html` | §6.10 |

**12 screens.** Three have left this portal:

> **S2 (14 Aug):** the API Cost dashboard (§12) moved to the **Platform Admin**
> console — it reports PAVE's vendor spend, not a practice's. "Reports" was renamed
> **Billing reports** to distinguish it from Platform reports.
>
> **R6 (18 Aug):** **Reminders** folded into Settings. Its preferences merged into
> the *Notifications & reminders* card; its alert feed was dropped rather than
> moved — the bell already showed the same rows, and the Work Queue is where they
> are worked.
>
> **R7 (18 Aug):** **Dr. Brain training** moved to the Platform Admin console.
> Training is a restricted capability, not something offered to every physician —
> a platform administrator grants it per provider there. **This portal has no
> Dr. Brain surface, by decision.**
>
> See [core_docs/gap-analysis.md](../core_docs/gap-analysis.md) and
> [core_docs/build.md](../core_docs/build.md).

## Structure

```
provider/
├── index.html            → redirect to app/login.html
├── css/  tokens · base · components
├── js/   app.js          (shell injection, panels, tabs, sort/filter,
│                          steppers, confirm banners, toggle)
└── app/  the 13 screens
```

The **sidebar + top bar are injected by `renderShell()`** in `app.js` from one
place — every page is just `<body data-page="X" data-title="Y">` + a
`<div class="app" data-shell>` placeholder + its content.

## Interaction behaviours (FSD §16.3)

- Inline action panels slide down; **one open at a time** per group.
- Panel switching cross-fades; different row closes the current first.
- **Status change = scale-pulse** (e.g. On track → Ready to bill).
- **Approve = confirmation banner from top, auto-dismisses ~4s.**
- Page content fades-and-rises on mount; `prefers-reduced-motion` respected.
- Mock 60-second auto-refresh ticker in the top bar.

## Key building blocks

- **5-tier status badge**: Enrolled (neutral) · On Track (**white**, per §15.3) ·
  Needs Attention (**amber**, never red) · Ready to Bill (**green**) · Claim Approved.
- **`.num`** applies the monospace face to all metrics/CPT/$/timestamps.
- Reusable JS hooks: `data-panel-toggle`/`data-panel-group`, `data-tabs`,
  `data-stepper`, `data-confirm` (+ `data-status`), `data-sort` (numeric-aware),
  `data-filtergroup`/`data-filter`, `data-switch`, `data-otp`,
  `data-modal-open`/`data-modal-close`, `data-menu`, `data-loading-demo`.

## Mock data (consistent with the patient app)

Dr. Brandon Stillman, MD · Stillman Rehabilitation Group · patients incl.
John Carter (M54.5) · RTM CPT 98975–98981.

## Not built (static prototype)

Real OAuth/MFA/auth, backend/API/PHI, actual CSV/PDF generation, live Stripe,
real Dr. Brain model. All flows are mocked; numbers are illustrative but
reconcile within a screen.
