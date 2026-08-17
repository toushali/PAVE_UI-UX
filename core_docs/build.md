# PAVE — Build Plan · Feedback Round 2

> **15 Aug 2026.** This plan replaces the previous one. Sessions **S1–S16** (responsive retrofit, states, auth, admin build-out, patient PWA) are complete and S17 was partial — that work is recorded in git history and is not repeated here.
> **Scope:** the client feedback of 15 Aug, plus the redundancy clean-up it asks for.
> **Open gaps not in this feedback** remain tracked in [gap-analysis.md](gap-analysis.md).

---

## 1. Feedback → work

| # | Feedback | Session |
|---|---|---|
| 1 | Patient login: **"Is this you?" first**, other settings after confirmation | R1 |
| 2 | **Check-in → exercises**, not a retrospective "already done" checklist | R3 |
| 3 | Exercises/Progress/Rewards appear **twice** at the bottom of Today | R2 |
| 4 | Each exercise needs **+/− logging**; may exceed the prescription, never fall below | R4 |
| 5 | **Reminders** folds into Settings | R6 |
| 6 | **Dr. Brain training** moves to Platform Admin | R7 |
| 7 | Clinical nav = **Dashboard · Work Queue · Patients · Approvals** | R6 |
| 8 | **Org Admin** visible and reachable only to org admins | R8 |
| 9 | Today previews **"+25 XP"**, confirmation awards **"+10 progress points"** — different number, different unit | R5 |
| 10 | Pain-scale anchors: **"No pain" / "Worst pain" below the face, not beside it** | R3 |
| — | Clean up redundancy across both portals, keep it simple | R9 |

**This feedback closes three open decisions** in gap-analysis §1: **#8 Reminders** (fold into Settings), **#9 Dr. Brain placement** (move to Admin), **#4 Org Admin record access** (role-gate it). Those rows are now resolved.

---

## 2. Session index

| # | Session | Track | Depends on | Est. |
|---|---|---|---|---|
| ~~R1~~ | ~~Onboarding — confirm identity first, then reveal settings~~ ✅ | Patient | — | *done* |
| ~~R2~~ | ~~Remove the duplicated quick-nav on Today~~ ✅ | Patient | — | *done* |
| ~~R3~~ | ~~Re-sequence the daily loop: check-in → exercises → confirmation~~ ✅ | Patient | R2 | *done* |
| ~~R4~~ | ~~Exercise logging with +/− against the prescription~~ ✅ | Patient | — | *done* |
| ~~R5~~ | ~~One reward currency — points only, per FSD §8.3~~ ✅ | Patient | — | *done* |
| ~~R6~~ | ~~Provider nav: Reminders → Settings, Clinical down to four~~ ✅ | Provider | — | *done* |
| ~~R7~~ | ~~Dr. Brain training → Platform Admin~~ ✅ | Both portals | — | *done* |
| ~~R8~~ | ~~Org Admin role gating~~ ✅ | Provider | — | *done* |
| ~~R9~~ | ~~Redundancy sweep + full regression~~ ✅ | All | — | *done* |

```
Patient   R1 ─────────────────┐
          R2 ── R3 ── R4 ─────┤
          R5 ─────────────────┤
                              ├── R9
Provider  R6 ── R8 ───────────┤
          R7 ─────────────────┘
```

**All sessions complete.** The only open item is the browser QA matrix, which is not a build session — see §5.
**Total:** 9 sessions · **7–9 days** (design + front-end).

---

## 3. Patient portal

### R1 · Onboarding — confirm identity first  ✅ **DONE — 15 Aug 2026** *(revised after review)*
**Feedback 1.** The first thing a patient sees today is a physician trust card and three "how it works" cards; *"Is this you?"* is the third block down. It should be the first thing on screen, and nothing else should compete with it.

- [x] Reorder `patient/auth/onboarding.html`: **Confirm your details** becomes the first and only visible block
- [x] Five sections + the sticky Start button gated behind `#onbRest`; the physician trust card **stays above** the question, since it is the context a patient needs *before* confirming identity
- [x] "Yes, that's me" is the single primary action. **Added a "Not me — call the office" secondary** — a confirmation with only a yes button is not a confirmation, and pave_ui §1 puts a phone affordance wherever a patient might expect chat
- [x] Focus moves to the revealed heading. **Deviated from the plan on the live region:** `aria-live` on the five-section container would have read all of onboarding aloud, so it is scoped to a short status message instead
- [x] One page, no route change. Confirm card swaps to a compact confirmed state so the patient can see what they agreed to

**Done when:** a patient lands on one question, answers it, and the rest of onboarding appears. Nothing below the confirm card is reachable or tabbable before confirmation.

**Review round 2 (15 Aug):**
- [x] Email and phone on separate lines; clear gap between "Yes, that's me" and the call-the-office escape
- [x] Confirmed state is a slim strip — 34 px tick left, text beside. The SVG is now pinned; `base.css` sets `svg { max-width: 100% }`, which let an unconstrained icon fill its container
- [x] Third welcome card shows **both** companion bubbles and says "companion", not "plant" — it previously carried `data-companion-art`, so it swapped to a cat while the copy still said plant

> ⚠️ **Service-worker defect found during this review — fixed in `patient/sw.js`.**
> The confirmed-state CSS was correct but **never reached the browser**. S16 built the worker to M1 §4's *"cache-first for static assets"*, which is right when filenames are content-hashed — this build serves `components.css` and `app.js` at fixed paths, so cache-first pinned them at whatever version a device first saw. HTML uses stale-while-revalidate, so markup updated while styling silently did not.
> **CSS and JS now use stale-while-revalidate; cache-first is kept for images and fonts**, which are versioned by filename. `VERSION` bumped to `kivie-v2` so existing caches are discarded on activate.
> Anyone still on the old worker needs one hard reload (or Application → Service Workers → Unregister) to pick it up.

### R2 · Remove the duplicated quick-nav  ✅ **DONE — 18 Aug 2026**
**Feedback 3.** `today.html` carries a `.navtiles` block linking Exercises · Progress · Rewards, and the persistent bottom `.tabbar` carries the same three. Two controls, same destinations, one screen apart.

- [x] Deleted the `.navtiles` block from `patient/app/today.html`
- [x] Removed 6 `.navtile*` rules; no residue in markup, CSS or JS
- [x] Today is now growth hero → streak card → one CTA — a single hero action per pave_ui §2.1
- [x] One `<nav>` on the page and one link inside `<main>` (the check-in CTA)

**Done when:** one navigation surface on Today, and no orphan CSS.

### R3 · Re-sequence the daily loop  ✅ **DONE — 18 Aug 2026**
**Feedback 2.** The check-in currently asks *"Exercises you did today"* as a retrospective checklist — it assumes the session already happened. The intended order is **check in, then exercise**.

**New flow:** Today → **Check-in** (how you feel) → **Exercises** (do them, log them) → **Confirmation**

- [x] Checklist removed; pain scale, Better/Same/Worse and the optional note kept
- [x] Action is now **"Submit & start today's exercises"** — named so it is clear it commits, not merely navigates
- [x] It is a `<button>`, not an `<a>`. Stamps the day, then routes to `exercises.html?from=checkin`
- [x] Today swaps to a checked-in state reading the same stamp, and points at the exercises rather than repeating the check-in
- [x] Day banner + live "n of 4 done" count + a **Finish today** action, disabled until every prescribed exercise is logged
- [x] Hero CTA still opens the check-in; its done-state reflects the check-in only
- [x] Confirmation is now reached from **Finish today**, so the celebration closes the whole loop
- [x] Reaching Exercises from the tab bar shows the plan alone — banner and finish block are gated on `?from=checkin`. The sequence guides; it does not lock

**Feedback 10 — pain-scale anchors.** The two labels sit *beside* their faces (`.painscale__anchors span` is `inline-flex; align-items:center`), so on a 390 px screen the row reads as one long string: face "No pain" · face · "Worst pain" face. Stack them.

- [x] Anchors are columns — face on top, label beneath, centred
- [x] Source order normalised to face-then-label; the last anchor had been reversed
- [x] Each anchor is `flex: 1 1 0`, so the row stays on one line without shrinking the 16 px labels
- [x] Middle face still `aria-hidden` with no label

> ✅ **Settled by the feedback itself:** *"Process is check in first, then exercises."*
>
> **The RTM qualifying check-in fires at the check-in step** — server-timestamped on submit, before the patient reaches the exercise list. Exercise logs attach to that day afterwards and do not gate the billable event.
>
> This agrees with FSD §15.2, which makes *check-in submission* the qualifying event, and preserves §7.2's under-two-minutes promise. A patient who checks in and then runs out of time still gets credit for the monitored event, and the billing engine is untouched by the resequencing.

**Done when:** the hero CTA leads check-in → exercises → confirmation, no screen asks a patient to recall what they already did, and the pain anchors read as face-over-label at 320 px.

### R4 · Exercise logging with +/−  ✅ **DONE — 18 Aug 2026**
**Feedback 4.** Each card was a binary tick. It now carries a counter: a patient may do **more** than prescribed, never fewer.

- [x] Stepper under each card: **−  [n] of 2  +** (`.exlog`, `data-ex-log`, `data-ex-target` read from the printed prescription)
- [x] **Floor at the prescription** — `−` is disabled at the prescribed count. The only route below it is unticking, which is a mis‑tap undo, not partial credit
- [x] No ceiling. Surplus reads *"+1 extra"* in the calm primary — acknowledged, not scored
- [x] 48 px (`--tap-min`) targets on both controls; the row above stays tappable and still opens the exercise detail popup
- [x] Card reads *done* at `logged >= target`; surplus does not change that, and does not inflate the day count
- [x] One polite `aria-live` region (`#exLive`) announces every change, naming the exercise
- [x] Counts feed R3's day-completion state, so *Finish today* still gates on the prescription
- [x] Surplus earns **nothing extra** — see the decision below

> **Decided: acknowledge surplus visually, award nothing extra.** FSD §8.3 fixes the points table, and paying for extra reps in a rehab context incentivises overexertion. Flagged for the client as §6 Q1 — reversible in one line if they disagree.

**Two defects found and fixed while wiring this:**
- `js/app.js` bound a **generic `[data-done-toggle]` handler** that flipped `.is-done` immediately after the page's own handler set it. Ticks a page owns are now marked `data-ex-tick` and skipped by the generic binder.
- The day counter shipped a hardcoded **"0 of 4 done"** against five exercises.

**Verified:** the stepper's three mutations are extracted from the shipped page source and driven directly — 26 assertions, including *log 3 of a prescribed 2*, *cannot log 1*, and *the day completes on reaching the prescription*. Structure, links, assets, inline‑script syntax and the a11y floor re‑checked across all 47 pages in the three portals: clean.

### R5 · One reward currency — points only  ✅ **DONE — 18 Aug 2026**
**Feedback 9.** Today says *"Today's check-in earns +25 XP"*; the confirmation screen awards *"+10 progress points"*. Different number, different unit — for an audience the FSD describes as having no assumed technical sophistication.

Checking the source made it worse than a wording slip:

| | Today | Confirmation / Rewards | FSD §8.3 |
|---|---|---|---|
| Unit | **XP** | progress points | **points** |
| Check-in award | **+25** | +10 | **10** |
| Running total | 480 / 750 **XP** | 480 **progress points** | points |

- **The FSD has no XP and no levels.** §8 defines streaks, badges, points and milestones. "XP" and "level" appear nowhere in it — the build invented a second currency alongside the specified one.
- **It is the same number twice.** Today's `480 XP` and Rewards' `480 progress points` are one value under two names, so this is a labelling split, not two balances to reconcile.
- **+25 is simply wrong.** FSD §8.3 fixes a daily check-in at **10 points**.

**Ruling: points only, FSD numbers.** The *growth* framing on Today stays — it is the companion metaphor the client asked for — but it is expressed in points.

- [x] `480 / 750 points`; check-in preview corrected `+25` → **`+10`**, matching FSD §8.3 and the confirmation award
- [x] *"Your **plant** is now mature"* → *"Your `[companion]` is growing well"* via the `data-companion-word` hook, so it reads for the cat. Stage names differ per motif (mature vs wise), so the copy avoids them
- [x] Audited. Only the check-in preview was wrong; the 25-point milestone award sits inside §8.3's 25–100 band and the 480 running total is one figure across Today and Rewards
- [x] `.xphero*` → `.growthhero*`; `__level`→`__stage`, `__xp`→`__points`. Comments in `components.css` and `tokens.css` aligned too — **zero occurrences of "XP" remain**
- [x] Confirmed — 480 on both screens, awards match the §8.3 table
- [ ] `help.html` FAQ still describes the old check-in flow ("tick the exercises you did") — fix alongside R3

**Done when:** one currency, one name, one number, matching FSD §8.3 — and no screen says XP.

---

## 4. Provider & Admin

### R6 · Provider nav — Reminders into Settings  ✅ **DONE — 18 Aug 2026**
**Feedback 5 + 7.** Clinical held five items; Reminders duplicated both the bell (its feed) and Settings (its preferences).

- [x] `reminders.html` deleted; its `NAV` entry and open-count badge removed
- [x] Its **preferences** merged into Settings as **Notifications & reminders** (`#notifications`)
- [x] Its **feed dropped, not moved** — see below
- [x] Bell footer repointed: *"Open work queue"* + *"Notification settings"* → `settings.html#notifications`
- [x] Account menu's *"Notification preferences"* → the same anchor
- [x] Nav is now **Clinical** — Dashboard · Work Queue · Patients · Approvals · **Business** — Billing reports · Revenue · **Practice** — Org Admin · Dr. Brain · Settings
- [x] `.remtitle` removed from both portals' CSS with the screen it styled

**The feed was dropped rather than folded in.** Its five rows were a third rendering of the same `NOTIFS` array the bell already shows, and every row's CTA pointed at the Work Queue, Approvals, a patient or a plan — i.e. back out again. A live triage list also does not belong in Settings, which is where you configure, not where you work. So the bell stays the peek, the **Work Queue** is the triage surface, and Settings owns what gets sent. Three surfaces became two.

**Merged card, deduplicated:** the two pages between them offered *Billing window closing / Billing-deadline alerts* and *Patient at risk / Patient activity* twice over, and *"Alert me when"* twice. The card now carries four alert types — billing window, claims pending, patient activity, new plans — each with Email and SMS, plus one timing selector and the weekly digest. **9 switches, down from 16 across the two pages.**

**Two things deliberately not carried over:**
- **Web push** (enable toggle + a Push delivery channel). FSD §13 budgets **Twilio SMS and SendGrid email** only; there is no push infrastructure to configure. FSD §6 specifies *"email and SMS thresholds"* — the merged card matches that shape exactly.
- **An "In-app" delivery toggle.** The bell is always there; a switch that cannot turn it off is a fiction.

**Also fixed:** the account menu had *My profile*, *Settings* and *Notification preferences* all resolving to the same bare `settings.html`. Each now lands somewhere distinct (`#profile`, page top, `#notifications`).

**Verified:** 24 assertions — Clinical is exactly the four named items, no route anywhere still reaches `reminders.html`, exactly one page renders notification preferences, every alert type survived the merge, and every cross-page `#fragment` in all three portals lands on a real `id`. Provider portal: **13 feature screens.**

### R7 · Dr. Brain training → Platform Admin  ✅ **DONE — 18 Aug 2026**
**Feedback 6.** Training will be restricted, not offered to every physician — so it belongs with the console that already governs the model.

- [x] `provider/app/dr-brain.html` → `admin/app/dr-brain.html`; bootstrap retargeted to `kivie-admin-theme`, title and page heading follow
- [x] Provider `NAV` entry removed — **nothing in the provider portal mentions `dr-brain` any more**
- [x] Admin nav gained an **AI** group: *Dr. Brain training · AI Governance*. Governance **moved** out of Compliance rather than being listed twice
- [x] Cross-linked both ways — training is where the model changes, governance is where the change is recorded
- [x] All three gated actions carried across intact: promote, roll back, remove-source
- [x] Provider **12 feature screens** · admin **12**

**The actor changed, and that could not be papered over.** In the provider portal this screen belonged to a physician. In the admin console it belongs to a platform administrator, who is **not a clinician** — but FSD §10.4 requires documented human sign-off before a model reaches production, and for a rehabilitation planner that sign-off is clinical.

So promotion and rollback now **require typing the supervising clinician's surname** (`data-cf-match`), recording the action against them rather than against whoever happened to be signed in. A standing banner states the constraint before anyone reaches the buttons: *"Training is staged; promotion is clinical."* The chat speaker is the signed-in administrator, not a doctor.

Without that, the move would have quietly transferred a clinical authority to an operations role — which is precisely the confusion the open question below is about.

> **Still for the client:** *"providing Dr. Brain access to specific physicians"* describes a **per-user permission**, not a portal. FSD §4 defines four roles and none of them is "physician who may train the model". Two readings are live: (a) training stays admin-only and named clinicians sign off — **what is built**; or (b) a new permission lets specific physicians into the training UI, which needs a role-model change. See gap-analysis §1.

**Verified:** 30 assertions — no provider route reaches the training UI, the admin console holds both AI surfaces in one group, the admin design system already carried every component the page needs, and both sign-off gates are in place.

### R8 · Org Admin role gating  ✅ **DONE — 18 Aug 2026** *(pulled forward with the sign-in work)*
**Feedback 8**, plus the client's follow-up: *"the provider portal should open with provider feature; give the dummy email ids for all roles; while signing in I can enter as an org admin or platform admin."*

**One door, four roles.** The provider sign-in gained a **work-email field** — which is how enterprise OAuth actually starts — and the address you enter decides the role and the destination. It is prefilled with the physician, so the portal opens on provider work unless you ask for something else.

| Role (FSD §4) | Email | Person | Lands on |
|---|---|---|---|
| Physician / Provider | `b.stillman@stillmanrehab.com` | Dr. Brandon Stillman, MD | Provider → Dashboard |
| Organization Administrator | `d.okafor@stillmanrehab.com` | Dana Okafor | Provider → Dashboard, **+ Org Admin** |
| Platform Administrator | `a.rivera@pave.health` | Alex Rivera | **Platform Admin** → Overview |
| Patient | `john.carter@example.com` | John Carter | Turned away → the patient app's own door |

MFA code is `123456` for all of them. Every address is listed on the sign-in screen itself as one-click **demo accounts**, and on the new root chooser.

- [x] Role lives in `localStorage["kivie-provider-role"]`, resolved by `currentUser()` and stamped on `<html data-role>`
- [x] **Org Admin** nav item is *absent* for a physician, not present-and-refusing — 7 items vs 8
- [x] Account menu and top bar render the signed-in person: name, initials, address, title
- [x] `org-admin.html` guarded by `data-requires-role`; a physician reaching it by URL gets a plain explanation and a way out
- [x] Settings' **Organization & billing** card carries `data-role-only="org-admin"` and is removed for anyone else
- [x] Signing out clears the role, so the next sign-in starts from the default again
- [x] An unrecognised address opens as a physician — the portal never lands on a blank or broken state
- [x] A platform-admin or patient address can never become a provider-portal identity, even if written into storage by hand

**Decision 4's second half, part-answered.** FSD §4 says an org admin **cannot access individual patient clinical records**, so `patient.html` now carries `data-forbids-role="org-admin"` and explains that the record stays with the treating physician. **Still open:** what an org admin should see *instead* — panel counts, adherence and billing without clinical detail. That is a design task, not a gate, and it is the one part of decision 4 still with the client.

**Verified:** 48 assertions, driving the real `app.js` inside a DOM stub — signing in as each role and reading the nav, identity and gated surfaces that actually render. All three portals clean on the full regression.

**Not real auth.** The role is resolved from a string typed into a box. A real build reads it from the identity provider's claim; the prototype says so on every surface that offers a demo account.

---

### R7b · Dr. Brain access is a per-provider permission  ✅ **DONE — 18 Aug 2026**
**Client follow-up:** *"add an option so that platform admin can choose which providers may get Dr. Brain access."*

- [x] **Grant / revoke on the provider's account record** — inside each provider's *Manage* panel in `admin/app/provider-accounts.html`. A per-user permission belongs on the user, not on the feature
- [x] Granting and revoking are **confirmed actions**, not bare switches — this is an auditable change to who can touch a clinical model
- [x] The grant modal states its own limit: a grantee may stage sandbox changes but **cannot promote to production**, which stays a named clinician's sign-off (FSD §10.4)
- [x] A `Dr. Brain` badge beside the role makes it glanceable in the table — **no ninth column**, so the responsive ladder is untouched
- [x] A filter — *Dr. Brain access → Granted* — so "who holds this?" is answerable in one click
- [x] The training page carries a **read-only roster** (*"Who can use this"*) linking to the one place it is changed. Deliberately **not** a second copy of the switch
- [x] Seeded at **2 of 48**. A restricted permission that everyone holds is not restricted

**One control, one roster** — the same shape as R6's bell/Settings split. The account record owns the permission; the feature page shows who has it and sends you back.

> ✅ **Answered by the client, 18 Aug: keep the control on the platform-admin end only; change nothing in the provider portal.**
> The grant is **recorded, not yet wired to a provider-facing surface** — and that is deliberate. The provider portal stays exactly as R7 left it, with no Dr. Brain entry for anyone. A platform administrator can decide today who *will* have access; what a grantee eventually opens is a later decision, and the permission plus its audit trail are what any version of it needs.

---

## 5. R9 · Redundancy sweep + regression  ✅ **DONE — 18 Aug 2026**

**Feedback: "clean up redundancy across both portals and keep it simple."** R1–R8 removed two screens and three duplicate controls. This session went looking for what was left.

- [x] **Duplicate-destination audit** — every page checked for the same destination reachable twice. **None.** (Shell-injected nav links excluded: a nav item plus an in-page link to Approvals is a shortcut, not redundancy.)
- [x] **Duplicate-control audit** — six shared controls traced across all 45 pages. Two appear twice, and both are correct:
  - *Notification preferences* — patient **and** provider Settings. Different portals, different users.
  - *Companion picker* — onboarding **and** patient Settings. Choose once, change later; that is the design.
- [x] Notification preferences exist in **one** place per portal after R6 (bell = peek · Work Queue = triage · Settings = preferences)
- [x] **Screen counts reconciled** — provider **12** · admin **12** · patient **15** = **39**. Checked mechanically against the filesystem and against both `README.md` and `gap-analysis.md`; the audit now fails if any of the three drift apart.
- [x] **Dead-CSS pass.** `.reminders*` / `.remtitle` went with R6; `.navtiles` with R2. R7 left a larger orphan the earlier pass missed: **every Dr. Brain rule was still in `provider/css/components.css`** — chat, dropzone, sandbox, code viewer, the `--warn` model tag and a responsive override — all dead there and live in `admin/`. **36 lines removed.**
- [x] Full regression across all three portals: tag nesting, local links (HTML **and** JS-built), assets, inline-script syntax, boot-order integrity, class/CSS parity, accessibility floor. **Clean.**
- [ ] **Run the QA matrix in a browser** — 154 portal + 168 patient checks. **Still not done, and I cannot do it.** See below.

### What the dead-CSS pass deliberately kept

35 selectors in provider and ~100 in admin are unreferenced but **not deletable**: component-library entries (`.skeleton`, `.slider`, `.input--error`, `.radio`, `.check`), state hooks (`is-*`), and spacing utilities. Both portals share one design system, so each carries rules the other uses. Only the R7 orphans — rules whose *only* consumer was a page that left the portal — were removed.

> **A note on the first attempt.** The initial detector reported 50–128 dead classes per portal, including obvious falsehoods like `com`, `css` and `googleapis`. It was matching `.name` anywhere in the stylesheet, so `fonts.googleapis.com` and `app.js` registered as selectors. Rebuilt to parse selector lists only and to tokenise `class="…"` properly. **The first number was not a smaller version of the truth — it was noise, and acting on it would have deleted live CSS.**

### The one thing R9 could not close

**Nothing in this prototype has ever been opened in a browser.** Every session, including this one, was verified statically — 45 pages, ~200 automated assertions across nine suites. That catches structure, links, wiring and state machines. It cannot catch:

- anything about **rendering** — layout at a real viewport, wrapping, overflow, z-index, font loading
- **screen-reader output** — the ARIA is present and correct on paper; nobody has heard it
- **keyboard reality** — focus order and traps are coded and unit-tested, never walked
- **the service worker** in its actual lifecycle
- **contrast as rendered**, including the known `--st-ready` failure at 3.53:1

**This is the largest single risk in the handover**, and it is now the only item left in the plan. It needs a person at a machine, not another static pass.

---

## 6. Open questions this feedback raises

| # | Question | Blocks |
|---|---|---|
| ~~1~~ | ~~Does exercise **surplus** earn points, or only satisfy the day?~~ — **built as: no extra points, surplus shown only.** Confirm or reverse | R4 |
| ~~2~~ | ~~*"Dr. Brain access for specific physicians"*~~ ✅ **Answered 18 Aug:** the platform admin grants it per provider; the provider portal is deliberately left unchanged | R7b |
| 3 | Decision 4's second half: what does an org admin see **instead of** a clinical record? The gate is built; the replacement view is not | R8 |
| 4 | Does the **progress-to-next-stage** idea (480 / 750) stay? It is not in the FSD either — only the running total is. Keeping it is fine, but it needs a source of truth for the 750 | R5 |

Everything else in [gap-analysis.md](gap-analysis.md) §1 still stands — decisions **1, 2, 3, 5, 6, 7, 10, 11** are unaffected by this feedback and remain open.
