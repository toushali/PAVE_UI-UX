

|  PAVE *Healthcare. Simplified.* Functional Scope Document Version 5.0  |  MVP Prepared for: Yonathan Yehezkel & Brandon Stillman Prepared by: Swarnendu De March 2026  |  Confidential |
| :---- |

#   **1\. Business Overview**

## **1.1 The Problem**

Musculoskeletal (MSK) conditions — back pain, joint issues, post-surgical recovery, chronic mobility limitations — are among the most prevalent and costly health challenges in the United States. Despite this, the care model is fundamentally broken at the continuity layer.

Patients receive a course of in-person physical therapy constrained by insurance coverage. When coverage ends, they are discharged with a paper printout and left entirely on their own. There is no structured monitoring, no accountability, and no clinical follow-up unless the patient deteriorates enough to re-enter the system.

Physicians who oversee these patients have historically had no practical way to monitor therapeutic compliance at scale — and no reimbursable mechanism to do so. The result is poor outcomes, high recurrence rates, and significant avoidable costs.

## **1.2 The Regulatory Shift**

In 2022, CMS introduced Remote Therapeutic Monitoring (RTM) — CPT billing codes that allow licensed physicians to bill insurance for digitally monitoring a patient's therapeutic activity outside a clinical setting. These codes were materially revised and expanded as of January 2026\.

RTM means physicians can now generate recurring, insurance-reimbursable revenue by monitoring whether their patients are completing prescribed therapeutic exercises at home — provided the monitoring meets specific documented requirements.

| *PAVE is purpose-built to fill this gap — the operational infrastructure that makes RTM billing practical and compliant for any physician or group practice managing MSK or rehabilitative patients.* |
| :---- |

## **1.3 The Business Model**

**For Physicians and Group Practices**

* Physicians generate meaningful recurring revenue from patients they already treat — without significant additional time

* A physician managing 50 RTM-enrolled patients can generate substantial additional monthly billing revenue

* Group practices benefit from shared patient management across multiple providers under a single organizational account

* The average daily dashboard review is designed to take under 15 minutes for a full patient panel

**For Patients**

* Patients receive a structured, personalized rehabilitation plan from their own physician — not a generic exercise app

* Daily check-ins are simple and accessible, designed for adults aged 60–85

* Gamification makes the daily check-in engaging — streaks, badges, and milestones reward consistency without trivializing the clinical context

## **1.4 Competitive Positioning**

PAVE occupies a distinct and currently unoccupied position: a physician-side RTM compliance and billing tool with a patient-facing therapeutic interface. No comparable purpose-built RTM platform has reached meaningful market scale.

| *Speed to market is critical. The January 2026 RTM revision is recent. Physician awareness is low. PAVE's window to establish category leadership is now.* |
| :---- |

# **2\. Platform Overview**

## **2.1 What PAVE Is**

PAVE is a HIPAA-compliant, two-sided healthcare SaaS platform classified as a Software as a Medical Device (SaMD). It consists of two web applications sharing a common backend:

| Application | Who Uses It | Primary Purpose |
| :---- | :---- | :---- |
| **Provider Portal** | Physicians, group practice admins | Patient enrollment, AI plan review, billing compliance, claims approval, team management |
| **Patient Portal (PWA)** | Patients — primarily adults 60–85 | Daily check-ins, exercise plan access, progress tracking, gamified engagement |

## **2.2 Multi-Provider Architecture**

* A group practice has an Organization account containing multiple Provider accounts

* An Organization Administrator can view aggregate metrics across all providers in the practice

* Individual providers see only their own enrolled patients — cross-provider data is not shared

* Billing reporting is available at both the individual provider level and the organization level

* Patient assignment to a specific provider is managed by the Organization Administrator

# **3\. Regulatory & Compliance Context**

## **3.1 RTM Billing Requirements**

| Requirement | What Must Be Documented |
| :---- | :---- |
| Patient data transmission | Minimum check-in days within the 30-day window, per applicable CPT code |
| Physician review time | Documented minimum minutes of physician review during the billing period |
| Person-to-person contact | At least one direct physician-patient contact per billing period |
| Physician claim approval | Physician explicitly reviews and approves before submission to payer |
| Audit-ready documentation | All qualifying events logged with timestamps — sufficient for CMS audit |

## **3.2 Anti-Fraud Architecture**

* Patient submission timestamps are system-generated server-side — cannot be backdated or altered by any user

* Billing qualification calculated from patient-driven events only — physician cannot manually push a patient into qualified status

* All audit log entries are immutable — once written, cannot be edited or deleted, including by administrators

| *This anti-abuse architecture protects physicians from inadvertent billing fraud exposure and makes PAVE defensible in any CMS audit scenario.* |
| :---- |

## **3.3 SaMD Classification Requirements**

* Platform must not make diagnostic or prescriptive medical claims — therapeutic guidance only

* AI-generated plans must be reviewed and approved by a licensed physician before reaching the patient

* System must display the evidence basis for AI recommendations — the medical rationale document

* HIPAA compliance mandatory throughout

* Records must support an FDA audit

## **3.4 HIPAA Compliance**

| Requirement | Specification |
| :---- | :---- |
| Encryption at rest | AES-256 on all PHI storage |
| Encryption in transit | HTTPS / TLS 1.2+ on all transmission, no exceptions |
| Multi-Factor Authentication | Mandatory on all provider logins regardless of OAuth provider used |
| Tenant data isolation | Providers access only their own patients — enforced at API layer, not just UI |
| Immutable audit logging | Every PHI access: who, what, when, IP. Cannot be altered. |
| Session management | Provider sessions auto-expire after 15 minutes of inactivity |
| No PHI in unsecured locations | No PHI in URLs, server logs, error tracking, or third-party analytics |
| Encrypted backups | Automated daily backups, encrypted |
| Data export / deletion | Admin function to export or permanently delete any patient's PHI |
| BAA-compatible infrastructure | All PHI-handling vendors must support signed Business Associate Agreements |

# **4\. User Roles & Permissions**

| Role | Portal | Capabilities |
| :---- | :---- | :---- |
| **Organization Administrator** | Provider Portal | Manages the group practice. Adds/removes providers, assigns patients, views aggregate billing and outcome metrics. Cannot access individual patient clinical records. |
| **Physician / Provider** | Provider Portal | Full access to their own patient panel. Enrolls patients, reviews and approves AI plans, logs review time and patient contact, approves billing claims. |
| **Patient** | Patient Portal (PWA) | Access to own data only. Completes daily check-ins, views assigned exercise plan, tracks personal progress, engages with gamification. Read-only on their plan. |
| **Platform Administrator** | Backend admin | System-level access for support, compliance, and oversight. Manages provider accounts, views system-wide health, accesses audit logs. |

# **5\. Authentication & Access**

## **5.1 Provider Authentication — OAuth \+ MFA**

Providers sign in using existing enterprise identity credentials via OAuth 2.0 — eliminating separate password management and reducing adoption friction.

**Supported OAuth Providers**

* Sign in with Google (Google Workspace / Gmail)

* Sign in with Microsoft (Microsoft 365 / Outlook / Azure AD)

**MFA Layer**

* All provider logins require a second factor regardless of OAuth provider used

* MFA is enforced at the PAVE application level — not delegated to the OAuth provider's own MFA setting

* Supported: TOTP authenticator app (Google Authenticator, Authy, Microsoft Authenticator, 1Password)

* MFA cannot be disabled on any provider account

* Account locked after 5 consecutive failed MFA attempts — self-service unlock via email

**Session Behavior**

* Sessions auto-expire after 15 minutes of inactivity

* All login events logged with timestamp, IP address, and device identifier

## **5.2 Patient Authentication — Magic Link \+ Persistent Web Portal \+ PWA**

**Initial Sign-Up**

* Patients are enrolled by their physician. When enrollment and plan approval are complete, PAVE sends an invitation via the patient's preferred channel:

  * Email magic link — single-use, time-limited link that signs the patient in directly

  * SMS magic link — single-use link delivered by text message

**MFA for Patients**

* On first magic link login, patient is prompted to set up a second factor

* Supported options: SMS OTP or email OTP — both low-friction for the 60–85 demographic

* MFA setup is step-by-step guided for non-technical users

**Subsequent Logins — Persistent Session**

* Patient accesses PAVE through the web URL or installed PWA icon

* Session persists for 30 days on a trusted device — daily check-ins do not require re-authentication

* If session expires, patient requests a new magic link — no password ever

**Progressive Web App (PWA)**

* The patient portal is built as a Progressive Web App — behaves like a native app with no App Store download required

* Patients can add the PAVE icon to their phone's home screen: iOS 'Add to Home Screen' / Android 'Install App'

* Once installed, opens in full-screen app-like experience

* The standard web URL also works in any browser — PWA install is optional

| *No native iOS or Android app is built in MVP. The PWA delivers the same install-to-home-screen experience without App Store complexity or cost.* |
| :---- |

# **6\. Provider Portal — Detailed Feature Scope**

The Provider Portal is a desktop-optimized web application. Light mode. Every workflow is optimized so a physician can review their full patient panel and complete all necessary billing actions in under 15 minutes per day.

## **6.1 Dashboard**

**KPI Summary Strip**

* Four key metrics: active patients, patients ready to bill, estimated revenue available, claims pending approval

* Metrics reflect the signed-in provider's patients — or organization-wide if viewed by an Org Admin

**Conditional Alert Banner**

* Appears when billing deadlines are approaching — dismissible per session

**Prioritized Work Queues**

* Urgent Queue: patients at risk of missing their billing window

* Optimization Queue: patients on track where one specific action unlocks additional billing

* Ordering driven by proprietary priority algorithm (days remaining, events still needed, action complexity)

**Auto-Refresh**

* Dashboard refreshes every 60 seconds — patient check-in submissions are reflected within one minute

**Dismiss**

* Work queue cards dismissible via a dismiss button

## **6.2 Work Queue**

* Full-page list split into Urgent and Optimization panels

* Each patient row: name, diagnosis, check-ins vs. required, review minutes vs. required, contact call status, days remaining, status badge (white / amber / green)

* Inline action panels: Log Review Time, Log Patient Contact, Approve Claim, View Patient

* Only one panel open at a time — switching rows closes the current panel first

* Row resolves on completion: status updates, row exits to Approval Queue

## **6.3 Patient Enrollment (Multi-Step Form)**

* Step 1 — Demographics: name, date of birth, contact email, phone, preferred notification channel

* Step 2 — Clinical: diagnosis code(s), medical history flags, treatment goals, modality selection (Pilates, PT, OT, osteopathy)

* Step 3 — Provider assignment (Org Admin view) or auto-assigned to enrolling physician

* Step 4 — Review before submission

* On submission: patient record created, Dr. Brain generates plan, physician directed to plan approval

* After plan approval: invitation sent to patient via their preferred channel

## **6.4 Patient Detail View**

**Activity History Tab**

* Chronological log of all check-ins, physician review sessions, and patient contacts with timestamps

* Gamification summary visible here — current streak, badges earned, points balance

**Generated Plan Tab**

* Full Dr. Brain output by modality category

* Medical rationale section — evidence basis for each recommendation (SaMD compliance)

**Billing Window Timeline Tab**

* Visual 30-day calendar with check-ins plotted, running totals vs. thresholds, projected qualification date

**Action Log Tab**

* All physician-logged actions with timestamps — forms the audit trail for this patient's claim

**Outcome Charts Tab**

* Pain/discomfort trend: text summary showing average pain scores and direction of change

* Adherence rate: percentage of days with a check-in since enrollment

**Actions**

* Log Review Time, Log Patient Contact, Approve Claim, Approve Plan (pre-activation)

## **6.5 Approval Queue**

* Lists all claims at full RTM qualification awaiting physician approval

* Per row: patient name, billing period, qualifying CPT codes, estimated reimbursement value

* Expandable detail: full qualifying event breakdown with timestamps

* Individual approve: confirmation and claim locked

* Batch Approve All: all qualifying rows approved in one action

* Approved claims are locked and immutable — move to Reports

## **6.6 Reports**

* Analytics: CPT code distribution, revenue by period — displayed as summary table with key figures

* Active queue: approved claims awaiting CSV export

* Historical records: all past approved/exported claims, searchable by date, patient, CPT code. Expired claims visible via filter on this table.

* CSV export: all required fields included — export event logged in audit trail

## **6.7 Revenue Calculator**

* Interactive projection tool for onboarding and sales demos

* Inputs: patient panel size, expected engagement rate, billing tier assumptions

* Outputs: estimated monthly/annual RTM revenue, CPT breakdown, ROI vs. PAVE subscription cost

* Live calculation on input change — no data saved, read-only tool

## **6.8 Data Table**

* Complete tabular view of all enrolled patients — sortable, searchable, filterable by status bucket

* Computed status badges per the 5-tier classification system

* Inline quick actions: navigate to Patient Detail, log review time

## **6.9 Organization Admin View**

* Aggregate dashboard: total patients across all providers, revenue pipeline, claims pending

* Provider list: enrolled patient count and claims approved per provider

* Patient assignment management: reassign patients between providers

* Organization-level CSV export: consolidated billing report across all providers

* Provider account management: invite, deactivate, manage roles

* Organization billing settings: subscription management, invoice access

## **6.10 Settings**

* Profile: name, credentials/title, contact email, OAuth connection status

* Notification preferences: email and SMS thresholds for billing deadlines and patient activity

* MFA management: reset or update authenticator

* Organization settings (Org Admin only): practice name, provider list, billing configuration

# **7\. Patient Portal — Detailed Feature Scope**

The Patient Portal is a mobile-first Progressive Web App. Every design decision prioritizes simplicity and accessibility for adults aged 60–85. The daily check-in should take under 2 minutes.

## **7.1 Login & Onboarding**

* First access: magic link by email or SMS

* MFA setup on first login — step-by-step guided for non-technical users

* Welcome screen: brief explanation of what PAVE is

* Contact detail confirmation: patient verifies name and contact information

* Subsequent logins: session persists 30 days on trusted device

* If session expired: patient enters email or phone, receives new magic link — no password ever

## **7.2 Daily Check-In Form**

A standard single-page form. All sections visible at once. Under 2 minutes to complete.

**Form Content**

* Pain/discomfort level: large 0–10 slider with clear visual anchors

* Activities completed today: checkbox group of their prescribed exercises

* How they feel compared to yesterday: Better / About the same / Worse

* Optional note to doctor: short free-text, clearly optional

**Submission Behavior**

* On submit: check-in logged, dashboard refreshes within 60 seconds

* Confirmation screen: 'Check-in submitted. Your doctor can see your update.'

* One submission per day maximum — friendly message if duplicate attempted

* Gamification trigger: submission fires streak update, may unlock a milestone

## **7.3 Exercise Plan View**

* Plan organized by modality category (Pilates, Mobility, Strengthening, Breathing, etc.)

* Each exercise card: name, plain-language description, step-by-step instructions, frequency, completion indicator

* Tappable to expand — full instructions on tap

* Completed exercises visually marked

* Read-only — patient cannot modify their plan

## **7.4 Progress Dashboard**

* Check-in streak counter: consecutive days with a submission

* Adherence rate: percentage of days since enrollment with a check-in

* Pain score summary: plain text showing average pain score this week vs. last week

* Gamification summary: current badges, points balance, active milestone progress

# **8\. Patient Gamification**

Gamification is a first-class MVP feature. Patient adherence directly impacts physician billing revenue. The gamification system makes daily check-ins feel rewarding without trivializing the clinical context.

## **8.1 Streak System**

* Consecutive check-in days displayed prominently on patient dashboard

* Streak milestones trigger in-app celebrations: 7, 14, 30, 60, and 90 days

* Breaking a streak resets the counter to zero

## **8.2 Badge System**

* Consistency badges: 7-day streak, 30-day streak, 90-day streak, First check-in, 50th check-in

* Improvement badges: First pain score improvement, Sustained improvement (14-day downward trend), Goal achieved

* Engagement badges: Plan viewed on Day 1, All exercises completed today, Full-week completion

* Badges displayed in patient profile with earn date

* New badge triggers a congratulatory notification on patient dashboard

## **8.3 Points System**

* Daily check-in completed: 10 points

* All prescribed exercises completed in one day: 5 bonus points

* Streak milestone reached: 25–100 points depending on milestone

* Badge earned: 50 points

* Pain improvement milestone: 25 points

* Running total displayed on patient dashboard

* Points accumulate throughout enrollment — progress indicator only in MVP

## **8.4 Progress Milestones**

* First week complete, First month complete, Pain reduction of 20% / 40% / 60% from baseline

* Milestones trigger an in-app celebration message

* All milestone events logged in physician's patient view

## **8.5 Physician Visibility**

* Gamification data (streak, badges, points) visible in Activity History tab of Patient Detail View

* Disengagement signal: broken streak or badge inactivity feeds into Work Queue priority scoring

# **9\. SMS / Text Integration & Costs**

## **9.1 SMS Use Cases in MVP**

| Use Case | When It Fires | Status |
| :---- | :---- | :---- |
| Patient magic link (auth) | At enrollment invite; when patient requests new login link | **Included** |
| Patient MFA OTP | On each new login session | **Included** |
| Daily check-in reminder | Once daily at a fixed server time, if patient has not checked in | **Included** |
| Streak at-risk nudge | If patient has not checked in by late afternoon | **Included** |
| Milestone congratulations | When a streak or points milestone is reached | **Included** |
| Appointment / contact reminder | Physician schedules follow-up contact call | Not in MVP |
| Two-way SMS (patient replies) | Patient can reply with a check-in shortcode | Not in MVP |

## **9.2 SMS Provider — Twilio**

* Twilio is the selected SMS provider — HIPAA BAA available, reliable global delivery

* Delivery receipts and failure logging — SMS fails fall back to email for critical authentication messages

* All SMS events logged in platform audit trail

## **9.3 SMS Cost Structure**

Pass-through operational costs — not included in the development estimate.

| SMS Type | Twilio Cost | Volume Assumption | Monthly Est. (100 patients) |
| :---- | :---- | :---- | :---- |
| Outbound SMS (US) | $0.0079 / message | 2–3 messages per patient per day | \~$47–$71/month |
| MFA OTP via SMS | $0.0079 / message | \~1 per login event | Variable |
| Phone number rental | $1.15 / month | 1 number per region | \~$1.15/month |

## **9.4 Patient Notification Preferences**

* Patients select preferred notification channel at onboarding: SMS, email, or both

* Patients can opt out of engagement reminders — authentication messages always delivered

* Opt-out logged and respected immediately

# **10\. Dr. Brain — AI Rehabilitation Engine**

## **10.1 What Dr. Brain Is**

Dr. Brain is the AI intelligence layer at the core of PAVE. It generates personalized rehabilitation plans at patient enrollment, improves through Dr. Stillman's direct training, and operates within a sandbox-protected update workflow.

| *Dr. Brain is not a general-purpose chatbot. It is a structured, physician-supervised AI drawing against a curated clinical knowledge base. All outputs are reviewed and approved by the treating physician before reaching the patient.* |
| :---- |

## **10.2 Plan Generation at Enrollment**

**Inputs**

* Patient diagnosis code(s), medical history flags, treatment goals, selected modalities (Pilates, PT, OT, osteopathy)

**Knowledge Base**

* Curated library of clinical studies, research papers, and validated therapeutic protocols

* Organized by modality and diagnostic category

**Outputs**

* Personalized exercise and therapy plan — structured by modality, with plain-language patient instructions and clinical terminology for the physician

* Medical rationale document — evidence basis for each recommendation (required for SaMD classification)

* Both outputs stored on the patient record — not regenerated on each view

**Physician Approval**

* Generated plan and rationale displayed to physician for review before patient access is granted

* Physician clicks 'Approve Plan' — required step, not optional

* Approval timestamped and permanently recorded in audit log

## **10.3 Dr. Stillman's Training Interface**

Dr. Stillman has a dedicated training UI through which he can directly guide, correct, and expand Dr. Brain's knowledge:

* Conversational chat: discusses clinical reasoning with the AI, corrects misalignments, explores edge cases

* Document upload: uploads clinical studies, research papers, proprietary protocols directly into the knowledge base (PDF, DOCX)

* Knowledge base management: structured view of all documents in Dr. Brain's corpus — add, remove, or flag individual sources

* All training actions logged with timestamp — complete audit trail of every change

* All training inputs are staged for sandbox validation before affecting production

## **10.4 Sandbox & Staging Environment**

No update to Dr. Brain goes directly to production. All changes flow through a controlled staging environment.

**How the Sandbox Works**

* A complete, isolated replica of Dr. Brain's production model runs in staging at all times

* All proposed updates are applied to the sandbox first

* Dr. Stillman runs test enrollments in the sandbox to review what the updated model would generate

* Dr. Stillman approves promotion of sandbox changes to production — no automated deployment without human sign-off

**Protection of Existing Patient Plans**

* Existing patient plans are never retroactively altered by model updates

* New enrollments after a model update receive plans from the updated model

* The version of Dr. Brain that generated each patient's plan is logged on their record

**Rollback**

* If a production update produces unexpected results, the previous version can be restored

* Rollback requires authorization from Dr. Stillman

| *The sandbox system ensures Dr. Brain can grow continuously without any risk to clinical integrity of plans physicians have already approved.* |
| :---- |

# **11\. Data Architecture**

The platform serves all data from the database directly. All performance requirements are met at the intended pilot scale.

## **11.1 Key Data Behaviours**

| Data Type | Behaviour | Refresh |
| :---- | :---- | :---- |
| Patient exercise plan | Stored at generation and approval — served from database on every view | Only when physician triggers a plan update |
| Medical rationale document | Stored at generation | On model update or physician edit |
| Physician dashboard | Refreshed every 60 seconds automatically | Auto-refresh cycle |
| Patient billing window status | Computed server-side on each qualifying event | On every new check-in, review log, or contact log |
| Work queue ordering | Recomputed on underlying data changes | On any qualifying event |
| Historical billing reports | Immutable once claims are approved | Only when new claim approved or exported |
| Dr. Brain AI output | Stored in database at generation — not regenerated per view | Not regenerated unless physician requests a plan update |

# **12\. API Cost Dashboard & Usage Monitoring**

## **12.1 API Call Matrix**

| API / Service | Trigger | Frequency | Est. Unit Cost |
| :---- | :---- | :---- | :---- |
| Anthropic Claude API | Patient enrollment — plan generation | Once per patient enrolled | \~$0.10–$0.50 per call |
| Anthropic Claude API | Dr. Stillman training sessions | As used by Dr. Stillman | \~$0.01–$0.05 per exchange |
| Twilio SMS | Magic links, MFA OTP, reminders, milestones | 2–4 SMS per patient per day | $0.0079 per message |
| SendGrid email | Magic links, notifications | Per send event | \~$0.00035/email |
| OAuth (Google/Microsoft) | Provider login events | Per login | Free at expected volume |
| Stripe | Subscription billing, invoicing | Per transaction | 2.9% \+ $0.30 per charge |
| Supabase (DB) | All data reads/writes | Continuous | \~$25–$100/month at MVP scale |
| File / document storage | Uploaded docs in training UI | Per upload | \~$0.023/GB/month |

## **12.2 Usage Cost Dashboard**

* Total API spend to date (current month and rolling 12 months)

* Spend broken down by service: Claude API, Twilio, email, database, storage, Stripe

* Per-event log: every individual API call with timestamp, type, tokens used (for AI calls), and cost

* Trend charts: spending over time

* Budget alert thresholds: set monthly limits per service — alerts fire when threshold is approached

**AI Token Tracking**

* Every Claude API call logs: input tokens, output tokens, total tokens, model used, estimated cost

* Token usage attributed to the triggering event: patient enrollment, training session, etc.

**Exportable Accounting Report**

* One-click CSV export — formatted for accounting/finance use

* Export includes: period, service, event type, quantity, unit cost, total cost

* Filterable by date range and service type

# **13\. Payment Infrastructure**

## **13.1 Architecture**

* All payment processing handled by Stripe — PCI DSS Level 1 certified

* PAVE never stores, processes, or transmits raw card data — Stripe's infrastructure handles all card data

* PAVE stores only Stripe-issued token references

## **13.2 Payment Security Controls**

| Control | Implementation |
| :---- | :---- |
| Card data handling | Stripe.js / Stripe Elements — card data never touches PAVE servers |
| Tokenization | Stripe payment methods stored as tokens only — no raw card data in PAVE database |
| Webhook verification | All Stripe webhooks verified using Stripe's signature |
| Failed payment handling | Standard Stripe retry logic on failed payments |
| Fraud detection | Stripe Radar — ML-based fraud detection |
| PCI DSS compliance | Stripe holds Level 1 certification; PAVE architecture keeps card data out of scope |

## **13.3 Subscription Management**

* Individual provider subscriptions: monthly or annual billing per provider account

* Group practice subscriptions: volume-based pricing across multi-provider organizations

* Subscription changes (upgrades, downgrades, cancellations) — immediate or end-of-period

* Invoices generated and stored by Stripe — accessible to Organization Administrators in Settings

# **14\. Backend Reports & Audit Dashboards**

## **14.1 Provider Activity Reports**

* Login frequency per provider — identifies inactive providers

* Patients enrolled per provider: enrollment rate over time, total active panel size

* Average review time logged — identifies physicians logging minimal review time

* Claim approval rate: qualified claims approved vs. expired per provider

* Plan approval time: average time from enrollment to plan approval

## **14.2 Patient Activity Reports**

* Check-in submission rates: daily, by day of week, by time of day

* Streak distribution: patients maintaining active streaks vs. lapsed

* Gamification engagement: badge earn rates, points accumulation, milestone achievement rates

* Dropout indicators: patients not logged in within 7/14/30 days — flagged for physician outreach

* Pain trend aggregates: de-identified population-level improvement data

## **14.3 AI & Token Usage Reports**

* Total Claude API calls per period

* Token consumption per call: input tokens, output tokens, total — with cost attribution

* Plan generation log: every patient enrollment with associated token usage

* Dr. Brain training session log: every interaction by Dr. Stillman — token count, documents uploaded

## **14.4 HIPAA Audit Reports**

* PHI access log: every access to patient health data — who, what record, what action, timestamp, IP

* Failed authentication log: all failed login attempts with IP address

* Export events: every CSV export — who exported, when, what was included

* Admin action log: all administrative actions including user creation, deactivation, role changes

* Session log: all provider session starts, ends, and idle-timeout events

* Audit log retention: minimum 6 years — meeting HIPAA documentation retention requirement

* All audit reports exportable as CSV

## **14.5 Export**

* All reports exportable as CSV

* Custom date ranges supported on all reports

* Organization-level vs. platform-level: Org Admins see only their practice's data

# **15\. Billing Compliance Engine**

| *The specific threshold values, CPT code logic, and qualification rules are proprietary and will be provided under NDA. This section describes functional behaviour.* |
| :---- |

## **15.1 Rolling 30-Day Window**

* Each patient's billing window begins on their enrollment date — not synchronized to a calendar month

* At window end, claim becomes available for physician approval if qualifying thresholds are met

* New 30-day window begins immediately — continuous enrollment means continuous billing opportunity

* Each patient's window tracked independently with per-patient precision

## **15.2 Qualifying Events Tracked**

| Event | How Recorded |
| :---- | :---- |
| Patient check-in submission | Server-side timestamp at form submission — cannot be altered by any user |
| Physician review time | Physician logs minutes directly — multiple entries accumulate toward period total |
| Patient contact call | Physician logs occurrence with date — binary qualifying event per period |
| Plan approval | System-generated at physician approval — one-time permanent record |
| Claim approval | System-generated at physician claim approval — locks claim, closes qualifying period |

## **15.3 Patient Status Classification (5-Tier)**

| Status | Meaning | Visual Treatment |
| :---- | :---- | :---- |
| **Enrolled** | Window just begun — no action required yet | Neutral / no badge |
| **On Track** | Meeting check-in frequency; review time accumulating normally | White badge |
| **Needs Attention** | One or more thresholds at risk — action required | Amber badge |
| **Ready to Bill** | All qualifying thresholds met — claim available for approval | Green badge |
| **Claim Approved** | Physician approved — patient enters new 30-day window | Approved indicator |

## **15.4 Anti-Abuse Controls**

* Patient submission timestamps generated server-side — no user can alter them

* Check-in threshold calculated from patient-driven events only

* Review time is physician-logged, not inferred or auto-generated

* Contact call requires explicit physician action

# **16\. UI/UX Design Requirements**

## **16.1 Provider Portal**

* Light mode — clean, data-dense clinical aesthetic

* Monospace numbers for all metrics and financial data

* Minimal borders, clean layout, smooth transitions

* Desktop-optimized at 1100px max-width

## **16.2 Patient Portal**

* Mobile-first responsive — primary use case is smartphone via PWA

* Simple, warm, supportive aesthetic — clinical but not intimidating

* Large touch targets throughout — minimum 48px

* Accessible for adults 60–85 — no assumed technical sophistication

## **16.3 Key Interaction Behaviours (Provider Portal)**

| Interaction | Behaviour |
| :---- | :---- |
| Inline panels (expand/collapse) | Slide down/up — content persists during close |
| Panel switching (same row) | Content cross-fades |
| Panel switching (different row) | Old closes first, then new opens |
| Status slot change | Scale pulse on status update |
| Row resolution (claim qualified) | Status updates — row exits to Approval Queue |
| Approve action | Confirmation banner from top; auto-dismiss after 4 seconds |
| Dismiss work queue card | Dismiss button removes card from queue |
| Page transitions | Content fades in and rises on mount |
| Dashboard auto-refresh | Metrics update every 60 seconds |
| Gamification celebration | Badge / milestone: in-app notification \+ message |

# **17\. MVP Scope Boundary**

## **17.1 Included in MVP**

| Component | Scope |
| :---- | :---- |
| **Provider Portal** | 10 pages: Dashboard, Work Queue, Patient Enrollment, Patient Detail View, Approval Queue, Reports, Revenue Calculator, Data Table, Org Admin View, Settings |
| **Patient Portal (PWA)** | 5 pages: Login / Magic Link, Daily Check-In Form, Exercise Plan View, Progress Dashboard, Gamification / Achievements |
| **Authentication** | Provider: OAuth (Google, Microsoft) \+ mandatory MFA. Patient: magic link (email or SMS) \+ OTP MFA \+ 30-day persistent session. |
| **Multi-provider accounts** | Organization Administrator role, group practice dashboard, provider management, cross-provider reporting |
| **Patient Gamification** | Streak system, badge system, points system, progress milestones, in-app celebrations |
| **Dr. Brain AI Engine** | Enrollment plan generation, medical rationale output, Dr. Stillman training UI (chat \+ document upload), knowledge base management, sandbox/staging environment |
| **Billing Compliance Engine** | RTM qualification logic, 5-tier status classification, rolling 30-day windows, CPT code determination, claim approval workflow, anti-abuse controls, CSV export |
| **SMS Integration** | Magic links, MFA OTP, daily reminders, streak nudges, milestone alerts — via Twilio |
| **API Cost Dashboard** | Total API spend tracking, token usage, per-service breakdown, exportable accounting CSV |
| **Payment Infrastructure** | Stripe — PCI DSS Level 1, tokenization, Radar fraud detection, subscription billing, invoice management |
| **Backend Audit Reports** | Provider activity, patient engagement, AI token usage, HIPAA audit logs — all exportable as CSV |
| **Real-Time Updates** | 60-second auto-refresh for dashboard updates on patient submissions |
| **HIPAA Compliance** | AES-256 encryption, immutable audit logs, MFA, tenant isolation, BAA-compatible infrastructure |

## **17.2 Explicitly Out of Scope for MVP**

| Feature | Notes |
| :---- | :---- |
| Native iOS / Android apps | Patient access is via Progressive Web App only. No App Store submission. |
| Video exercise demonstrations | Exercise instructions are text-based. Video demonstrations are not in scope. |
| In-platform physician-patient messaging | Communication via phone call (logged) or external channels |
| EHR / EMR integration | No Epic, Cerner, or other EHR integration is in scope. |
| Direct insurance claim submission | PAVE generates a CSV export. The physician submits to their billing system externally. |
| Two-way SMS (patient replies) | Outbound SMS only. Patients cannot reply by text. |
| Physician plan editing post-approval | Plans are approved as generated. Post-approval editing is not in scope. |
| Adaptive AI plan progression | The AI plan does not automatically update based on patient progress. It is static after approval. |
| Gamification reward redemption | Points are a progress indicator only. Reward redemption is not in scope. |
| Streak freeze mechanics | Missing a day breaks the streak. Freeze mechanics are not in scope. |
| Dark mode | Light mode only. Dark mode is not in scope. |
| Apple OAuth | Google and Microsoft OAuth are supported. Apple OAuth is not in scope. |
| Timezone-aware SMS scheduling | SMS reminders are sent at a fixed server time. Per-patient timezone scheduling is not in scope. |
| 3DS2 strong authentication | Standard Stripe card flow. 3DS2 is not required for the US market. |
| Automated test suites | Quality assurance is performed via manual testing. Automated test suites are not in scope. |
| Redis caching layer | Database queries are used directly. Redis caching is not in scope. |
| CI/CD deployment pipeline | Deployment is performed manually. Automated CI/CD pipeline is not in scope. |
| PDF export | All reports are exported as CSV. PDF generation is not in scope. |
| Per-provider API cost attribution | Total platform cost view. Per-provider cost attribution is not in scope. |
| Continuous learning pipeline (automated) | Dr. Stillman trains Dr. Brain manually via the training UI. Automated usage data aggregation is not in scope. |
| Dr. Brain sandbox side-by-side comparison | Sandbox output is reviewed on its own. A side-by-side comparison view is not in scope. |
| Document annotation tools in Dr. Brain training | Document upload and conversational training are included. Inline plan annotation markup is not in scope. |
| Dr. Brain full version history log | Promote and revert between versions is supported. A full 90-day version history log is not in scope. |

# **18\. Key Considerations**

All capabilities listed below are fully included in this MVP scope at the $52,000 budget.

| Consideration | Why Included | Risk if Deferred |
| :---- | :---- | :---- |
| **HIPAA compliance architecture** | Non-negotiable for clinical operation and physician trust | Platform cannot be used clinically |
| **RTM billing logic engine** | Core physician value proposition — the reason PAVE exists | Eliminates the primary revenue case |
| **Anti-abuse controls** | Protects physicians from CMS billing fraud exposure | Physician audit and fraud liability |
| **Immutable audit trail** | Required for SaMD classification and CMS audit readiness | Cannot defend a billing dispute |
| **Multi-provider / Org accounts** | Group practices are the primary distribution channel at scale | Limits market to solo physicians only |
| **Patient gamification** | Patient adherence directly drives physician billing revenue | Higher dropout, fewer qualified billing periods |
| **OAuth provider login (Google \+ Microsoft)** | Removes password friction — critical for physician adoption rate | Higher onboarding abandonment |
| **Patient PWA** | App-like experience without App Store — key for 60–85 demographic | Less engagement vs. installable app experience |
| **SMS integration** | Daily reminders are primary driver of check-in adherence for target demographic | Lower check-in rates, fewer qualified periods |
| **Dr. Brain training UI** | Dr. Stillman's ability to train the model is the core long-term differentiator | Model stagnates; competitors catch up |
| **Dr. Brain sandbox** | Protects existing patient plans from unvalidated model changes | Clinical safety risk |
| **API cost dashboard** | Operational cost visibility is essential for business management | No visibility into growing AI and SMS costs |
| **Payment security (Stripe)** | PCI compliance required — physician practices will not use a platform with weak payment security | Cannot collect revenue |
| **Backend usage reports** | Required for operations, HIPAA compliance evidence, and investor reporting | Blind spots in operations and compliance |

Prepared by Swarnendu De  |  March 2026

*This document is confidential and prepared exclusively for Yonathan Yehezkel and Brandon Stillman.*  
