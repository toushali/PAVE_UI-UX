

|  PAVE *Healthcare. Simplified.* Delivery Plan 13 Sprints  ·  6 Milestones  ·  4 Months  Prepared for: Yonathan Yehezkel & Brandon Stillman Prepared by: Swarnendu De March 2026  |  Confidential |
| :---- |

# **Team Structure**

Nine people across six parallel tracks. The Tech Lead owns architecture and integration. The PM is the client's single point of contact throughout.

| Role | Track | Allocation | Responsibility |
| :---- | :---- | :---- | :---- |
| **Tech Lead** | All tracks | *Full time* | Architecture decisions, code review, integration points, DevOps, deployment, client demos. |
| **Backend Dev 1** | Billing engine \+ APIs | *Full time* | RTM billing engine, qualification logic, all billing-related API endpoints, audit logging, real-time sync. |
| **Backend Dev 2** | Auth \+ Payments \+ Reports | *Full time* | OAuth / MFA / magic link auth, Twilio SMS, Stripe billing, backend reports, HIPAA audit layer. |
| **Frontend Dev 1** | Provider Portal | *Full time* | All 10 provider portal screens — dashboard, work queue, enrollment, detail view, approvals, reports, org admin. |
| **Frontend Dev 2** | Patient Portal \+ Gamification | *Full time* | All 5 patient portal screens as PWA, gamification UI, SMS notification flows, API cost dashboard. |
| **AI Developer** | Dr. Brain | *Full time* | Claude API integration, Dr. Brain plan generation pipeline, training UI, sandbox environment. |
| **UI/UX Designer** | Design system \+ all screens | *Full time Wks 1–6, part time after* | Figma design system, all 15 screens, component handoff. Transitions to support role after Milestone 2\. |
| **QA Engineer** | All tracks | *Part time Wks 2–8, full time Wks 9–16* | Manual regression QA covering all critical paths: billing, HIPAA, auth, gamification, payments. |
| **Project Manager** | All tracks | *Full time* | Sprint planning, standups, milestone demos, client communication, scope management, documentation. |

# **Build Order — Critical Dependencies**

These constraints shape the milestone sequence. Everything else runs in parallel.

| Must complete first |  | Before this can begin |
| :---- | ----- | :---- |
| Auth (OAuth \+ magic link \+ MFA) | **→** | Any portal screen — no one can log in without auth |
| Database schema and API foundation | **→** | Any backend feature — all modules write to the same data structure |
| Billing engine (qualifying event logging) | **→** | Patient check-in form — submissions must trigger billing events |
| Patient enrollment form (backend) | **→** | Dr. Brain integration — plan generation triggers on enrollment |
| Dr. Brain plan generation | **→** | Patient portal plan view — patient only sees an approved plan |
| Work queue \+ billing status logic | **→** | Approval queue — approvals require 5-tier classification to be live |
| HIPAA audit logging layer | **→** | Any PHI-touching feature going to staging or production |

# **The 6 Milestones**

Each milestone ends with a client demo and a deployable build on staging. Feedback is due within 3 working days to keep the schedule on track.

| M1 | Milestone 1 — Foundation, Auth & Design System *Weeks 1–2  |  Both portals open. Providers log in. Patients log in by magic link on mobile.* |
| :---: | :---- |

| What gets built | Detail | Who |
| :---- | :---- | :---- |
| **Infrastructure & HIPAA base** | Repo, environments (staging \+ production), Supabase DB / auth / realtime / storage, encryption config, audit log schema, multi-tenancy isolation at API layer. | *Tech Lead* |
| **Figma design system** | Full component library, light mode, typography, spacing, states. Provider portal login screen \+ shell. Patient portal shell. | *Designer* |
| **Provider auth** | OAuth (Google \+ Microsoft) \+ mandatory TOTP MFA. Provider login screen live. 15-minute session timeout. Login events logged. | *BE Dev 2 \+ FE Dev 1* |
| **Patient auth** | Magic link by email and SMS. OTP MFA guided setup. Persistent 30-day session. Patient login screen live. | *BE Dev 2 \+ FE Dev 2* |
| **Patient PWA shell** | PWA manifest, service worker, iOS/Android installable. Add to Home Screen flow. Basic app shell with routing. | *FE Dev 2* |

| *M1 demo: Open both portals in a browser. Log in as a provider with Google \+ MFA. Open the patient portal on a phone, enter the magic link from an SMS, complete MFA setup.* |
| :---- |

| M2 | Milestone 2 — Billing Engine \+ Provider Portal Core *Weeks 3–6  |  Physicians enrol patients. Dashboard live. Billing engine classifies in real time.* |
| :---: | :---- |

| What gets built | Detail | Who |
| :---- | :---- | :---- |
| **Billing engine** | Rolling 30-day window per patient. Qualifying event logging with server-side timestamps. 5-tier status classification updating in real time. Priority scoring algorithm. Anti-abuse controls. Immutable audit log. | *BE Dev 1* |
| **Provider dashboard** | KPI strip. Urgent and Optimization work queues. Priority algorithm display. 60-second auto-refresh. Alert banner. Inline action panels (Log Review Time, Log Contact, Approve Claim). Dismiss button. | *FE Dev 1* |
| **Patient enrollment form** | 4-step form — demographics, ICD-10 diagnosis search, modality selection, provider assignment. Submission creates patient record and triggers Dr. Brain call (stubbed with mock output at this stage). Sends invitation. | *FE Dev 1 \+ BE Dev 1* |
| **HIPAA audit middleware** | Audit log middleware on all PHI-touching endpoints. Every access logged: user, action, timestamp, IP. Write-protected. | *BE Dev 1 \+ Tech Lead* |
| **Designer handoff — provider portal** | Figma specs for work queue, enrollment form, patient detail view, approval queue, reports ready for FE Dev 1\. | *Designer* |

| *M2 demo: Enrol a test patient. They appear on the physician's dashboard in the correct status bucket. Simulate check-in events — the billing status updates. Work queue re-prioritises correctly.* |
| :---- |

| M3 | Milestone 3 — Patient Portal \+ Dr. Brain \+ Gamification \+ SMS *Weeks 7–10  |  Full patient journey works end to end. Dr. Brain generates real plans. Badges fire. SMS reminders arrive.* |
| :---: | :---- |

| What gets built | Detail | Who |
| :---- | :---- | :---- |
| **Patient portal — all 5 screens** | Daily check-in form (single page, under 2 minutes, 48px touch targets). Exercise plan view by modality. Progress dashboard — streak, adherence rate, pain score summary. Notification settings. Onboarding flow. | *FE Dev 2* |
| **Dr. Brain — plan generation** | Claude API integration. Structured prompt assembly from patient inputs. Plan and medical rationale stored. Physician approval workflow. Plan released to patient after approval. Output cached in database. | *AI Developer \+ BE Dev 2* |
| **Gamification engine** | Streak tracking with server-side daily reset. Full badge system (all categories). Points accumulation. Milestone triggers. In-app celebration messages. Feeds into work queue priority. | *FE Dev 2 \+ BE Dev 1* |
| **SMS integration** | Twilio BAA and setup. Magic link by SMS, MFA OTP, daily check-in reminder (fixed server time), streak nudge, milestone congratulations. SendGrid email notifications. Delivery failure fallback. Patient opt-out. | *BE Dev 2* |
| **Patient Detail View (provider side)** | Activity History tab (with gamification summary), Generated Plan tab, Billing Window Timeline, Action Log, Outcome Summary. All inline actions wired. | *FE Dev 1* |

| *M3 demo: Full patient journey. Enrol → Dr. Brain generates plan → physician approves → patient receives SMS invite → logs in on phone → completes check-in → earns badge → physician sees update within 60 seconds.* |
| :---- |

| M4 | Milestone 4 — Billing Completion \+ Org Admin \+ Reports *Weeks 11–13  |  Full RTM billing cycle end to end. Group practice management live. CSV export ready.* |
| :---: | :---- |

| What gets built | Detail | Who |
| :---- | :---- | :---- |
| **Approval Queue \+ CSV export** | Approval queue with expandable rows — CPT codes and revenue per claim. Individual and batch approve. Claim locking. Standard CSV export with all required fields. Export event logged. | *FE Dev 1 \+ BE Dev 1* |
| **Reports screen** | Summary analytics table (CPT distribution, revenue by period). Historical records searchable/filterable table — expired claims accessible via filter. Active queue. | *FE Dev 1 \+ BE Dev 1* |
| **Revenue Calculator** | Live CPT revenue projections from physician inputs. Read-only tool. | *FE Dev 1* |
| **Org Admin View** | Cross-provider aggregate dashboard. Provider list (patient count \+ claims approved). Patient assignment management. Org-level CSV export. Provider account management — invite, deactivate, roles. | *FE Dev 1 \+ BE Dev 1* |
| **Data Table \+ Settings** | All-patients sortable/searchable/filterable table. Provider settings — profile, MFA, notification preferences. Org settings. | *FE Dev 1* |

| *M4 demo: Full RTM billing cycle. Enrol → check-ins qualify → physician clicks Approve → CSV downloaded. Org Admin logs in and sees all providers. Org-level export works.* |
| :---- |

| M5 | Milestone 5 — Payments \+ Dr. Brain Training \+ Cost Dashboard \+ Reports *Weeks 14–15  |  Stripe billing live. Brandon can train Dr. Brain. Full cost visibility active.* |
| :---: | :---- |

| What gets built | Detail | Who |
| :---- | :---- | :---- |
| **Stripe payment infrastructure** | Stripe product and subscription setup. Stripe Elements card input. Individual and group subscriptions. Webhook handling — payment events, failures, subscription changes. Stripe Radar. Invoice access in Settings. | *BE Dev 2 \+ FE Dev 1* |
| **Dr. Brain training UI** | Conversational chat interface for Dr. Stillman connected to the knowledge layer. Document upload (PDF, DOCX) and indexing. Knowledge base management — view, add, remove, flag documents. All training actions permanently logged. | *AI Developer \+ FE Dev 2* |
| **Dr. Brain sandbox** | Isolated staging instance. Dr. Stillman runs test enrollments to review sandbox output. Promotion workflow — Dr. Stillman approves before any change goes live. Rollback to previous version. Model version tagged on each patient record. | *AI Developer \+ BE Dev 2* |
| **API cost dashboard** | Logging middleware on all external API calls. Token tracking per Claude call. Real-time cost dashboard — by service, trend charts. Per-event log. Budget alert thresholds. Exportable accounting CSV. | *FE Dev 2 \+ BE Dev 2* |
| **Backend usage reports** | Provider activity reports. Patient activity reports. AI token usage reports. HIPAA audit reports — PHI access log, failed auth, export events, admin actions. All exportable as CSV. | *FE Dev 2 \+ BE Dev 1* |

| *M5 demo: Create a Stripe subscription. Upload a clinical paper to Dr. Brain, chat with it, review sandbox output, promote the update. Open the API cost dashboard and see every call with its token count and cost.* |
| :---- |

| M6 | Milestone 6 — QA, Hardening & Launch *Weeks 16  (final sprint)  |  Production launched. HIPAA verified. Full handover.* |
| :---: | :---- |

| What gets built | Detail | Who |
| :---- | :---- | :---- |
| **Critical path QA** | HIPAA compliance — PHI isolation, encryption, audit log integrity, session management. Billing engine — all CPT qualification paths, anti-abuse controls, full RTM cycle. Auth — OAuth, MFA, magic link, session expiry. | *QA Engineer* |
| **Regression \+ cross-device** | Full regression across all features. PWA on iOS and Android — installability. Cross-browser. SMS — all trigger types, opt-out, fallback. | *QA Engineer* |
| **Documentation \+ handover** | API documentation. Deployment runbook. Environment variable inventory. Full source code transferred. IP assignment complete. | *Tech Lead \+ PM* |
| **Production launch** | Production deployment. DNS configuration. Error logging active. Post-launch observation. | *Tech Lead* |

| *M6 delivery: PAVE is in production. Every feature working. HIPAA verified. Full source code and documentation handed over with IP transfer.* |
| :---- |

# **Milestone Summary**

|  | Weeks | Milestone | What is working |
| ----- | ----- | :---- | :---- |
| **M1** | 1–2 | **Foundation \+ Auth** | Both portals open. Auth working. Design system complete. PWA installable. |
| **M2** | 3–6 | **Billing \+ Provider Core** | Physician enrols patients. Dashboard live. Billing engine classifies in real time. Work queue functioning. |
| **M3** | 7–10 | **Patient \+ Dr. Brain \+ Gamification** | Full patient journey. Real AI plans. Badges fire. SMS reminders arrive. |
| **M4** | 11–13 | **Billing Completion \+ Reports** | End-to-end RTM cycle. CSV export. Org Admin. Reports screen. |
| **M5** | 14–15 | **Payments \+ Training \+ Dashboards** | Stripe live. Brandon can train Dr. Brain. API cost monitoring active. |
| **M6** | 16 | **QA \+ Hardening \+ Launch** | Production launched. HIPAA verified. Full handover. |
|  | **16 weeks** | **\~4 months** | **Full production launch** |

# **What We Need from the Client**

These inputs must be in place at or before the dates shown. They are the only things that can delay the schedule.

| What we need | By | Impact if delayed |
| :---- | ----- | :---- |
| CPT billing logic specification — threshold values, code eligibility rules, qualification conditions | **Week 1** | Billing engine cannot begin. Milestone 2 slips — cascades to 3 and 4\. |
| Dr. Brain prompt structure and knowledge base content outline | **Week 2** | Dr. Brain integration in Milestone 3 delayed. Physician plan approval stalls. |
| Replit prototype source code (reference only) | **Week 1** | Billing logic reference missing. Higher risk of misalignment in the engine. |
| NDA signed | **Before Week 1** | Work cannot begin. |
| ICD-10 code list for the enrollment form | **Week 2** | Enrollment form search stubbed with partial data until provided. |
| Feedback on each milestone demo | **Within 3 working days** | Unreviewed milestones compress the QA window. |

Prepared by Swarnendu De  |  March 2026

*Confidential — prepared exclusively for Yonathan Yehezkel and Brandon Stillman.*  
**16-Week Delivery Gantt**

9 team members working in parallel. Dark bars \= active work. Tech Lead (blue) runs all 16 weeks. PM runs all 16 weeks.

| Work stream / Role | Month 1 |  |  |  | Month 2 |  |  |  | Month 3 |  |  |  | Month 4 |  |  |  |
| :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
|  | **W1** | **W2** | **W3** | **W4** | **W5** | **W6** | **W7** | **W8** | **W9** | **W10** | **W11** | **W12** | **W13** | **W14** | **W15** | **W16** |
|   **M1  |  Foundation, Auth & Design  (Weeks 1–2)** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| **Tech Lead — Architecture, DevOps, integration, code review** | **Infra** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PM — Sprint planning, client comms, all milestones | **PM** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Designer — Design system \+ all screen specs (Wks 1–6) | **Design** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BE Dev 2 — Provider OAuth \+ TOTP MFA \+ Patient magic link | **Auth** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| FE Dev 1 — Login screens \+ provider portal shell | **Shell** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| FE Dev 2 — Patient PWA shell \+ manifest \+ routing | **PWA** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|   **M2  |  Billing Engine \+ Provider Core  (Weeks 3–6)** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BE Dev 1 — Billing engine (windows, events, 5-tier, anti-abuse, audit log) |  |  | **Billing Engine** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| FE Dev 1 — Dashboard \+ work queue \+ enrollment form |  |  | **Dashboard** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| QA — Billing critical path testing begins (ramp up) |  |  | **QA** |  |  |  |  |  |  |  |  |  |  |  |  |  |
|   **M3  |  Patient Portal \+ Dr. Brain \+ Gamification \+ SMS  (Weeks 7–10)** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| FE Dev 2 — Patient portal all 5 screens \+ onboarding |  |  |  |  |  |  | **Patient Portal** |  |  |  |  |  |  |  |  |  |
| AI Developer — Dr. Brain (Claude API, plan gen, rationale, cache) |  |  | **Dr. Brain** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BE Dev 2 — Twilio SMS \+ SendGrid email — all trigger types |  |  |  |  |  |  | **SMS** |  |  |  |  |  |  |  |  |  |
| FE Dev 2 \+ BE Dev 1 — Gamification engine (streaks, badges, points) |  |  |  |  |  |  | **Gamification** |  |  |  |  |  |  |  |  |  |
| FE Dev 1 — Patient Detail View (all tabs \+ actions) |  |  |  |  |  |  | **Detail View** |  |  |  |  |  |  |  |  |  |
|   **M4  |  Billing Completion \+ Org Admin \+ Reports  (Weeks 11–13)** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| FE Dev 1 — Approval Queue \+ Reports \+ Revenue Calculator |  |  |  |  |  |  |  |  |  |  | **Approvals** |  |  |  |  |  |
| FE Dev 1 — Org Admin \+ Data Table \+ Settings |  |  |  |  |  |  |  |  |  |  | **Org Admin** |  |  |  |  |  |
| BE Dev 1 — Claim locking \+ CSV export \+ billing completion |  |  |  |  |  |  |  |  |  |  | **Billing done** |  |  |  |  |  |
|   **M5  |  Payments \+ Training \+ Dashboards  (Weeks 14–15)** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| BE Dev 2 \+ FE Dev 1 — Stripe subscriptions, webhooks, Radar |  |  |  |  |  |  |  |  |  |  |  |  |  | **Stripe** |  |  |
| AI Dev \+ FE Dev 2 — Dr. Brain training UI \+ sandbox controls |  |  |  |  |  |  |  |  |  |  |  |  |  | **Train UI** |  |  |
| FE Dev 2 \+ BE Dev 2 — API cost dashboard \+ backend reports |  |  |  |  |  |  |  |  |  |  |  |  |  | **Dashboards** |  |  |
|   **M6  |  QA, Hardening & Launch  (Week 16\)** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| QA Engineer — Full regression \+ HIPAA \+ cross-device \+ billing stress |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | **Full QA** |
| Tech Lead — Hardening \+ docs \+ production deploy \+ handover |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | **Launch** |
| PM — Final sign-off \+ handover coordination |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | **Sign-off** |

*Gantt starts on project kick-off date (Week 1 \= NDA signed \+ CPT billing spec received).  **Critical dependency: CPT billing logic specification must be received from the client in Week 1 for Milestone 2 to start on time.***