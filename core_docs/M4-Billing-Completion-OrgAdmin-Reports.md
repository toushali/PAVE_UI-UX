# M4 -- Billing Completion + Org Admin + Reports

**Weeks 11-13 | 42 man-days**

---

## Team Allocation

| Role | Focus | Days |
|---|---|---|
| Tech Lead | Integration review, billing completion verification | 6 |
| Frontend Dev 1 | Approval Queue, Reports, Revenue Calculator, Org Admin, Data Table, Settings | 18 |
| Backend Dev 1 | Claim locking, CSV export, billing cycle completion, org-level APIs | 12 |
| QA Engineer | End-to-end RTM billing cycle testing (ramp-up) | 4 |
| Project Manager | Milestone demos, scope management | 2 |

---

## FSD Sections Covered

- Section 6.5: Approval Queue
- Section 6.6: Reports
- Section 6.7: Revenue Calculator
- Section 6.8: Data Table
- Section 6.9: Organization Admin View
- Section 6.10: Settings
- Section 15A: Complaint Handling and MDR (admin UI)

---

## Functional Requirements

### 1. Approval Queue (Section 6.5)

**Claims list**
- All billing claims that have reached full RTM qualification, awaiting physician approval
- Per claim row: patient name, billing period (start and end date of the 30-day window), qualifying CPT codes, estimated reimbursement value
- Expandable detail row: full breakdown of qualifying events (check-ins, review minutes, contact call) with timestamps

**Approval actions**
- Individual approve: physician reviews qualifying event summary, clicks Approve. Row slides out with confirmation animation. Full-width confirmation banner appears from top, auto-dismisses after 4 seconds.
- Batch Approve All: approves all currently qualified claims in single action. Rows resolve with staggered animation sequence.
- Approved claims are locked -- cannot be unapproved or edited
- Approval event permanently recorded in audit log with physician identity and timestamp

**Claim locking**
- Approval is a one-way action
- Locked claims cannot be modified by any user
- Mirrors the finality of a submitted insurance claim
- Locked claim snapshot saved with all qualifying event data frozen at time of approval

### 2. Reports (Section 6.6)

**Analytics overview**
- CPT code distribution across all approved claims: summary table with key figures
- Revenue by period (weekly, monthly): summary table
- Total claims approved, total estimated revenue, average reimbursement per claim

**Active queue**
- Approved claims awaiting CSV export -- physician's next billing submission cycle
- Individual actions available for any pending exports

**Historical records**
- All past approved and exported claims
- Searchable and filterable by date range, patient name, CPT code
- Expired claims (patients who missed qualification window) accessible via filter on same table

**CSV export**
- One-click export of approved claims in formatted CSV
- CSV structure compatible with third-party medical billing system ingestion
- Export includes: patient identifiers, CPT codes, billing period dates, qualifying event summary
- Export event logged in audit trail with: who exported, when, what was included

### 3. Revenue Calculator (Section 6.7)

**Inputs (physician-controlled)**
- Number of patients to enrol in RTM
- Expected patient engagement rate (percentage who will hit check-in threshold)
- Practice billing rate assumptions

**Outputs (live-calculated)**
- Estimated monthly RTM billing revenue
- Estimated annual revenue
- CPT code breakdown by estimated volume
- ROI against PAVE subscription cost

**Behavior**
- All calculations update in real time as physician adjusts inputs
- No data saved -- read-only demo and decision-support tool
- Used during onboarding and sales demonstrations

### 4. Data Table (Section 6.8)

- Complete tabular view of all enrolled patients
- Sortable columns: patient name, enrollment date, diagnosis, current billing status, adherence rate, days remaining in window
- Search: filter by patient name or diagnosis
- Status filter: filter by billing status bucket (Enrolled, On Track, Needs Attention, Ready to Bill, Claim Approved)
- Computed status badges: color-coded per the 5-tier classification system
- Inline quick actions per row: navigate to Patient Detail View, log review time

### 5. Organization Admin View (Section 6.9)

**Aggregate dashboard**
- Total patients across all providers in the organization
- Revenue pipeline: total estimated revenue, claims pending across all providers
- Organization-level KPI summary

**Provider management**
- Provider list: enrolled patient count and claims approved per provider
- Invite new providers to the organization
- Deactivate provider accounts
- Manage provider roles within the organization

**Patient assignment**
- Reassign patients between providers within the organization
- Assignment change logged in audit trail

**Organization-level export**
- Consolidated billing report across all providers as CSV
- Same format as individual provider CSV, aggregated at org level

**Organization billing settings**
- Subscription management: view current plan, billing cycle
- Invoice access via Stripe Customer Portal

### 6. Settings (Section 6.10)

**Profile management**
- Name, medical credentials/title, contact email
- OAuth connection status (Google / Microsoft)

**Notification preferences**
- Email and SMS alert thresholds for billing deadline warnings
- Patient activity milestone notifications

**MFA management**
- Reset or update authenticator device
- Cannot disable MFA

**Organization settings (Org Admin only)**
- Practice name, provider list, billing configuration

### 7. Complaint Handling Admin UI (Section 15A)

- Platform Administrator panel: complaint intake form
- Fields: reporter identity, date received, description, affected patient record(s), severity
- Status tracking: Open, Investigating, Resolved, Escalated
- MDR escalation flag with notification to designated regulatory contact
- Resolution record: root cause, corrective action, resolution date
- All records retained 6 years, exportable as CSV

---

## Recommended Tools

| Need | Tool | Why |
|---|---|---|
| Data tables | TanStack Table + shadcn/ui | Same pattern as M2 work queue. Reuse base table component. Sorting, filtering, badges. |
| CSV export | csv-stringify (npm) | Handles edge cases in CSV generation. Proper quoting, special characters. |
| Animations (approval) | Motion (Framer Motion) | Row slide-out, staggered batch approve, confirmation banner. Same library as M2. |
| Revenue calculator | React state (no library needed) | Pure client-side calculations. Real-time input binding. No persistence. |
| Org billing | Stripe Customer Portal | Pre-built hosted UI for subscription management and invoice access. Saves building custom UI. |

---

## Dependencies

- M2 billing engine fully operational (5-tier classification, priority scoring, anti-abuse)
- M3 patient portal complete (check-ins generating qualifying events)
- M3 Dr. Brain generating real plans (enrollment pipeline live)
- All 12 animation behaviors defined and implementable (Motion library integrated in M2)

---

## Exit Gate

Full RTM billing cycle demonstrated end to end. Enrol a patient, accumulate check-ins, qualify for billing, physician clicks Approve, CSV downloaded with all required fields. Org Admin logs in and sees aggregate metrics across all providers. Organization-level CSV export works. Revenue Calculator produces live projections. All tables sortable, searchable, filterable. Complaint handling admin UI accepts and tracks a test complaint.
