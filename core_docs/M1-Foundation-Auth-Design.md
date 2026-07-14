# M1 -- Foundation, Auth and Design System

**Weeks 1-2 | 54 man-days**

---

## Team Allocation

| Role | Focus | Days |
|---|---|---|
| Tech Lead | Architecture, infra setup, DevOps, code review | 10 |
| Backend Dev 2 | Provider OAuth + MFA, Patient magic link + OTP | 10 |
| Frontend Dev 1 | Provider login screen + portal shell | 10 |
| Frontend Dev 2 | Patient PWA shell + manifest + routing | 10 |
| UI/UX Designer | Design system + login screens + component library | 10 |
| Project Manager | Sprint planning, client comms, architecture review | 4 |

---

## FSD Sections Covered

- Section 2: Platform Overview (architecture decisions)
- Section 3.3: SaMD Classification Requirements (architectural constraints)
- Section 3.4: HIPAA Compliance (encryption, audit schema, tenant isolation)
- Section 4: User Roles and Permissions (RBAC schema)
- Section 5.1: Provider Authentication (OAuth + MFA)
- Section 5.2: Patient Authentication (Magic Link + MFA + Persistent Session + PWA)
- Section 11: Data Architecture (schema design)
- Section 16: UI/UX Design Requirements (design system, both portals)

---

## Functional Requirements

### 1. Infrastructure and HIPAA Foundation

**Repository and environments**
- Git repository initialized with project structure
- Two environments deployed: staging and production
- Environment variable management and secrets handling
- Docker-based local development setup for team parity

**Supabase configuration**
- Supabase project created with PostgreSQL database
- Database schema designed covering all entities: organizations, providers, patients, billing windows, qualifying events, plans, audit logs, gamification records
- Row Level Security policies enforcing tenant isolation at database layer -- providers access only their own patients, org admins see only their organization
- Supabase Auth configured for OAuth and magic link flows
- Supabase Storage configured for document uploads (Dr. Brain training documents)
- Supabase Edge Functions environment ready

**HIPAA compliance layer**
- AES-256 encryption at rest on all PHI storage
- HTTPS / TLS 1.2+ enforced on all transmission with no exceptions
- Immutable audit log schema: every PHI access records who, what, when, IP address -- write-once, cannot be altered
- Session management: provider sessions auto-expire after 15 minutes of inactivity, any page interaction resets timer
- No PHI in URLs, server logs, error tracking, or third-party analytics -- validated by architecture review
- Encrypted daily backups configured
- BAA-compatible vendor selection verified (Supabase, Twilio, SendGrid, Stripe, Anthropic)

**Multi-tenancy data model**
- Organization entity: holds multiple provider accounts under a single practice
- Provider entity: belongs to one organization, owns a patient panel
- Patient entity: belongs to one provider within one organization
- Platform Administrator: system-level access, separate from org/provider hierarchy
- All API endpoints enforce tenancy scoping -- no endpoint returns data outside the caller's tenant boundary

### 2. Provider Authentication (OAuth + MFA)

**OAuth 2.0 login**
- Sign in with Google (Google Workspace / Gmail)
- Sign in with Microsoft (Microsoft 365 / Outlook / Azure AD)
- OAuth eliminates separate password management for providers

**Mandatory MFA enforcement**
- All provider logins require a second factor regardless of OAuth provider
- MFA enforced at PAVE application level, not delegated to the OAuth provider's own MFA setting
- Supported TOTP authenticator apps: Google Authenticator, Authy, Microsoft Authenticator, 1Password
- MFA cannot be disabled on any provider account
- Account locked after 5 consecutive failed MFA attempts -- self-service unlock via email

**Session behavior**
- Sessions auto-expire after 15 minutes of inactivity
- All login events (success and failure) logged with timestamp, IP address, and device identifier
- Login screen live and functional on staging

### 3. Patient Authentication (Magic Link + MFA + Persistent Session)

**Initial sign-up flow**
- Patients are enrolled by their physician (no self-registration)
- On enrollment completion and plan approval, PAVE sends invitation via patient's preferred channel:
  - Email magic link: single-use, time-limited link that signs the patient in directly
  - SMS magic link: single-use link delivered by text message (via Twilio)

**Patient MFA**
- On first magic link login, patient prompted to set up a second factor
- Supported options: SMS OTP or email OTP (low-friction for 60-85 demographic)
- MFA setup is step-by-step guided for non-technical users
- MFA screen designed with large text, clear instructions, and visual confirmation

**Persistent session**
- Session persists for 30 days on a trusted device
- Daily check-ins do not require re-authentication
- If session expires, patient requests a new magic link -- no password ever
- Patient login screen live and functional on staging

### 4. Patient PWA Shell

**Progressive Web App configuration**
- PWA manifest with app name, icons (192px + 512px), start_url, display: standalone
- Service worker registered with appropriate caching strategies:
  - Cache-first for static assets (JS, CSS, images)
  - Network-first for API responses
  - Stale-while-revalidate for HTML
- Fallback offline page for no-connectivity scenarios
- iOS Add to Home Screen and Android Install App flows tested
- Full-screen app-like experience when launched from home screen
- Standard web URL also works in any browser -- PWA install is optional
- Basic app shell with routing structure for all 5 patient screens

### 5. Figma Design System

**Component library**
- Full component library: buttons, inputs, badges, cards, tabs, modals, dropdowns, sliders, checkboxes, toggles
- Light mode only (dark mode explicitly out of scope)
- Typography scale defined
- Spacing system defined
- Color system with status colors: white (on track), amber (needs attention), green (ready to bill)
- All interactive states documented: default, hover, active, disabled, error, loading

**Provider portal design**
- Desktop-optimized at 1100px max-width
- Clean, data-dense clinical aesthetic
- Monospace numbers for all metrics and financial data
- Minimal borders, clean layout, smooth transitions
- Provider login screen designed and handed off

**Patient portal design**
- Mobile-first responsive -- primary use case is smartphone via PWA
- Simple, warm, supportive aesthetic -- clinical but not intimidating
- Large touch targets throughout -- minimum 48px
- Accessible for adults 60-85 -- no assumed technical sophistication
- Patient login / onboarding screens designed and handed off

---

## Recommended Tools

| Need | Tool | Why |
|---|---|---|
| Database + Auth + Storage | Supabase (Enterprise / HIPAA add-on) | Single platform for 70% of backend. HIPAA add-on includes BAA, encrypted storage, audit logging. |
| Tenant isolation | Supabase Row Level Security | Database-layer enforcement. Less code, more secure than API-layer checks alone. |
| Frontend framework | Next.js 15 (App Router) | v0 scaffolding targets Next.js. SSR, API routes, middleware for audit logging. |
| UI components | shadcn/ui + Radix UI | Accessible primitives. Copy-paste into codebase. Full control over 48px touch targets. |
| CSS | Tailwind CSS | Utility-first. Design tokens map directly to config. |
| Provider TOTP MFA | otpauth (npm) | Lightweight TOTP generation/verification. Under 5KB. No external service dependency. |
| Patient SMS OTP | Twilio Verify | Managed OTP delivery. HIPAA BAA available. Delivery receipts built in. |
| PWA | next-pwa + Workbox | Automates manifest, service worker, caching. Handles iOS install flow. |
| Design | Figma | Industry standard. Component handoff to frontend devs. |

---

## Dependencies (Client Input Required)

| Input | Needed By | Impact If Delayed |
|---|---|---|
| NDA signed | Before Week 1 | Work cannot begin |
| CPT billing logic specification | Week 1 | Billing engine (M2) cannot begin -- cascades to M3 and M4 |
| Replit prototype source code (reference) | Week 1 | Billing logic reference missing |
| ICD-10 code list for enrollment form | Week 2 | Enrollment form search stubbed with partial data |

---

## Exit Gate

Both portals open in a browser. Provider logs in with Google + MFA. Patient portal opens on a phone, magic link arrives by SMS, MFA setup completes. PWA installable on iOS and Android. Design system approved. RLS policies verified. HIPAA audit schema live on staging.
