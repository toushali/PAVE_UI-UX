# M2 -- Billing Engine + Provider Portal Core

**Weeks 3-6 | 68 man-days**

---

## Team Allocation

| Role | Focus | Days |
|---|---|---|
| Tech Lead | Integration points, code review, billing architecture review | 20 |
| Backend Dev 1 | Billing engine (full time, 4 weeks) | 20 |
| Frontend Dev 1 | Dashboard + work queue + enrollment form | 20 |
| UI/UX Designer | Handoff: work queue, enrollment, patient detail, approval queue, reports | 4 |
| QA Engineer | Billing critical path testing (ramp-up, part time) | 4 |

---

## FSD Sections Covered

- Section 6.1: Dashboard (KPI strip, alert banner, work queues, auto-refresh, dismiss)
- Section 6.2: Work Queue (full-page view, inline actions, panel behaviors)
- Section 6.3: Patient Enrollment (4-step form, ICD-10 search, modality selection)
- Section 15.1: Rolling 30-Day Window
- Section 15.2: Qualifying Events Tracked
- Section 15.3: Patient Status Classification (5-Tier)
- Section 15.4: Anti-Abuse Controls
- Section 15A: Complaint Handling and MDR (backend schema only, UI in M4)
- Section 16.3: Key Interaction Behaviours (provider portal animations)

---

## Functional Requirements

### 1. RTM Billing Compliance Engine

**Rolling 30-day window**
- Each patient's billing window begins on enrollment date, not synchronized to calendar month
- At window end, if qualifying thresholds are met, claim becomes available for physician approval
- New 30-day window begins immediately on close -- continuous enrollment means continuous billing
- Each patient's window tracked independently with per-patient precision
- Window auto-creation on close -- no manual intervention required

**Qualifying event logging**
- Patient check-in submission: server-side timestamp at exact moment of form submission -- cannot be altered by any user including administrators
- Physician review time: physician logs minutes directly -- multiple entries accumulate toward period total
- Patient contact call: physician logs occurrence with date -- binary qualifying event per period
- Plan approval: system-generated at physician approval click -- one-time permanent record
- Claim approval: system-generated at physician claim approval -- locks claim, closes qualifying period

**5-tier real-time status classification**
- Enrolled: window just begun, no action required yet (neutral, no badge)
- On Track: meeting check-in frequency, review time accumulating normally (white badge)
- Needs Attention: one or more thresholds at risk, action required (amber badge)
- Ready to Bill: all qualifying thresholds met, claim available for approval (green badge)
- Claim Approved: physician approved, patient enters new 30-day window (approved indicator)
- Classification recalculates on every qualifying event across the full patient panel

**Priority scoring algorithm**
- Within Needs Attention and On Track, patients ranked by urgency score
- Algorithm considers: days remaining in current billing window, number of qualifying events still needed, time required to complete missing actions (logging a contact takes seconds; accumulating review minutes takes longer), proximity to next billing tier threshold
- Result: dynamically ordered work queue where physician always sees highest-impact patients first

**Anti-abuse controls**
- Patient submission timestamps generated server-side -- no user can alter them
- Check-in threshold calculated from patient-driven events only -- physician cannot manually credit a patient with a check-in
- Review time is physician-logged, not inferred or auto-generated
- Contact call requires explicit physician action -- system does not assume contact occurred

**Immutable audit trail**
- Every qualifying event written to append-only audit log
- Each entry: event type, patient ID, provider ID, timestamp, IP address, action detail
- Entries cannot be edited or deleted by any user including platform administrators
- Audit trail forms the core evidence for CMS audit defense

**Complaint handling schema (backend only)**
- Database tables for complaint intake, investigation tracking, resolution records, MDR escalation flags
- Complaint lifecycle: Open, Investigating, Resolved, Escalated
- 6-year retention on all complaint records
- Admin UI deferred to M4 -- backend schema and API endpoints built now

### 2. Provider Dashboard (Section 6.1)

**KPI summary strip**
- Four key metrics displayed prominently at top:
  - Total active patients currently enrolled in RTM monitoring
  - Patients ready to bill this period (reached full qualification threshold)
  - Estimated revenue available for claim approval this period
  - Claims pending physician approval
- Metrics reflect signed-in provider's patients, or organization-wide if viewed by Org Admin

**Conditional alert banner**
- Appears when billing deadlines approaching -- patients at risk of window expiry
- Dismissible per session -- re-appears if condition persists on next login

**Prioritized work queues**
- Two side-by-side queues:
  - Urgent Queue: patients at risk of missing their billing window
  - Optimization Queue: patients on track where one specific action unlocks additional billing or higher reimbursement tier
- Ordering driven by proprietary priority scoring algorithm
- Each queue card shows: patient name, key metric summary, required action

**Auto-refresh**
- Dashboard data refreshes every 60 seconds
- Patient check-in submissions reflected within one refresh cycle
- No page reload -- data updates in place

**Dismiss**
- Work queue cards dismissible via dismiss button
- Dismissed cards removed from view for current session

### 3. Work Queue -- Full-Page View (Section 6.2)

**Layout**
- Full-page list split into Urgent and Optimization panels (same logic as dashboard)
- Each patient row displays: name, diagnosis, check-ins logged vs. required, review minutes logged vs. required, contact call status, days remaining in window, status badge (white / amber / green)

**Inline action panels**
- Log Review Time: physician enters minutes reviewed -- adds to running total for billing period
- Log Patient Contact: records that direct physician-patient contact occurred -- captures date and brief note
- Approve Claim: available only when patient at full qualification -- opens quick confirmation
- View Patient: navigates to Patient Detail View

**Panel interaction behaviors**
- Only one inline panel open at a time across entire list
- Opening a panel on a different row: current panel closes first, then new one opens
- Content cross-fades when switching panels on the same row
- Inline panels slide down on open, slide up on close -- content persists during close animation

**Row resolution**
- When patient reaches full qualification as result of an action:
  - Status badge updates with scale pulse animation
  - Row transitions out to Approval Queue
  - Confirmation banner appears from top, auto-dismisses after 4 seconds

### 4. Patient Enrollment Form (Section 6.3)

**Step 1 -- Demographics**
- Full legal name
- Date of birth
- Contact email address
- Contact phone number
- Preferred notification channel (email, SMS, or both)
- Each field validated before advancing

**Step 2 -- Clinical information**
- Primary diagnosis code(s): searchable ICD-10 code list -- physician types and selects from filtered results
- Relevant medical history flags: checkboxes for contraindications or modifiers (post-surgical, chronic pain, limited mobility)
- Treatment goals: structured selection (pain reduction, mobility improvement, return to activity)
- Modality selection: Pilates, Physical Therapy, Occupational Therapy, Osteopathy -- multiple can be selected

**Step 3 -- Provider assignment**
- If enrolling physician is a solo provider: auto-assigned
- If Org Admin enrolling: select from provider list within the organization

**Step 4 -- Review and submit**
- Summary of all inputs before submission
- Any field editable by going back to previous step

**On submission**
- Patient record created in database
- Billing window clock starts
- Dr. Brain called to generate plan (stubbed with mock output in M2 -- real integration in M3)
- Physician directed to generated plan for review and approval
- After plan approval: invitation sent to patient via preferred channel

### 5. HIPAA Audit Middleware

- Cross-cutting middleware on all PHI-touching API endpoints
- Every access logged: user identity, action performed, timestamp, IP address, resource accessed
- Write-protected audit entries -- append-only, no update or delete operations
- Middleware applied automatically to all existing and future endpoints
- No PHI in server logs, error tracking, or analytics -- validated

---

## Recommended Tools

| Need | Tool | Why |
|---|---|---|
| Date arithmetic (rolling windows) | date-fns | Lightweight date manipulation. Window boundary calculations, days remaining. |
| Data tables (work queue rows) | TanStack Table + shadcn/ui | Headless table logic + accessible UI. Sorting, filtering, status badges, inline actions. |
| Animations (12 behaviors) | Motion (Framer Motion) | Declarative API. Handles slide-down/up, cross-fade, pulse, row exit, confirmation banner. |
| Forms (enrollment, inline actions) | react-hook-form + zod | Multi-step enrollment form. Schema validation on client and server. Minimal re-renders. |
| Charts (KPI strip) | Recharts or Tremor | KPI cards, ring indicators, trend sparklines. Tremor has pre-built dashboard primitives. |
| Scheduled jobs (window auto-creation) | Supabase pg_cron or Edge Functions | Scheduled check for expired windows. Auto-creates new window on close. |

---

## Dependencies

- CPT billing logic specification must be in hand before M2 starts (client delivers in Week 1)
- Replit prototype source code available for billing logic reference
- ICD-10 code list available for enrollment form search (or stubbed with partial data)
- M1 auth and database schema must be complete

---

## Exit Gate

Enrol a test patient. They appear on the physician's dashboard in the correct status bucket. Simulate check-in events -- billing status updates in real time. Work queue re-prioritizes correctly. Priority algorithm places highest-urgency patients at top. Inline action panels open and close with correct animation behavior. 60-second auto-refresh confirmed working.
