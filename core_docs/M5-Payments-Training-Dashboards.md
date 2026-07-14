# M5 -- Payments + Dr. Brain Training + Cost Dashboard + Reports

**Weeks 14-15 | 28 man-days**

---

## Team Allocation

| Role | Focus | Days |
|---|---|---|
| Backend Dev 2 | Stripe integration, webhook handling | 6 |
| Frontend Dev 1 | Stripe Elements UI, subscription management | 4 |
| AI Developer | Dr. Brain training UI, sandbox environment | 8 |
| Frontend Dev 2 | Training UI frontend, API cost dashboard, backend report UIs | 8 |
| Backend Dev 1 | Backend reports APIs, API cost logging middleware | 4 |
| Tech Lead | Integration review, sandbox architecture | 2 |
| Project Manager | Milestone demos | 2 |

---

## FSD Sections Covered

- Section 10.3: Dr. Stillman's Training Interface
- Section 10.4: Sandbox and Staging Environment
- Section 10.5: AI Governance -- Prompt Version Registry and Model Traceability
- Section 12: API Cost Dashboard and Usage Monitoring (all subsections)
- Section 13: Payment Infrastructure (all subsections)
- Section 14: Backend Reports and Audit Dashboards (all subsections)

---

## Functional Requirements

### 1. Stripe Payment Infrastructure (Section 13)

**Architecture**
- All payment processing handled by Stripe -- PCI DSS Level 1 certified
- PAVE never stores, processes, or transmits raw card data
- PAVE stores only Stripe-issued token references
- Card data handling via Stripe.js / Stripe Elements -- card data never touches PAVE servers

**Subscription management (Section 13.3)**
- Individual provider subscriptions: monthly or annual billing per provider account
- Group practice subscriptions: volume-based pricing across multi-provider organizations
- Subscription changes (upgrades, downgrades, cancellations): immediate or end-of-period
- Invoices generated and stored by Stripe -- accessible to Org Admins in Settings

**Payment security controls**
- Tokenization: payment methods stored as tokens only
- Webhook verification: all Stripe webhooks verified using Stripe signature
- Failed payment handling: standard Stripe retry logic
- Fraud detection: Stripe Radar -- ML-based fraud detection enabled
- 3DS2 strong authentication explicitly out of scope (standard US card flow only)

**Webhook handling**
- Payment success, payment failure, subscription created, subscription cancelled, subscription updated
- Each webhook event logged in platform audit trail
- Webhook signature verification on every incoming event

### 2. Dr. Brain Training Interface (Section 10.3)

**Conversational chat**
- Dedicated training UI for Dr. Stillman
- Conversational interface: discusses clinical reasoning with the AI, corrects misalignments, explores edge cases
- Chat connected to the knowledge layer -- Dr. Stillman can test how Dr. Brain reasons about specific diagnoses and treatment protocols
- All training conversations permanently logged with timestamps

**Document upload and knowledge base management**
- Document upload: clinical studies, research papers, proprietary protocols (PDF, DOCX)
- Documents indexed and added to Dr. Brain's knowledge base
- Knowledge base management view: structured display of all documents in Dr. Brain's corpus
- Actions: add new documents, remove documents, flag individual sources for review
- All training actions logged with timestamp -- complete audit trail of every change
- All training inputs staged for sandbox validation before affecting production

### 3. Dr. Brain Sandbox (Section 10.4)

**How the sandbox works**
- Complete, isolated replica of Dr. Brain's production model runs in staging at all times
- All proposed updates (new documents, prompt changes, knowledge base modifications) applied to sandbox first
- Dr. Stillman runs test enrollments in sandbox to review what the updated model would generate
- Dr. Stillman approves promotion of sandbox changes to production -- no automated deployment without human sign-off

**Protection of existing patient plans**
- Existing patient plans are never retroactively altered by model updates
- New enrollments after a model update receive plans from the updated model
- The version of Dr. Brain that generated each patient's plan is logged on their record

**Rollback**
- If a production update produces unexpected results, previous version can be restored
- Rollback requires authorization from Dr. Stillman
- Side-by-side comparison view explicitly out of scope
- Full 90-day version history log explicitly out of scope

### 4. AI Governance -- Prompt Version Registry (Section 10.5)

**Prompt version registry**
- Every change to the Claude API prompt template recorded with:
  - Unique version identifier
  - Timestamp of change
  - Change description
  - Identity of person who authorized the change
  - Full prompt text stored for each version
- Registry is append-only -- previous versions cannot be modified or deleted

**Model version tagging**
- Every Dr. Brain API call records the specific Claude model identifier used (e.g., claude-sonnet-4-20250514)
- Model version logged alongside prompt version on patient plan record

**Plan-to-version linkage**
- Every generated patient plan permanently tagged with prompt version ID and model version
- Full traceability: for any patient plan, retrieve the exact prompt and model that generated it

**Admin version lookup**
- Platform Administrators can query the version registry
- View all prompt versions, their effective dates, and which patient plans were generated under each version
- Supports FDA audit readiness and future PCCP requirements

### 5. API Cost Dashboard (Section 12)

**API call logging middleware**
- Cross-cutting middleware on all external API calls
- Logs every call with: service name, endpoint, timestamp, request type, response status
- For Claude API calls: input tokens, output tokens, total tokens, model used, estimated cost
- Token usage attributed to triggering event: patient enrollment, training session

**Dashboard UI (Section 12.2)**
- Total API spend to date (current month and rolling 12 months)
- Spend broken down by service: Claude API, Twilio, email, database, storage, Stripe
- Per-event log: every individual API call with timestamp, type, tokens used, cost
- Trend charts: spending over time
- Budget alert thresholds: set monthly limits per service, alerts fire when threshold approached

**Exportable accounting report**
- One-click CSV export formatted for accounting/finance use
- Fields: period, service, event type, quantity, unit cost, total cost
- Filterable by date range and service type

### 6. Backend Reports (Section 14)

**Provider activity reports (Section 14.1)**
- Login frequency per provider
- Patients enrolled per provider: enrollment rate over time, total active panel
- Average review time logged per provider
- Claim approval rate: qualified claims approved vs. expired per provider
- Plan approval time: average time from enrollment to plan approval

**Patient activity reports (Section 14.2)**
- Check-in submission rates: daily, by day of week, by time of day
- Streak distribution: patients maintaining active streaks vs. lapsed
- Gamification engagement: badge earn rates, points accumulation, milestone achievement rates
- Dropout indicators: patients not logged in within 7/14/30 days -- flagged for physician outreach
- Pain trend aggregates: de-identified population-level improvement data

**AI and token usage reports (Section 14.3)**
- Total Claude API calls per period
- Token consumption per call: input tokens, output tokens, total -- with cost attribution
- Plan generation log: every enrollment with associated token usage
- Training session log: every Dr. Stillman interaction -- token count, documents uploaded

**HIPAA audit reports (Section 14.4)**
- PHI access log: every access to patient health data -- who, what record, what action, timestamp, IP
- Failed authentication log: all failed login attempts with IP address
- Export events: every CSV export -- who exported, when, what included
- Admin action log: all administrative actions including user creation, deactivation, role changes
- Session log: all provider session starts, ends, idle-timeout events
- Audit log retention: minimum 6 years
- All audit reports exportable as CSV
- Organization-level vs. platform-level: Org Admins see only their practice's data

---

## Recommended Tools

| Need | Tool | Why |
|---|---|---|
| Card input | Stripe Elements (Stripe.js) | PCI-compliant card input. Card data never touches PAVE servers. |
| Subscription management | Stripe SDK + stripe-node | Subscription lifecycle, webhooks, dunning, Radar. |
| Subscription UI (settings) | Stripe Customer Portal | Pre-built hosted UI for invoice access and plan changes. |
| Sandbox isolation | Separate Supabase project | Complete isolation from production. Same schema, separate data. |
| Charts (cost dashboard, reports) | Recharts | Trend lines, bar charts, token usage visualization. |
| Report tables | TanStack Table + shadcn/ui | Same pattern as M2/M4 tables. Filter by date, service, provider. |
| CSV export (reports) | csv-stringify | Consistent CSV generation across all report types. |
| Knowledge base (training UI) | LlamaIndex | Document upload, indexing, chunking, retrieval pipeline. |
| Chat UI (training interface) | Next.js + shadcn/ui | Chat interface built with same component library. No separate chat framework needed. |

---

## Dependencies

- M3 Dr. Brain plan generation pipeline complete (training UI extends the same AI layer)
- M4 billing completion done (reports draw on finalized billing data)
- M1 HIPAA audit logging active (audit reports query the audit log schema)
- Stripe account setup and API keys configured (client responsibility)

---

## Exit Gate

Create a Stripe subscription for a test provider account. Upload a clinical paper to Dr. Brain training UI, chat with it about treatment protocols, review sandbox output for a test enrollment, promote the update to production. Open the API cost dashboard and see every Claude API call with token count and cost. View provider activity reports, patient engagement reports, and HIPAA audit logs. Export each report as CSV.
