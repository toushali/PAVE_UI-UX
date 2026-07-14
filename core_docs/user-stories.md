# PAVE — User Stories (derived from FSD v5.0)

> Neither the FSD nor the Delivery Planner contained user stories. These were
> authored from **FSD v5.0** (feature scope) and the **Delivery Planner** (milestones)
> to give the design/build a testable, screen-level backlog. IDs are referenced by
> [gap-analysis.md](gap-analysis.md).
>
> Format: **As a** \<role\>, **I want** \<capability\>, **so that** \<value\>. AC = key acceptance criteria. Each story cites its FSD section.
>
> Roles: **Patient** (PWA, v1) · **Provider/Physician** (portal, pro1) · **Org Admin** (portal).

---

## PATIENT — Patient Portal (PWA)

### Epic P-A · Authentication & Onboarding (FSD §5.2, §7.1)
- **P-1 Magic-link sign-in.** As a patient, I want to sign in from an email/SMS link with no password, so that access is effortless. *AC:* enter email or phone → request link; expired-session screen offers a new link. (§5.2)
- **P-2 Guided MFA setup.** As a first-time patient, I want a step-by-step OTP setup (SMS or email), so that I can secure my account without technical help. *AC:* choose channel → receive code → enter OTP boxes → confirmed. (§5.2, §7.1)
- **P-3 Welcome & contact confirmation.** As a new patient, I want a short "what PAVE is" welcome and to confirm my name/contact + preferred notification channel (SMS/email/both), so that reminders reach me correctly. (§7.1, §9.4)
- **P-4 Install to home screen.** As a patient, I want to add PAVE to my home screen, so that it opens like an app. *AC:* install prompt/help; full-screen PWA. (§5.2)
- **P-5 Persistent session.** As a returning patient, I want to stay signed in ~30 days on my device, so that daily check-ins need no re-login. (§5.2)

### Epic P-B · Daily Check-In (FSD §7.2)
- **P-6 Pain level.** As a patient, I want a large 0–10 pain slider with clear anchors, so that I can report how I feel. (§7.2)
- **P-7 Activities completed.** As a patient, I want to check off the exercises I did today, so that my adherence is recorded. (§7.2)
- **P-8 Comparative feeling.** As a patient, I want to pick Better / About the same / Worse, so that my doctor sees my trend. (§7.2)
- **P-9 Optional note.** As a patient, I want an optional short note to my doctor, so that I can add context. (§7.2)
- **P-10 Submit & confirm.** As a patient, I want a clear confirmation after submit, so that I know my doctor can see it. *AC:* "Check-in submitted" screen; one submission/day max with a friendly duplicate message. (§7.2)

### Epic P-C · Exercise Plan (FSD §7.3)
- **P-11 Plan by modality.** As a patient, I want my plan grouped by modality (Pilates, Mobility, Strengthening, Breathing), so that it's easy to follow. (§7.3)
- **P-12 Exercise detail.** As a patient, I want each exercise's name, plain description, step-by-step instructions and frequency on its own page, so that I can do it correctly (text, not video). (§7.3, §17.2)
- **P-13 Completion marking.** As a patient, I want completed exercises visibly marked and a "mark done" that syncs to my check-in, so that I track what's left. Read-only plan. (§7.3)

### Epic P-D · Progress Dashboard (FSD §7.4)
- **P-14 Streak & adherence.** As a patient, I want to see my check-in streak and adherence %, so that I stay motivated. (§7.4)
- **P-15 Pain summary.** As a patient, I want a plain-text pain summary (this week vs last), so that I understand my direction. (§7.4)
- **P-16 Gamification summary.** As a patient, I want my badges, points and active milestone progress visible, so that I feel rewarded. (§7.4, §8)

### Epic P-E · Gamification (FSD §8)
- **P-17 Streak milestones.** As a patient, I want celebrations at 7/14/30/60/90 days, so that consistency feels earned. (§8.1)
- **P-18 Badges.** As a patient, I want consistency/improvement/engagement badges with earn dates, so that I collect achievements. (§8.2)
- **P-19 Points.** As a patient, I want points for check-ins, full-exercise days and milestones, with a running total, so that I see progress. (§8.3)
- **P-20 Milestone celebration.** As a patient, I want an in-app celebration when I hit a milestone, so that it feels significant. (§8.4)

### Epic P-F · Settings & Notifications (FSD §7, §9.4)
- **P-21 Notification preferences.** As a patient, I want to set/opt out of SMS & email reminders (auth messages always sent), so that I control contact. (§9.4)
- **P-22 Account & help.** As a patient, I want profile/contact info, help, and an offline state, so that the app is usable and reassuring. (§7, §16.2)

---

## PROVIDER — Provider Portal

### Epic PR-A · Authentication (FSD §5.1)
- **PR-1 OAuth sign-in.** As a provider, I want to sign in with Google/Microsoft, so that I avoid password management. (§5.1)
- **PR-2 Mandatory MFA.** As a provider, I want an enforced TOTP MFA step, so that PHI access is secured. *AC:* MFA cannot be skipped; 15-min idle timeout. (§5.1)

### Epic PR-B · Dashboard & Work Queue (FSD §6.1, §6.2, §16.3)
- **PR-3 KPI strip.** As a provider, I want active patients, ready-to-bill, revenue available and claims-pending at a glance, so that I know my day in seconds. (§6.1)
- **PR-4 Alert banner.** As a provider, I want a dismissible banner when billing deadlines approach, so that I don't miss windows. (§6.1)
- **PR-5 Prioritized queues.** As a provider, I want Urgent and Optimization queues ordered by priority, so that I act on the highest-value patients first. (§6.1)
- **PR-6 Inline actions.** As a provider, I want to Log Review Time, Log Contact, Approve Claim and View Patient inline (one panel open at a time), so that I resolve rows without leaving the page. (§6.2, §16.3)
- **PR-7 Status pulse & resolution.** As a provider, I want a scale-pulse on status change and rows to exit to Approvals when qualified, so that progress is obvious. (§16.3)
- **PR-8 Auto-refresh.** As a provider, I want a 60-second refresh, so that new check-ins appear within a minute. (§6.1)

### Epic PR-C · Patient Enrollment (FSD §6.3)
- **PR-9 Multi-step enrollment.** As a provider, I want a 4-step form (demographics → clinical/ICD-10 + modalities → provider assignment → review), so that I enroll patients accurately. (§6.3)
- **PR-10 Trigger plan + invite.** As a provider, I want submission to create the record, trigger Dr. Brain, and send the invite after plan approval, so that onboarding is one flow. (§6.3, §10.2)

### Epic PR-D · Patient Detail (FSD §6.4)
- **PR-11 Activity history.** As a provider, I want a chronological log of check-ins/reviews/contacts + gamification summary, so that I see engagement. (§6.4)
- **PR-12 Generated plan + rationale.** As a provider, I want the Dr. Brain plan by modality with the medical-rationale/evidence basis, so that I can review before approving (SaMD). (§6.4, §10.2)
- **PR-13 Plan approval.** As a provider, I want an explicit **Approve Plan** step before the patient gets access, so that no plan reaches a patient unreviewed. *AC:* approval timestamped/logged. (§6.3, §10.2)
- **PR-14 Billing window timeline.** As a provider, I want a 30-day calendar with check-ins plotted vs thresholds and a projected qualification date, so that I see billing status. (§6.4)
- **PR-15 Action log.** As a provider, I want all my logged actions with timestamps, so that the claim has an audit trail. (§6.4)
- **PR-16 Outcome charts.** As a provider, I want pain-trend and adherence summaries, so that I gauge outcomes. (§6.4)

### Epic PR-E · Approvals & Billing (FSD §6.5, §15)
- **PR-17 Approval queue.** As a provider, I want qualified claims listed with patient, period, CPT codes and estimated reimbursement, so that I can approve billing. (§6.5)
- **PR-18 Expandable evidence.** As a provider, I want an expandable per-claim breakdown of qualifying events with timestamps, so that I can verify before approving. (§6.5)
- **PR-19 Individual & batch approve.** As a provider, I want to approve one claim or Batch-Approve-All, so that I clear the queue fast; approved claims lock (immutable). (§6.5, §15.2)
- **PR-20 5-tier status.** As a provider, I want Enrolled/On-Track/Needs-Attention/Ready-to-Bill/Claim-Approved badges (amber never red), so that status reads instantly. (§15.3)

### Epic PR-F · Reports & Revenue (FSD §6.6, §6.7)
- **PR-21 Reports analytics.** As a provider, I want CPT distribution and revenue-by-period (with trend graphs) plus a ready-to-export queue, so that I understand my billing. (§6.6)
- **PR-22 Historical records.** As a provider, I want a searchable/filterable history (incl. expired claims via filter), so that I can find any claim. (§6.6)
- **PR-23 CSV export.** As a provider, I want one-click CSV export (event logged), so that I submit to my external billing system. (§6.6, §17.2)
- **PR-24 Revenue calculator.** As a provider/prospect, I want a live revenue projection from panel size/engagement/tier, so that I see ROI. (§6.7)

### Epic PR-G · Data Table (FSD §6.8)
- **PR-25 All-patients table.** As a provider, I want a sortable/searchable/filterable table of all patients with computed 5-tier badges and inline quick actions, so that I manage the panel at scale. (§6.8)

### Epic PR-H · Dr. Brain (FSD §10.3, §10.4)
- **PR-26 Conversational training.** As Dr. Stillman, I want to chat with Dr. Brain to correct reasoning, so that the model improves. (§10.3)
- **PR-27 Knowledge base.** As Dr. Stillman, I want to upload documents (PDF/DOCX) and add/remove/flag sources, so that I curate the corpus. (§10.3)
- **PR-28 Sandbox & promotion.** As Dr. Stillman, I want to run a sandbox test enrollment and promote/rollback with sign-off (model version tagged per patient), so that changes never risk approved plans. (§10.4)

### Epic PR-I · Settings (FSD §6.10)
- **PR-29 Profile & security.** As a provider, I want profile/credentials, OAuth status, MFA reset and notification thresholds, so that I manage my account. (§6.10)

### Epic PR-J · API Cost Dashboard (FSD §12) — *NEW screen*
- **PR-30 Cost visibility.** As an operator/provider-admin, I want total API spend, per-service breakdown (Claude/Twilio/email/DB/Stripe), token tracking, trend charts, budget alerts and an accounting CSV export, so that I control operating costs. (§12)

---

## ORG ADMIN — Provider Portal (elevated)

### Epic OA-A · Organization Management (FSD §2.2, §6.9)
- **OA-1 Aggregate dashboard.** As an Org Admin, I want total patients, revenue pipeline and claims-pending across all providers, so that I see practice health. (§6.9)
- **OA-2 Provider list.** As an Org Admin, I want per-provider patient count and claims approved, so that I gauge productivity. (§6.9)
- **OA-3 Patient reassignment.** As an Org Admin, I want to reassign patients between providers, so that panels stay balanced. (§6.9)
- **OA-4 Org CSV export.** As an Org Admin, I want a consolidated org-level billing CSV, so that I report across the practice. (§6.9)
- **OA-5 Provider account management.** As an Org Admin, I want to invite, deactivate and set roles for providers, so that I control access. (§6.9)
- **OA-6 Org billing settings.** As an Org Admin, I want subscription management and invoice access, so that I run the practice's account. (§6.9, §13.3)

---

## Out of scope for the design prototype (FSD, but not patient/provider UI)
Platform-Admin **backend** dashboards — Provider/Patient activity reports, AI/token usage reports, **HIPAA audit reports** (PHI access, failed-auth, export, admin-action, session logs) (§14); Stripe **card-entry / webhooks** internals (§13); actual SMS/email sending, real Dr. Brain model, real billing engine (§9, §10, §15). These are backend/ops, delivered via the Platform Administrator role (§4), not the two design portals.
