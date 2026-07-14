# M6 -- QA, Hardening and Launch

**Week 16 | 10 man-days**

---

## Team Allocation

| Role | Focus | Days |
|---|---|---|
| QA Engineer | Full regression, HIPAA verification, cross-device, billing stress | 4 |
| Tech Lead | Security hardening, production deployment, documentation, handover | 4 |
| Project Manager | Final sign-off, handover coordination, FDA-grade documentation | 2 |

---

## FSD Sections Covered

- All sections (full regression)
- Section 3.4: HIPAA Compliance (verification pass)
- Section 15.4: Anti-Abuse Controls (verification)
- Section 17.1: MVP Scope Boundary (completeness check)
- FDA/SaMD compliance documentation deliverables

---

## Functional Requirements

### 1. Critical Path QA

**HIPAA compliance verification**
- PHI isolation: verify every API endpoint enforces tenant-scoped access -- provider cannot see another provider's patients, patient cannot see another patient's data
- Encryption at rest: confirm AES-256 active on all PHI storage
- Encryption in transit: confirm TLS 1.2+ on all connections with no exceptions
- Audit log integrity: verify all PHI access events are logged with who, what, when, IP -- verify entries cannot be modified or deleted
- Session management: verify provider session expires after 15 minutes of inactivity, verify activity resets timer
- No PHI in unsecured locations: scan server logs, error tracking output, and analytics for PHI leakage
- Data export/deletion: verify admin can export or permanently delete any patient's PHI

**Billing engine verification**
- All CPT qualification paths tested: verify each combination of qualifying events leads to correct status classification
- Rolling 30-day window boundary conditions: verify window auto-creates on close, verify edge cases at window boundaries
- Anti-abuse controls: attempt to backdate a check-in (must fail), attempt to manually credit a check-in (must fail), attempt to auto-generate review time (must fail), attempt to modify an approved claim (must fail)
- Full RTM billing cycle: enrol, accumulate events, qualify, approve, export CSV, verify new window begins
- Immutable audit trail: attempt to modify or delete an audit entry (must fail)

**Authentication verification**
- Provider OAuth: test Google login + MFA, Microsoft login + MFA
- Provider lockout: verify account locks after 5 failed MFA attempts, verify self-service unlock works
- Patient magic link: test email delivery, test SMS delivery, test expired link handling
- Patient MFA: test SMS OTP setup, test email OTP setup
- Patient persistent session: verify 30-day persistence, verify session expiry and re-authentication flow
- Session timeout: verify 15-minute provider timeout, verify activity resets timer

### 2. Full Regression

**Provider portal -- all 10 screens**
- Dashboard: KPI values correct, work queue ordering matches priority algorithm, 60-second auto-refresh confirmed, alert banner fires on qualifying condition, dismiss button works
- Work Queue: inline panels open/close correctly, only one panel open at a time, panel switching behavior correct (different row: close then open; same row: cross-fade), row resolution animation fires on qualification
- Patient Enrollment: 4-step form validates each step, ICD-10 search returns correct results, modality selection persists, submission creates patient record and triggers Dr. Brain
- Patient Detail View: all 5 tabs render with correct data, inline actions work, gamification data visible in Activity History
- Approval Queue: individual approve locks claim, batch approve processes all rows with staggered animation, confirmation banner appears and auto-dismisses
- Reports: analytics figures match approved claims, historical records filterable, expired claims accessible via filter, CSV export produces correct format with all required fields
- Revenue Calculator: live calculations update on input change, no data persisted
- Data Table: sort, search, and filter work correctly, status badges match billing engine classification
- Org Admin: aggregate metrics correct across providers, patient assignment works, org-level CSV export correct
- Settings: profile updates save, MFA reset works, notification preferences persist

**Patient portal -- all 5 screens (PWA)**
- Login/Onboarding: magic link login works on iOS and Android, MFA setup completes for non-technical users
- Daily Check-In: form submits in under 2 minutes, duplicate prevention works (friendly message on second attempt), gamification trigger fires on submit
- Exercise Plan: plan displays by modality, cards expand on tap, completion indicators update
- Progress Dashboard: streak counter accurate, adherence rate calculated correctly, pain summary reflects actual data
- Gamification: badge earn conditions verified for all badge types, points accumulate correctly, milestone celebrations fire at correct thresholds

**Cross-device testing**
- PWA installable on iOS (Add to Home Screen) and Android (Install App)
- Full-screen app-like experience when launched from home screen
- Standard browser access also works on both platforms
- All touch targets meet 48px minimum on mobile devices

**SMS verification**
- All SMS trigger types tested: magic link, MFA OTP, daily reminder, streak nudge, milestone congratulation
- SMS delivery receipt logging confirmed
- SMS failure fallback to email confirmed for authentication messages
- Patient opt-out respected immediately -- opted-out patients do not receive engagement SMS

**Gamification verification**
- Streak resets to zero on missed day
- All badge earn conditions fire correctly
- Points accumulate per defined rules (10 for check-in, 5 bonus for all exercises, 25-100 for milestones, 50 for badge, 25 for pain improvement)
- Milestone celebrations fire at 7, 14, 30, 60, 90 day streaks and pain reduction thresholds
- Gamification data visible in physician's Patient Detail View
- Disengagement signals feed into work queue priority scoring

**Payments verification**
- Stripe subscription creation works for individual and group accounts
- Card input via Stripe Elements processes correctly
- Webhook events handled: payment success, failure, subscription changes
- Stripe Radar fraud detection active
- Invoice access in Settings via Stripe Customer Portal

### 3. Security Hardening

- Dependency audit: run npm audit and resolve all high/critical vulnerabilities
- HTTP security headers: Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options configured via helmet.js or equivalent
- Rate limiting on authentication endpoints and API-intensive routes
- Input validation on all user-facing endpoints (already enforced by zod schemas, verified here)
- Error responses sanitized -- no stack traces, internal paths, or PHI in error output
- Production environment variables verified and secured

### 4. Production Deployment

- Production environment on AWS verified and configured
- DNS configuration complete
- TLS certificate active and verified
- Database migration applied to production
- Supabase production project configured with HIPAA add-on
- Error logging and monitoring active
- Backup schedule confirmed and tested (restore procedure verified)
- Post-launch observation period: monitor error rates, response times, and SMS delivery for first 48 hours

### 5. Documentation and Handover

**Technical documentation**
- API documentation: all endpoints documented with request/response schemas
- Deployment runbook: step-by-step production deployment procedure
- Environment variable inventory: every variable documented with purpose and source
- Architecture overview: system diagram, data flow, third-party integrations

**FDA-grade documentation (SaMD compliance)**
- Requirements traceability matrix: every FSD requirement mapped to its implementation and test result
- Structured test execution records: each test case with pass/fail result, date, tester identity
- Formal release log: version number, change descriptions, approval records for each deployment
- Prompt version registry documentation: current prompt versions, model versions, change history
- PCCP readiness notes: characterization of AI self-improvement loop (locked vs. adaptive)

**Source code handover**
- Full source code transferred to client
- IP assignment complete per SOW terms
- All third-party credentials and service accounts documented
- Handover package delivered

---

## Recommended Tools

| Need | Tool | Why |
|---|---|---|
| Load testing | k6 (Grafana Labs) | JavaScript test scripts. HTTP/2 support. Clean metrics. Test concurrent check-ins and auto-refresh polling. |
| Security headers | helmet.js | Express middleware. One line, all critical security headers configured. |
| Dependency audit | npm audit | Built-in. Catches known vulnerabilities in dependencies. |
| HIPAA compliance platform | Compliancy Group or Accountable HQ | Structured risk assessment, policy templates, audit documentation. Ensures HIPAA verification is formally documented. |

---

## Dependencies

- M1 through M5 complete
- All client feedback on M1-M5 demos incorporated
- Stripe production account configured with live API keys
- Twilio production account configured
- Supabase production project with HIPAA add-on enabled
- AWS production environment provisioned

---

## Exit Gate

PAVE is in production. Every feature working across both portals. HIPAA audit checklist complete and documented. All 12 animation behaviors verified. Full RTM billing cycle demonstrated with CSV export. PWA installable on iOS and Android. SMS delivery confirmed for all trigger types. Gamification earning and displaying correctly. Stripe processing live payments. Full source code, API documentation, deployment runbook, and FDA-grade documentation package handed over to client. IP transfer complete.
