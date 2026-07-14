# M3 -- Patient Portal + Dr. Brain + Gamification + SMS

**Weeks 7-10 | 68 man-days**

---

## Team Allocation

| Role | Focus | Days |
|---|---|---|
| Tech Lead | Integration review, Dr. Brain architecture, code review | 16 |
| Frontend Dev 2 | Patient portal all 5 screens + gamification UI | 16 |
| AI Developer | Dr. Brain Claude API integration, plan generation pipeline | 16 |
| Backend Dev 1 | Gamification engine (with FE Dev 2) | 8 |
| Backend Dev 2 | Twilio SMS + SendGrid email, all trigger types | 8 |
| Frontend Dev 1 | Patient Detail View (provider side, all 5 tabs) | 16 |
| UI/UX Designer | Support role (part time, screen refinements) | 4 |
| QA Engineer | Patient journey end-to-end, Dr. Brain output quality (part time) | 6 |
| Project Manager | Sprint planning, milestone demos | 4 |

---

## FSD Sections Covered

- Section 7.1: Login and Onboarding (patient)
- Section 7.2: Daily Check-In Form
- Section 7.3: Exercise Plan View
- Section 7.4: Progress Dashboard
- Section 8: Patient Gamification (all subsections 8.1-8.5)
- Section 9: SMS / Text Integration (all use cases)
- Section 10.1: What Dr. Brain Is
- Section 10.2: Plan Generation at Enrollment
- Section 6.4: Patient Detail View (provider side, all 5 tabs)

---

## Functional Requirements

### 1. Patient Portal -- 5 Screens (PWA)

**Screen 1: Login and Onboarding (Section 7.1)**
- First access: magic link arrives by email or SMS (configured in M1)
- MFA setup on first login: step-by-step guided for non-technical users
- Welcome screen: brief explanation of what PAVE is and what the patient will be doing
- Contact detail confirmation: patient verifies name and contact information
- Subsequent logins: session persists 30 days on trusted device
- If session expired: patient enters email or phone, receives new magic link -- no password ever

**Screen 2: Daily Check-In Form (Section 7.2)**
- Standard single-page form. All sections visible at once. Target: under 2 minutes to complete.
- Pain/discomfort level: large 0-10 slider with clear visual anchors ("No pain" to "Worst imaginable")
- Activities completed today: checkbox group of prescribed exercises from their plan
- How they feel compared to yesterday: Better / About the same / Worse (single-select)
- Optional note to doctor: short free-text field, clearly marked as optional
- All interactive elements: minimum 48px touch targets
- On submit:
  - Check-in logged with server-side timestamp
  - Dashboard auto-refreshes within 60 seconds on provider side
  - Confirmation screen: "Check-in submitted. Your doctor can see your update."
  - Gamification trigger fires: streak updated, may unlock a milestone or badge
- One submission per day maximum -- friendly message if duplicate attempted
- Form not available before daily reset time (midnight local server time)

**Screen 3: Exercise Plan View (Section 7.3)**
- Plan organized by modality category (Pilates, Mobility, Strengthening, Breathing)
- Each exercise displayed as a card: name, plain-language description, step-by-step instructions, frequency recommendation, completion indicator
- Tappable to expand -- full instructions on tap
- Completed exercises visually marked with checkmark or color change
- Read-only -- patient cannot modify their plan
- Exercise instructions are text-based (video demonstrations explicitly out of scope)

**Screen 4: Progress Dashboard (Section 7.4)**
- Check-in streak counter: consecutive days with a submission, displayed prominently
- Adherence rate: percentage of days since enrollment with a check-in
- Pain score summary: plain text showing average pain score this week vs. last week
- Gamification summary: current badges, points balance, active milestone progress

**Screen 5: Gamification and Achievements (Section 8)**
- Full badge collection with earn dates
- Points running total
- Active milestone progress indicators
- Notification settings: patient can opt out of engagement reminders (auth messages always delivered)

### 2. Patient Gamification Engine (Section 8)

**Streak system (Section 8.1)**
- Consecutive check-in days tracked server-side -- cannot be manipulated client-side
- Streak counter displayed prominently on patient dashboard
- Streak milestones trigger in-app celebrations: 7, 14, 30, 60, 90 days
- Breaking a streak resets counter to zero (streak freeze explicitly out of scope)

**Badge system (Section 8.2)**
- Consistency badges: 7-day streak, 30-day streak, 90-day streak, First check-in, 50th check-in
- Improvement badges: First pain score improvement, Sustained improvement (14-day downward trend), Goal achieved
- Engagement badges: Plan viewed on Day 1, All exercises completed today, Full-week completion
- Badges displayed in patient profile with earn date
- New badge triggers congratulatory notification on patient dashboard

**Points system (Section 8.3)**
- Daily check-in completed: 10 points
- All prescribed exercises completed in one day: 5 bonus points
- Streak milestone reached: 25-100 points depending on milestone
- Badge earned: 50 points
- Pain improvement milestone: 25 points
- Running total displayed on patient dashboard
- Points are a progress indicator only in MVP -- no redemption (explicitly out of scope)

**Progress milestones (Section 8.4)**
- First week complete, First month complete, Pain reduction of 20% / 40% / 60% from baseline
- Milestones trigger in-app celebration message
- All milestone events logged in physician's patient view

**Physician visibility (Section 8.5)**
- Gamification data (streak, badges, points) visible in Activity History tab of Patient Detail View
- Disengagement signal: broken streak or badge inactivity feeds into Work Queue priority scoring

### 3. Dr. Brain -- Plan Generation at Enrollment (Section 10.1-10.2)

**Integration architecture**
- Claude API called via Anthropic SDK at patient enrollment submission
- Structured prompt assembled from patient inputs: diagnosis codes, medical history flags, treatment goals, selected modalities
- Claude Structured Outputs used to guarantee valid JSON response matching the plan schema -- no output parsing retry logic needed

**Knowledge base**
- Curated library of clinical studies, research papers, and validated therapeutic protocols
- Organized by modality and diagnostic category
- Preloaded by clinical team before M3 starts (client responsibility)
- Stored in Supabase with pgvector for vector-based retrieval

**Outputs**
- Personalized exercise and therapy plan: structured by modality, with plain-language patient instructions and clinical terminology for physician
- Medical rationale document: evidence basis for each recommendation (required for SaMD classification)
- Both outputs stored on patient record at generation time -- not regenerated on each view

**Physician approval workflow**
- Generated plan and rationale displayed to physician for review before patient access granted
- Physician clicks "Approve Plan" -- required step, not optional
- Approval timestamped and permanently recorded in audit log
- After approval: invitation email/SMS sent to patient, portal access activated
- The version of Dr. Brain that generated the plan is logged on the patient record

### 4. Patient Detail View -- Provider Side (Section 6.4)

**Activity History tab**
- Chronological log of all check-ins, physician review sessions, patient contacts with timestamps
- Gamification summary visible: current streak, badges earned, points balance
- Sortable and filterable by event type and date range

**Generated Plan tab**
- Full Dr. Brain output by modality category
- Medical rationale section: evidence basis for each recommendation (SaMD compliance)
- Read-only for physician after approval (plan editing explicitly out of scope)

**Billing Window Timeline tab**
- Visual 30-day calendar with check-ins plotted
- Running totals vs. thresholds for each qualifying dimension
- Projected qualification date at current check-in rate

**Action Log tab**
- All physician-logged actions with timestamps: review time entries, contact call entries, plan approval event
- Forms the audit trail for this patient's billing claim

**Outcome Charts tab**
- Pain/discomfort trend: text summary showing average pain scores and direction of change
- Adherence rate: percentage of days with a check-in since enrollment

**Actions available**
- Log Review Time, Log Patient Contact, Approve Claim, Approve Plan (pre-activation)

### 5. SMS Integration (Section 9)

**SMS use cases in MVP**

| Use Case | Trigger | Status |
|---|---|---|
| Patient magic link (auth) | Enrollment invite; patient requests new login link | Included |
| Patient MFA OTP | Each new login session | Included |
| Daily check-in reminder | Once daily at fixed server time, if patient has not checked in | Included |
| Streak at-risk nudge | Patient has not checked in by late afternoon | Included |
| Milestone congratulations | Streak or points milestone reached | Included |

**Twilio configuration**
- Twilio BAA executed (client responsibility, confirmed by M3 start)
- Delivery receipts and failure logging on all SMS
- SMS failure falls back to email for critical authentication messages
- All SMS events logged in platform audit trail

**Email notifications (SendGrid)**
- Patient invitation email on plan approval
- Provider notification emails (billing deadline warnings, patient activity summaries)
- Email templates consistent with intended use statement

**Patient notification preferences**
- Patients select preferred channel at onboarding: SMS, email, or both
- Patients can opt out of engagement reminders (check-in reminder, streak nudge, milestone alert)
- Authentication messages (magic link, MFA OTP) always delivered regardless of opt-out
- Opt-out logged and respected immediately

---

## Recommended Tools

| Need | Tool | Why |
|---|---|---|
| AI plan generation | Anthropic Claude API (Sonnet 4.6) with Structured Outputs | Guaranteed valid JSON output. No parsing retry logic. Plan schema defined once in Pydantic. |
| Knowledge base / RAG | LlamaIndex + pgvector (Supabase) | Document indexing, chunking, embedding, retrieval. Vectors stored in existing Postgres. |
| Clinical PDF parsing | RAGFlow (emerging, optional) | Layout-aware parsing for multi-column clinical papers with tables. Apache 2.0. |
| SMS (all use cases) | Twilio Programmable Messaging + Twilio Verify | HIPAA BAA. OTP delivery. Delivery receipts. Failure fallback to email. |
| Email | SendGrid or Resend + React Email | Transactional email. React Email for template design using same component model as app. |
| Gamification celebrations | AutoAnimate (patient portal) | Lightweight (2KB). Auto-animates badge/milestone notifications. No choreography needed. |
| Patient forms | react-hook-form + zod | Check-in form validation. Under-2-minute completion optimized. |
| Pain slider | shadcn/ui Slider (Radix) | Accessible slider with 48px touch target. Large visual anchors. |

---

## Dependencies

- M1 auth must be complete (both portals accessible)
- M2 billing engine must be live (check-in submissions must trigger qualifying events)
- M2 enrollment form backend must be complete (Dr. Brain triggers on enrollment submission)
- Dr. Brain prompt structure and knowledge base content outline delivered by client (Week 2)
- ICD-10 code list delivered by client (Week 2)

---

## Exit Gate

Full patient journey works end to end. Enrol a patient. Dr. Brain generates a real plan with medical rationale. Physician reviews and approves. Patient receives SMS invite. Patient logs in on phone via magic link. Patient completes daily check-in in under 2 minutes. Badge earned. Streak counter increments. Physician sees patient update on dashboard within 60 seconds. SMS reminder arrives if patient has not checked in by afternoon.
