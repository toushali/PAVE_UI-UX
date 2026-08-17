/* ============================================================
   Kivie Provider Portal — Pro1 app.js
   Vanilla JS only: nav active state, confirmation banner, inline
   panels, tabs, table sort hooks, and the design-version toggle.
   No backend — static prototype, mock data.
   ============================================================ */
(function () {
  "use strict";
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- Active sidebar item from <body data-page="..."> ---- */
  function initNav() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    $$(".navitem").forEach(function (n) {
      n.classList.toggle("is-active", n.getAttribute("data-nav") === page);
    });
  }

  /* ---- Shared shell: inject sidebar + top bar into [data-shell].
     Page sets <body data-page="X" data-title="Title">. Keeps every
     provider page in sync from one place. ---- */
  /* ============================================================
     S4 — one mock feed drives BOTH the bell and the Complaints nav
     badge, so a count can never disagree with itself (D3.5, D6.3).
     Sourced from the same signals as the Overview "Needs attention"
     card, which is the single origin for admin alerts.
     ============================================================ */
  var NOTIFS = [
    { unread: true,  group: "Unread",  tone: "attention", type: "MDR",       text: "CMP-102 escalated to regulatory review",        time: "40m", href: "complaints.html" },
    { unread: true,  group: "Unread",  tone: "enrolled",  type: "Auth",      text: "7 failed login attempts in the last 24h",       time: "2h",  href: "hipaa-audit.html" },
    { unread: true,  group: "Unread",  tone: "attention", type: "Budget",    text: "Twilio SMS spend at 88% of its monthly limit",  time: "5h",  href: "api-costs.html" },
    { unread: false, group: "Earlier", tone: "enrolled",  type: "PHI",       text: "1 patient data request awaiting handling",      time: "1d",  href: "data-requests.html" },
    { unread: false, group: "Earlier", tone: "ready",     type: "AI",        text: "Prompt v14 promoted to v15 by A. Rivera",       time: "1d",  href: "ai-governance.html" }
  ];
  var UNREAD = NOTIFS.filter(function (n) { return n.unread; }).length;
  var OPEN   = NOTIFS.length;

  /* [slug, label, icon paths, badge, group] — group drives the section
     headings, which collapse to hairline dividers in icon-rail mode (S3). */
  var NAV = [
    ["overview","Overview",'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',"","Operations"],
    ["complaints","Complaints & MDR",'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',String(UNREAD),"Operations"],
    /* S11 — FSD §4: the Platform Administrator "manages provider accounts". */
    ["organizations","Organizations",'<rect x="3" y="8" width="8" height="13" rx="1.5"/><rect x="13" y="3" width="8" height="18" rx="1.5"/><path d="M6 12h2M6 16h2M16 7h2M16 11h2M16 15h2"/>',"","Accounts"],
    ["provider-accounts","Provider accounts",'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16 5.4a3.2 3.2 0 0 1 0 5.2"/><path d="M17.5 14.8c2 .8 3.5 2.7 3.5 5.2"/>',"","Accounts"],
    ["reports","Platform reports",'<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-3"/>',"","Analytics"],
    /* S2: §12 API cost & usage — platform vendor spend (gap-analysis E.0) */
    ["api-costs","API costs",'<path d="M4 15a8 8 0 0 1 16 0"/><path d="M12 15l4.5-3.2"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/><path d="M4 15h1.5M18.5 15H20M12 4.5V6"/>',"","Analytics"],
    ["ai-governance","AI Governance",'<path d="M12 3l8 3.5v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-5z"/><path d="M9 12l2 2 4-4"/>',"","Compliance"],
    ["hipaa-audit","HIPAA Audit",'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>',"","Compliance"],
    ["data-requests","Data Requests",'<path d="M12 4v10"/><path d="M8 10l4 4 4-4"/><rect x="4" y="17" width="16" height="3" rx="1.5"/>',"","Compliance"],
    ["platform-settings","Platform settings",'<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M19.8 7.5l-2.2 1.3M6.4 15.2l-2.2 1.3"/>',"","Compliance"]
  ];
  function icon(paths) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>'; }
  var HAMBURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  function renderShell() {
    var host = $("[data-shell]");
    if (!host) return;
    var page = document.body.getAttribute("data-page") || "";
    var title = document.body.getAttribute("data-title") || "";
    var group = null, items = "";
    NAV.forEach(function (n) {
      if (n[4] !== group) { group = n[4]; items += '<div class="nav__section">' + group + '</div>'; }
      items += '<a class="navitem' + (n[0] === page ? " is-active" : "") + '" data-nav="' + n[0] + '" href="' + n[0] + '.html">' +
        icon(n[2]) + '<span class="navitem__label">' + n[1] + '</span>' +
        (n[3] ? '<span class="navitem__badge">' + n[3] + '</span>' : "") + '</a>';
    });
    var side =
      '<a class="skiplink" href="#maincontent">Skip to content</a>' +
      '<aside class="sidebar" id="appnav">' +
      '<div class="sidebar__brand">' +
        '<img class="sidebar__logoimg sidebar__logoimg--light" src="../assets/logo.svg" alt="Kivie" width="92">' +
        '<img class="sidebar__logoimg sidebar__logoimg--dark" src="../assets/logo-light.svg" alt="Kivie" width="92">' +
        '<span class="sidebar__mark" aria-hidden="true">K</span>' +
        '<span class="sidebar__sub">Platform<br>Admin</span></div>' +
      '<nav class="nav" aria-label="Main">' + items + '</nav></aside>' +
      '<div class="scrim" data-scrim hidden></div>';
    host.insertAdjacentHTML("afterbegin", side);

    /* skip-link target */
    var content = $(".content", host);
    if (content) { content.id = "maincontent"; content.setAttribute("tabindex", "-1"); }
    var tb = $("[data-topbar]", host);
    if (tb) tb.innerHTML =
      '<button class="iconbtn navtoggle" data-navtoggle type="button" aria-label="Open navigation" aria-controls="appnav" aria-expanded="false">' + HAMBURGER + '</button>' +
      '<span class="topbar__ctx">' + title + '</span>' +
      '<span class="topbar__spacer"></span>' +
      '<span class="t-meta">Auto-refresh · updated <span class="num" data-ago>0s ago</span></span>' +
      '<button class="themetoggle" data-theme-toggle type="button" aria-label="Toggle light or dark theme" title="Toggle theme">' +
        '<svg class="themetoggle__ic themetoggle__ic--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></svg>' +
        '<svg class="themetoggle__ic themetoggle__ic--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>' +
        '<span class="themetoggle__thumb"></span>' +
      '</button>' +
      notifMenu() +
      '<span class="modeltag modeltag--warn">System-wide access</span>' +
      '<span class="topbar__meta"><strong>Alex Rivera</strong><span>Platform Administrator</span></span>' +
      acctMenu();
  }

  /* S4/D6.3 — the admin feed is sourced from the Overview
     "Needs attention" card, so that is where "View all" goes.
     No "Notification settings" link: the admin console has no
     preferences screen until S11 builds Platform settings (C6),
     and a link to nowhere is worse than no link. */
  var NOTIF_FOOT = '<a href="overview.html">View all alerts</a>';

  /* ---- S4: notification panel. Peek at the feed; Reminders is the
     full history + triage view; Settings owns delivery channels. ---- */
  function notifMenu() {
    var group = null, rows = "";
    NOTIFS.forEach(function (n) {
      if (n.group !== group) { group = n.group; rows += '<div class="notifgroup">' + group + '</div>'; }
      rows += '<a class="notif' + (n.unread ? " is-unread" : "") + '" href="' + n.href + '">' +
        '<span class="badge badge--' + n.tone + '">' + n.type + '</span>' +
        '<span class="notif__body">' + n.text + '</span>' +
        '<span class="notif__time">' + n.time + '</span></a>';
    });
    return '<span class="dd dd--end" data-menu>' +
      '<button class="iconbtn" data-menu-trigger type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Notifications, ' + UNREAD + ' unread">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>' +
        (UNREAD ? '<span class="iconbtn__count num">' + UNREAD + '</span>' : "") +
      '</button>' +
      '<div class="dd__menu notifpanel" role="dialog" aria-label="Notifications">' +
        '<div class="notifpanel__head"><strong>Notifications</strong><span class="spacer"></span>' +
          '<button class="t-link t-primary" type="button" data-notif-readall>Mark all read</button></div>' +
        '<div class="notifpanel__scroll" data-notif-list>' + rows + '</div>' +
        '<div class="notifempty" hidden data-notif-empty><strong>All caught up</strong>' +
          '<span class="t-sm">New alerts will appear here.</span></div>' +
        '<div class="notifpanel__foot">' + NOTIF_FOOT + '</div>' +
      '</div></span>';
  }

  /* ---- S4: account menu (admin).
     S11 added Platform settings (C6), so the menu now carries it.
     Still no per-admin profile screen, so no "My profile" item — a
     menu item pointing nowhere is worse than an absent one. ---- */
  function acctMenu() {
    var ic = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; };
    return '<span class="dd dd--end" data-menu>' +
      '<button class="avatar avatar--btn" data-menu-trigger type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu — Alex Rivera">AR</button>' +
      '<div class="dd__menu acctmenu" role="menu">' +
        '<div class="acctmenu__id"><span class="avatar avatar--sm">AR</span><span>' +
          '<strong>Alex Rivera</strong>' +
          '<span class="t-meta">a.rivera@pave.health</span>' +
          '<span class="t-meta">Platform Administrator · system-wide access</span>' +
        '</span></div>' +
        '<div class="acctmenu__list">' +
          '<a class="dd__item" role="menuitem" href="platform-settings.html">' + ic('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M19.8 7.5l-2.2 1.3M6.4 15.2l-2.2 1.3"/>') + 'Platform settings</a>' +
          '<div class="dd__sep"></div>' +
          '<a class="dd__item is-danger" role="menuitem" href="login.html">' + ic('<path d="M15 17l5-5-5-5"/><path d="M20 12H9"/><path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/>') + 'Sign out</a>' +
        '</div>' +
      '</div></span>';
  }

  /* ---- S4: mark-all-read swaps the panel to its empty state and
     clears the badge. Mock only — no persistence. ---- */
  function initNotifs() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-notif-readall]");
      if (!b) return;
      e.stopPropagation();
      var list = $("[data-notif-list]"), empty = $("[data-notif-empty]"), count = $(".iconbtn__count");
      if (list) list.hidden = true;
      if (empty) empty.hidden = false;
      if (count) count.remove();
      b.hidden = true;
    });
  }

  /* ---- S3: off-canvas drawer (<768px).
     Focus trap, Esc, scrim, body-scroll-lock, focus restore. ---- */
  function initDrawer() {
    var nav = $("#appnav"), scrim = $("[data-scrim]"), toggle = $("[data-navtoggle]");
    if (!nav || !scrim || !toggle) return;
    var lastFocus = null;

    function focusables() {
      return $$('a[href], button:not([disabled])', nav).filter(function (el) {
        return el.offsetParent !== null;
      });
    }
    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function open() {
      lastFocus = document.activeElement;
      scrim.hidden = false;
      /* next frame so the transition runs from opacity 0 */
      requestAnimationFrame(function () { scrim.classList.add("is-open"); });
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
      document.body.style.overflow = "hidden";
      var f = focusables(); if (f.length) f[0].focus();
      document.addEventListener("keydown", onKey);
    }
    function close() {
      nav.classList.remove("is-open");
      scrim.classList.remove("is-open");
      setTimeout(function () { if (!nav.classList.contains("is-open")) scrim.hidden = true; }, 260);
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    toggle.addEventListener("click", function () {
      nav.classList.contains("is-open") ? close() : open();
    });
    scrim.addEventListener("click", close);
    /* resizing out of drawer range must not strand a trapped focus */
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 768 && nav.classList.contains("is-open")) close();
    });
  }

  /* ============================================================
     S10 — idle-timeout warning.
     FSD §5.1 mandates a 15-minute inactivity expiry, but nothing warned
     the user: a physician mid-enrollment simply lost the form. This
     warns at 14 minutes and lets them stay signed in.
     Append ?idle=demo to run it on a 25s / 15s cycle for review.
     ============================================================ */
  function initIdleTimeout() {
    if (!$("[data-shell]")) return;                 /* auth screens exempt */
    var demo   = /[?&]idle=demo/.test(location.search);
    var LIMIT  = demo ? 25000 : 15 * 60 * 1000;     /* FSD §5.1 */
    var WARN_AT = demo ? 15000 : 14 * 60 * 1000;
    var warnTimer, killTimer, dialogOpen = false;

    function signOut() { location.href = "session-expired.html"; }

    function warn() {
      if (dialogOpen) return;
      dialogOpen = true;
      var secs = Math.round((LIMIT - WARN_AT) / 1000);
      window.paveConfirm({
        title: "Still there?",
        body: "You will be signed out in about " + secs + " seconds to protect patient data. " +
              "Anything you have typed but not saved will be lost.",
        cta: "Stay signed in"
      }, function () { dialogOpen = false; reset(); });
      killTimer = setTimeout(signOut, LIMIT - WARN_AT);
    }

    function reset() {
      clearTimeout(warnTimer); clearTimeout(killTimer);
      if (dialogOpen) return;
      warnTimer = setTimeout(warn, WARN_AT);
    }

    ["mousedown", "keydown", "scroll", "touchstart"].forEach(function (e) {
      document.addEventListener(e, function () { if (!dialogOpen) reset(); }, { passive: true });
    });
    reset();
  }

  /* ---- Light / dark theme toggle. Persists to localStorage; the <head>
     bootstrap applies it before paint to avoid a flash. Admin defaults light. ---- */
  function initThemeToggle() {
    function current() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-theme-toggle]");
      if (!t) return;
      var next = current() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("kivie-admin-theme", next); } catch (err) {}
    });
  }

  /* ---- Confirmation banner (top, auto-dismiss ~4s).
     S7: banners stack. Previously every toast was positioned at the
     same fixed coordinates, so two in quick succession sat exactly on
     top of each other and neither was readable (gap-analysis A6.3). ---- */
  var banners = [];
  function restackBanners() {
    var y = 0;
    banners.forEach(function (el) {
      el.style.setProperty("--banner-offset", y + "px");
      y += el.offsetHeight + 8;
    });
  }
  window.paveBanner = function (text) {
    var b = document.createElement("div");
    b.className = "banner banner--ok";
    b.setAttribute("role", "status");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5 9.5 17.5 19.5 6.5"/></svg><span></span>';
    b.querySelector("span").textContent = text;
    document.body.appendChild(b);
    banners.push(b);
    restackBanners();
    setTimeout(function () {
      b.classList.add("is-hiding");
      setTimeout(function () {
        b.remove();
        banners = banners.filter(function (x) { return x !== b; });
        restackBanners();
      }, 260);
    }, 4000);
  };

  /* ============================================================
     S8 — confirmation dialog for irreversible actions.

     Every destructive action in the build was one click -> toast:
     approve a claim, batch-approve, approve a plan, deactivate a
     provider, promote a model to production. Friction is now scaled
     to consequence, matching the PHI-delete pattern that was already
     correct (gap-analysis D.1, B5.1, B7.6, B7.10, B4.1).

     Two tiers:
       · confirm    — summary + explicit CTA
       · type-to-confirm — caller passes `match`; CTA stays disabled
                           until the phrase is typed exactly
     ============================================================ */
  window.paveConfirm = function (opts, onOk) {
    var lastFocus = document.activeElement;
    /* tone: "destructive" = true red (irreversible data operations),
       "danger" = amber (serious but recoverable), default = primary */
    var toneClass = opts.tone === "destructive" ? "btn--destructive"
                  : opts.tone === "danger"      ? "btn--danger"
                  : "btn--primary";
    var m = document.createElement("div");
    m.className = "modal is-open";
    m.innerHTML =
      '<div class="modal__backdrop"></div>' +
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="cfTitle">' +
        '<div class="modal__head"><span class="modal__title" id="cfTitle"></span>' +
          '<button class="modal__x" data-cf-cancel aria-label="Cancel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
        '<div class="modal__body"><p class="m-0" data-cf-body></p>' +
          (opts.detail ? '<div class="claimsum mt-4" data-cf-detail></div>' : "") +
          (opts.match ? '<div class="formgroup mt-4 mb-0"><label>Type <span class="num fw-bold" data-cf-match></span> to confirm</label>' +
                        '<input class="input num" data-cf-input autocomplete="off"></div>' : "") +
        '</div>' +
        '<div class="modal__foot"><button class="btn btn--ghost" data-cf-cancel>Cancel</button>' +
          '<button class="btn ' + toneClass + '" data-cf-ok></button></div>' +
      '</div>';
    m.querySelector("#cfTitle").textContent = opts.title || "Are you sure?";
    m.querySelector("[data-cf-body]").textContent = opts.body || "";
    var ok = m.querySelector("[data-cf-ok]");
    ok.textContent = opts.cta || "Confirm";
    if (opts.detail) m.querySelector("[data-cf-detail]").innerHTML = opts.detail;

    function close() {
      m.remove();
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = $$('button:not([disabled]), input', m);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    $$("[data-cf-cancel]", m).forEach(function (b) { b.addEventListener("click", close); });
    $(".modal__backdrop", m).addEventListener("click", close);
    document.addEventListener("keydown", onKey);

    if (opts.match) {
      m.querySelector("[data-cf-match]").textContent = opts.match;
      ok.disabled = true;
      var input = m.querySelector("[data-cf-input]");
      input.addEventListener("input", function () {
        ok.disabled = input.value.trim().toUpperCase() !== opts.match.toUpperCase();
      });
    }
    ok.addEventListener("click", function () { close(); if (onOk) onOk(); });

    document.body.appendChild(m);
    var focusTarget = opts.match ? m.querySelector("[data-cf-input]") : m.querySelector("[data-cf-cancel]");
    if (focusTarget) focusTarget.focus();
  };

  /* Attribute form: any trigger carrying data-cf-title is gated. */
  function confirmOptsFrom(el) {
    if (!el.getAttribute("data-cf-title")) return null;
    return {
      title:  el.getAttribute("data-cf-title"),
      body:   el.getAttribute("data-cf-body") || "",
      cta:    el.getAttribute("data-cf-cta") || "Confirm",
      tone:   el.getAttribute("data-cf-tone") || "",
      detail: el.getAttribute("data-cf-detail") || "",
      match:  el.getAttribute("data-cf-match") || ""
    };
  }

  /* ---- Generic inline panel: [data-panel-toggle="ID"] flips .is-open
     on #ID. Only one open at a time within a [data-panel-group]. ---- */
  function initPanels() {
    $$('[data-panel-toggle]').forEach(function (btn) {
      var id = btn.getAttribute("data-panel-toggle");
      /* S12/D2.4 — the trigger never said whether its panel was open */
      btn.setAttribute("aria-controls", id);
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var target = document.getElementById(id);
        if (!target) return;
        var group = btn.closest("[data-panel-group]");
        if (group) {
          $$('.is-open', group).forEach(function (pnl) {
            if (pnl !== target) {
              pnl.classList.remove("is-open");
              var owner = $('[data-panel-toggle="' + pnl.id + '"]', group);
              if (owner) owner.setAttribute("aria-expanded", "false");
            }
          });
        }
        var open = target.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ============================================================
     S12 — shared accessibility helpers (gap-analysis D.2)
     ============================================================ */

  /* One polite live region for the whole page. Sorting, filtering and
     row removal were all silent to assistive tech (D2.9). */
  var liveEl = null;
  function announce(msg) {
    if (!liveEl) {
      liveEl = document.createElement("div");
      liveEl.className = "sr-only";
      liveEl.setAttribute("role", "status");
      liveEl.setAttribute("aria-live", "polite");
      document.body.appendChild(liveEl);
    }
    liveEl.textContent = "";
    setTimeout(function () { liveEl.textContent = msg; }, 60);
  }
  window.paveAnnounce = announce;

  /* Status carried by colour or a bare glyph needs a text alternative
     (WCAG 1.4.1 · D2.7). */
  function initStatusText() {
    $$(".num.under").forEach(function (el) {
      if (el.querySelector(".sr-only")) return;
      var sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = " (below the required threshold)";
      el.appendChild(sr);
    });
    $$(".contact-yes").forEach(function (el) {
      if (el.querySelector(".sr-only")) return;
      el.setAttribute("title", "Contact call logged");
      el.insertAdjacentHTML("beforeend", '<span class="sr-only">Contact call logged</span>');
    });
    $$(".contact-no").forEach(function (el) {
      if (el.querySelector(".sr-only")) return;
      el.setAttribute("title", "No contact call yet");
      el.insertAdjacentHTML("beforeend", '<span class="sr-only">No contact call logged yet</span>');
    });
    /* the auto-refresh ticker changes every second — never announce it */
    $$("[data-ago]").forEach(function (el) {
      var wrap = el.closest(".t-meta") || el;
      wrap.setAttribute("aria-hidden", "true");
    });
  }

  var tabSeq = 0;
  function initTabs() {
    $$('[data-tabs]').forEach(function (group) {
      var tabs = $$('[data-tab]', group);
      if (!tabs.length) return;
      var strip = tabs[0].parentNode;
      var panels = $$('[data-tabpanel]', group.parentNode || document);
      strip.setAttribute("role", "tablist");
      var uid = "tabs" + (++tabSeq);

      tabs.forEach(function (tab, i) {
        var key = tab.getAttribute("data-tab");
        var panel = panels.filter(function (p) { return p.getAttribute("data-tabpanel") === key; })[0];
        tab.setAttribute("role", "tab");
        tab.id = uid + "-tab-" + key;
        var active = tab.classList.contains("is-active");
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.setAttribute("tabindex", active ? "0" : "-1");
        if (panel) {
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("tabindex", "0");
          panel.id = panel.id || uid + "-panel-" + key;
          panel.setAttribute("aria-labelledby", tab.id);
          tab.setAttribute("aria-controls", panel.id);
        }
      });

      function select(tab, focus) {
        var key = tab.getAttribute("data-tab");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.setAttribute("tabindex", on ? "0" : "-1");
        });
        panels.forEach(function (p) { p.hidden = p.getAttribute("data-tabpanel") !== key; });
        if (focus) tab.focus();
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(tab); });
        tab.addEventListener("keydown", function (e) {
          var n = null;
          if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
          else if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === "Home") n = tabs[0];
          else if (e.key === "End") n = tabs[tabs.length - 1];
          if (!n) return;
          e.preventDefault();
          select(n, true);
        });
      });
    });
  }
  /* ---- Tabs: [data-tabs] with [data-tab="X"] buttons + [data-tabpanel="X"].
     S12/D2.1 — these were plain buttons: no tablist semantics, no
     aria-selected, no arrow-key navigation. Now a proper roving-tabindex
     tablist. ---- */
  /* ---- Mock 60-second auto-refresh ticker: [data-ago] ---- */
  function initAgo() {
    $$('[data-ago]').forEach(function (el) {
      var s = 0;
      setInterval(function () {
        s = (s + 1) % 60;
        el.textContent = s + "s ago";
      }, 1000);
    });
  }

  /* ============================================================
     Design-version toggle — jump between prototypes (client demo).
     Patient v1 · Patient v2 · Provider · Platform Admin.
     Self-styled inline so it looks identical in every app.
     ============================================================ */
  function initDesignToggle() {
    if (document.getElementById("paveDesignToggle")) return;
    var path = location.pathname;
    var isProvider = path.indexOf("/pro1/") > -1;
    var isAdmin = path.indexOf("/admin/") > -1;
    /* base = everything before the design-folder segment (v1 / v2 / pro1 / admin) */
    var seg = null, base = "";
    ["v1", "v2", "pro1", "admin"].forEach(function (sg) {
      var i = path.indexOf("/" + sg + "/"); if (i > -1) { seg = sg; base = path.slice(0, i); }
    });
    /* Provider portal design toggle.
       Stay on the current provider page when switching theme; else land on dashboard. */
    var ptheme = document.documentElement.getAttribute("data-ptheme") || "pro1";
    var provTarget = isProvider ? path : base + "/pro1/app/dashboard.html";

    var ITEMS = [
      { label: "Patient",          href: base + "/v1/app/today.html",       cur: seg === "v1" || seg === "v2" },
      { label: "Provider",  href: provTarget + "?ptheme=pro1",  cur: isProvider && ptheme === "pro1" },
      { label: "Platform · Admin", href: base + "/admin/app/overview.html",  cur: isAdmin }
    ];
    var curItem = ITEMS.filter(function (i) { return i.cur; })[0] || ITEMS[0];
    var curLabel = curItem.label;

    /* accent follows the live theme so the control matches the page */
    var cs = getComputedStyle(document.documentElement);
    var accent = (cs.getPropertyValue("--c-primary") || "").trim() || "#17838C";
    var accentSoft = (cs.getPropertyValue("--c-primary-soft") || "").trim() || "#E1F4F5";

    var wrap = document.createElement("div");
    wrap.id = "paveDesignToggle";
    var s = wrap.style;
    s.position = "fixed"; s.left = "14px"; var _tb = document.querySelector(".tabbar"); s.bottom = _tb ? ((_tb.offsetHeight || 64) + 14) + "px" : "14px"; s.zIndex = "2147483000";
    s.font = "600 13px/1 Inter, system-ui, sans-serif";

    var menu = document.createElement("div");
    var ms = menu.style;
    ms.position = "absolute"; ms.left = "0"; ms.bottom = "46px"; ms.minWidth = "188px";
    ms.background = "#fff"; ms.border = "1px solid rgba(20,40,70,.12)"; ms.borderRadius = "10px";
    ms.boxShadow = "0 10px 30px rgba(20,40,70,.18)"; ms.padding = "6px"; ms.display = "none";
    ITEMS.forEach(function (it) {
      var a = document.createElement("a");
      a.href = it.href;
      a.textContent = it.label;
      var as = a.style;
      as.display = "block"; as.padding = "9px 12px"; as.borderRadius = "7px";
      as.color = it.cur ? accent : "#1A2230";
      as.background = it.cur ? accentSoft : "transparent";
      as.textDecoration = "none"; as.fontWeight = it.cur ? "700" : "600";
      a.addEventListener("mouseenter", function () { if (!it.cur) a.style.background = "#F3F5F4"; });
      a.addEventListener("mouseleave", function () { if (!it.cur) a.style.background = "transparent"; });
      menu.appendChild(a);
    });

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Switch prototype — viewing " + curLabel);
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="' + accent + '" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2.4" fill="' + accent + '" stroke="none"/><circle cx="15" cy="12" r="2.4" fill="' + accent + '" stroke="none"/><circle cx="8" cy="17" r="2.4" fill="' + accent + '" stroke="none"/></svg>' +
      '<span style="white-space:nowrap">' + curLabel + '</span>' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8993A2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    var bs = btn.style;
    bs.display = "inline-flex"; bs.alignItems = "center"; bs.gap = "8px";
    bs.minHeight = "38px"; bs.padding = "0 12px";
    bs.borderRadius = "999px"; bs.border = "1px solid rgba(20,40,70,.12)";
    bs.background = "#fff"; bs.color = "#1A2230";
    bs.boxShadow = "0 4px 14px rgba(20,40,70,.16)"; bs.cursor = "pointer";

    var open = false;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      open = !open; menu.style.display = open ? "block" : "none";
    });
    document.addEventListener("click", function () { if (open) { open = false; menu.style.display = "none"; } });

    wrap.appendChild(menu); wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  /* ---- OTP / MFA boxes: auto-advance, backspace to previous ---- */
  function initOtp() {
    $$('[data-otp]').forEach(function (wrap) {
      var boxes = $$('input', wrap);
      boxes.forEach(function (box, i) {
        box.addEventListener("input", function () {
          box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);
          box.classList.toggle("is-filled", !!box.value);
          if (box.value && boxes[i + 1]) boxes[i + 1].focus();
        });
        box.addEventListener("keydown", function (e) {
          if (e.key === "Backspace" && !box.value && boxes[i - 1]) boxes[i - 1].focus();
        });
      });
    });
  }

  /* ---- Mono steppers: [data-stepper] with − / + and .stepper__val ---- */
  function initSteppers() {
    $$('[data-stepper]').forEach(function (st) {
      var val = $(".stepper__val", st);
      var step = parseInt(st.getAttribute("data-step") || "1", 10);
      var min = parseInt(st.getAttribute("data-min") || "0", 10);
      $$("button", st).forEach(function (b) {
        b.addEventListener("click", function () {
          var n = parseInt(val.textContent, 10) || 0;
          n += (b.getAttribute("data-dir") === "up" ? step : -step);
          if (n < min) n = min;
          val.textContent = n;
        });
      });
    });
  }

  /* ---- Confirm actions: [data-confirm="Banner text"] → top banner +
     pulse the row's status badge + close its inline panel (FSD §16.3). ---- */
  function initConfirm() {
    $$('[data-confirm]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        /* S8: irreversible actions pass through a confirmation first */
        var opts = confirmOptsFrom(btn);
        if (opts && !btn.hasAttribute("data-cf-done")) {
          window.paveConfirm(opts, function () {
            btn.setAttribute("data-cf-done", "1");
            btn.click();
            btn.removeAttribute("data-cf-done");
          });
          return;
        }
        window.paveBanner(btn.getAttribute("data-confirm"));
        var row = btn.closest("[data-row]");
        if (row) {
          var badge = row.querySelector(".badge");
          if (badge) { badge.classList.remove("pulse"); void badge.offsetWidth; badge.classList.add("pulse"); }
          /* if the action resolves the row to a new status, swap it */
          var to = btn.getAttribute("data-status");
          if (to && badge) {
            badge.className = "badge badge--" + to + " pulse";
            badge.textContent = btn.getAttribute("data-status-label") || badge.textContent;
          }
        }
        var panel = btn.closest(".qrow__panel");
        if (panel) panel.classList.remove("is-open");
      });
    });
  }

  /* ---- Table text filter: inputs/selects with [data-filter] inside a
     [data-filtergroup] hide non-matching [data-filterrow] rows. ---- */
  function initFilters() {
    $$('[data-filtergroup]').forEach(function (group) {
      var inputs = $$('[data-filter]', group);
      var rows = $$('[data-filterrow]', group);
      function apply() {
        var terms = inputs.map(function (i) { return (i.value || "").toLowerCase().trim(); }).filter(Boolean);
        var shown = 0;
        rows.forEach(function (r) {
          var ok = terms.every(function (t) { return r.textContent.toLowerCase().indexOf(t) > -1; });
          r.hidden = !ok; if (ok) shown++;
        });
        var count = $("[data-filtercount]", group);
        if (count) {
          count.textContent = shown;
          var live = count.closest(".t-meta") || count;
          live.setAttribute("aria-live", "polite");
        }
        /* S9: surface a no-results state instead of a blank table */
        var empty = $("[data-empty]", group);
        var wrap  = $(".tablewrap", group) || $("table", group);
        if (empty) empty.hidden = shown !== 0;
        if (wrap)  wrap.hidden  = shown === 0;
      }
      inputs.forEach(function (i) { i.addEventListener("input", apply); i.addEventListener("change", apply); });
    });
  }

  /* ============================================================
     S9 — Empty · loading · error · validation (gap-analysis D.1)
     ============================================================ */

  /* ---- Every filterable table gets a no-results state. Previously a
     search that matched nothing produced a silently blank table. ---- */
  function initEmptyStates() {
    $$('[data-filtergroup]').forEach(function (group) {
      if ($("[data-empty]", group)) return;
      var host = $(".tablewrap", group) || $("table", group);
      if (!host) return;
      var e = document.createElement("div");
      e.className = "emptystate";
      e.setAttribute("data-empty", "");
      e.hidden = true;
      e.innerHTML = '<div class="emptystate__title">No matches</div>' +
        '<p class="emptystate__body">Nothing here matches your search or filters. ' +
        '<button class="t-link t-primary" type="button" data-empty-clear>Clear all filters</button></p>';
      host.parentNode.insertBefore(e, host.nextSibling);
    });
    document.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-empty-clear]");
      if (!b) return;
      var group = b.closest("[data-filtergroup]");
      $$('[data-filter]', group).forEach(function (i) {
        if (i.tagName === "SELECT") i.selectedIndex = 0; else i.value = "";
        i.dispatchEvent(new Event("input", { bubbles: true }));
        i.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  /* ---- Required-field validation.
     Marks [data-required] fields, shows an inline message per field and
     a summary at the top of the scope. M2 §4 requires each enrollment
     step to validate before advancing. ---- */
  var WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>';

  function clearErrors(scope) {
    $$(".is-invalid", scope).forEach(function (el) { el.classList.remove("is-invalid"); });
    $$("[data-generated-err]", scope).forEach(function (el) { el.remove(); });
  }

  window.paveValidate = function (scope) {
    clearErrors(scope);
    var bad = [];
    $$("[data-required]", scope).forEach(function (el) {
      var empty;
      if (el.classList.contains("chips")) {
        empty = !$(".chipopt.is-on", el);
      } else {
        empty = !String(el.value || "").trim();
      }
      if (!empty) return;
      bad.push(el);
      el.classList.add("is-invalid");
      el.setAttribute("aria-invalid", "true");
      var msg = document.createElement("div");
      msg.className = "errmsg";
      msg.setAttribute("data-generated-err", "");
      msg.innerHTML = WARN + "<span></span>";
      msg.querySelector("span").textContent = el.getAttribute("data-required") || "This field is required.";
      (el.closest(".formgroup") || el.parentNode).appendChild(msg);
    });
    if (bad.length) {
      var sum = document.createElement("div");
      sum.className = "formerror";
      sum.setAttribute("data-generated-err", "");
      sum.setAttribute("role", "alert");
      sum.innerHTML = WARN + "<span></span>";
      sum.querySelector("span").textContent =
        bad.length === 1 ? "One field still needs an answer before you can continue."
                         : bad.length + " fields still need an answer before you can continue.";
      scope.insertBefore(sum, scope.firstChild);
      bad[0].focus();
    }
    return bad.length === 0;
  };

  /* clear a field's error as soon as the user fixes it */
  function initValidationReset() {
    document.addEventListener("input", function (e) {
      var el = e.target.closest && e.target.closest(".is-invalid");
      if (!el) return;
      el.classList.remove("is-invalid");
      el.removeAttribute("aria-invalid");
      var g = el.closest(".formgroup");
      if (g) $$("[data-generated-err]", g).forEach(function (x) { x.remove(); });
    });
  }

  /* ---- Connection lost. The provider portal had no offline treatment
     at all, while the patient app has a dedicated screen. ---- */
  function initOffline() {
    var bar = document.createElement("div");
    bar.className = "offlinebar";
    bar.setAttribute("role", "status");
    bar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l22 22"/><path d="M16.7 12.7A6 6 0 0 0 12 11"/><path d="M5 12.5a10 10 0 0 1 4-2.4"/><path d="M2 8.8A15 15 0 0 1 8 6"/><path d="M22 8.8a15 15 0 0 0-6.9-2.7"/><path d="M12 20h.01"/></svg>' +
      '<span>You are offline. Nothing will save until the connection returns.</span>';
    document.body.appendChild(bar);
    function sync() { bar.classList.toggle("is-on", !navigator.onLine); }
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    sync();
  }


  /* ---- S11 · C4: custom date ranges (FSD §14.5 requires them on all
     reports). The preset select reveals a real from/to pair. ---- */
  function initDateRange() {
    $$('[data-daterange-preset]').forEach(function (sel) {
      var custom = $('[data-daterange-custom]', sel.parentNode);
      if (!custom) return;
      function sync() { custom.hidden = sel.value !== "custom"; }
      sel.addEventListener("change", sync);
      sync();
    });
  }

  /* ---- Sortable table: [data-sort] with th[data-col].
     S12/D2.2 — the <th> itself was the click target: not focusable, not
     keyboard-operable, and direction was signalled by a CSS glyph with no
     aria-sort. Each header is now a real button with an announced state. ---- */
  function initSort() {
    $$('[data-sort]').forEach(function (table) {
      var ths = $$("th[data-col]", table);
      ths.forEach(function (th, ci) {
        th.classList.add("sortable");
        var label = th.textContent.trim();
        th.innerHTML = '<button type="button" class="sortbtn">' + label +
                       '<span class="sortbtn__ind" aria-hidden="true">▲</span></button>';
        var btn = $("button", th);
        var ind = $(".sortbtn__ind", btn);

        btn.addEventListener("click", function () {
          var tbody = $("tbody", table);
          var rows = $$("tr", tbody);
          var dir = th.getAttribute("aria-sort") === "ascending" ? "desc" : "asc";
          ths.forEach(function (t) {
            t.removeAttribute("aria-sort");
            t.removeAttribute("data-dir");
            var i = $(".sortbtn__ind", t); if (i) i.textContent = "▲";
          });
          th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
          th.setAttribute("data-dir", dir);
          ind.textContent = dir === "asc" ? "▲" : "▼";
          rows.sort(function (a, b) {
            var av = a.children[ci].textContent.trim(), bv = b.children[ci].textContent.trim();
            var an = parseFloat(av.replace(/[^0-9.\-]/g, "")), bn = parseFloat(bv.replace(/[^0-9.\-]/g, ""));
            var cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : av.localeCompare(bv);
            return dir === "asc" ? cmp : -cmp;
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
          announce("Sorted by " + label + ", " + (dir === "asc" ? "ascending" : "descending") + ".");
        });
      });
    });
  }

  /* ---- S6: responsive tables.
     · copies each column name onto its cells as data-label, which the
       ≤640px card layout renders via ::before
     · propagates th[data-priority] down its column so CSS can drop
       low-value columns in the 641–1023px band
     · toggles the right-edge fade while there is more to scroll
     Cells that span (detail/panel rows) are skipped — they are panels,
     not label/value pairs. ---- */
  function initTables() {
    $$(".qtable").forEach(function (table) {
      var ths = $$("thead th", table);
      if (!ths.length) return;
      var labels = ths.map(function (th) { return th.textContent.trim(); });
      var prio = ths.map(function (th) { return th.getAttribute("data-priority"); });

      ths.forEach(function (th, i) { if (prio[i]) th.setAttribute("data-priority", prio[i]); });

      $$("tbody tr", table).forEach(function (tr) {
        var tds = $$(":scope > td", tr);
        /* a single spanning cell is a detail panel, not a data row */
        if (tds.length === 1 && tds[0].hasAttribute("colspan")) return;
        tds.forEach(function (td, i) {
          if (td.hasAttribute("colspan")) return;
          if (!td.hasAttribute("data-label")) td.setAttribute("data-label", labels[i] || "");
          if (prio[i]) td.setAttribute("data-priority", prio[i]);
        });
      });
    });

    /* scroll affordance */
    $$(".tablewrap").forEach(function (wrap) {
      function sync() {
        var more = wrap.scrollWidth - wrap.clientWidth;
        wrap.classList.toggle("is-scrollable", more > 4);
        wrap.classList.toggle("is-scrollend", more > 4 && wrap.scrollLeft >= more - 4);
      }
      wrap.addEventListener("scroll", sync);
      window.addEventListener("resize", sync);
      sync();
    });
  }

  /* ---- Toggle switches: [data-switch] flips aria-checked ---- */
  function initSwitch() {
    $$('[data-switch]').forEach(function (el) {
      el.addEventListener("click", function () {
        el.setAttribute("aria-checked", el.getAttribute("aria-checked") === "true" ? "false" : "true");
      });
    });
  }

  /* ---- Modals: [data-modal-open="ID"] opens #ID (.modal); backdrop,
     [data-modal-close], and Esc close it. ---- */
  function initModals() {
    /* S12/D2.3 — page modals had no dialog semantics and no focus trap.
       (paveConfirm builds its own; this covers the static ones.) */
    var lastFocus = null;
    function trap(m) {
      return function (e) {
        if (e.key !== "Tab") return;
        var f = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea', m)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
    }
    $$(".modal").forEach(function (m) {
      var pnl = $(".modal__panel", m);
      if (!pnl) return;
      pnl.setAttribute("role", "dialog");
      pnl.setAttribute("aria-modal", "true");
      var title = $(".modal__title", m);
      if (title) {
        title.id = title.id || (m.id || "modal") + "-title";
        pnl.setAttribute("aria-labelledby", title.id);
      }
      m._trap = trap(m);
    });
    $$('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var m = document.getElementById(btn.getAttribute("data-modal-open"));
        if (!m) return;
        lastFocus = btn;
        m.classList.add("is-open");
        document.addEventListener("keydown", m._trap);
        var f = $('input:not([readonly]), button:not([data-modal-close])', $(".modal__body", m) || m);
        (f || $("[data-modal-close]", m)).focus();
      });
    });
    /* restore focus whenever a modal closes */
    document.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest("[data-modal-close], .modal__backdrop")) {
        $$(".modal").forEach(function (m) { document.removeEventListener("keydown", m._trap); });
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
    });
    $$('[data-modal-close]').forEach(function (el) {
      el.addEventListener("click", function () {
        var m = el.closest(".modal"); if (m) m.classList.remove("is-open");
      });
    });
    $$(".modal__backdrop").forEach(function (bg) {
      bg.addEventListener("click", function () { var m = bg.closest(".modal"); if (m) m.classList.remove("is-open"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") $$(".modal.is-open").forEach(function (m) { m.classList.remove("is-open"); });
    });
  }

  /* ---- Dropdown menus: [data-menu] with a trigger button; one open
     at a time, closes on outside click. ---- */
  function initMenus() {
    function setOpen(dd, open) {
      dd.classList.toggle("is-open", open);
      var t = $("[data-menu-trigger]", dd) || $("button", dd);
      if (t) t.setAttribute("aria-expanded", open ? "true" : "false");
    }
    $$('[data-menu]').forEach(function (dd) {
      var trig = $("[data-menu-trigger]", dd) || $("button", dd);
      if (!trig) return;
      /* S12/D2.5 — menus had no role, no aria-haspopup, no keyboard model */
      var panel = $(".dd__menu", dd);
      if (panel && !panel.getAttribute("role")) panel.setAttribute("role", "menu");
      if (panel) $$(".dd__item", panel).forEach(function (i) { i.setAttribute("role", "menuitem"); });
      if (!trig.getAttribute("aria-haspopup")) trig.setAttribute("aria-haspopup", "menu");
      if (!trig.getAttribute("aria-expanded")) trig.setAttribute("aria-expanded", "false");
      dd.addEventListener("keydown", function (e) {
        if (!dd.classList.contains("is-open")) return;
        var items = $$('.dd__item, .notif, a[href], button:not([data-menu-trigger])', panel || dd)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!items.length) return;
        var i = items.indexOf(document.activeElement);
        var n = null;
        if (e.key === "ArrowDown") n = items[(i + 1) % items.length];
        else if (e.key === "ArrowUp") n = items[(i - 1 + items.length) % items.length];
        else if (e.key === "Home") n = items[0];
        else if (e.key === "End") n = items[items.length - 1];
        if (!n) return;
        e.preventDefault();
        n.focus();
      });
      trig.addEventListener("click", function (e) {
        e.stopPropagation();
        var willOpen = !dd.classList.contains("is-open");
        $$('[data-menu].is-open').forEach(function (o) { setOpen(o, false); });
        setOpen(dd, willOpen);
      });
    });
    /* S4: a click INSIDE a panel must not dismiss it — the notification
       panel scrolls and has its own controls. Only outside clicks, or a
       click on an actionable row, close the menu. */
    document.addEventListener("click", function (e) {
      $$('[data-menu].is-open').forEach(function (o) {
        var inside = o.contains(e.target);
        var actionable = e.target.closest && e.target.closest(".dd__item, .notif, a[href]");
        if (!inside || actionable) setOpen(o, false);
      });
    });
    /* Esc closes the topmost open menu */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      $$('[data-menu].is-open').forEach(function (o) {
        setOpen(o, false);
        var t = $("[data-menu-trigger]", o); if (t) t.focus();
      });
    });
  }

  /* ---- Loading demo: [data-loading-demo] shows the button spinner
     briefly, then a confirmation (style-guide + real actions). ---- */
  function initLoadingDemo() {
    $$('[data-loading-demo]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("is-loading")) return;
        btn.classList.add("is-loading");
        setTimeout(function () {
          btn.classList.remove("is-loading");
          window.paveBanner(btn.getAttribute("data-loading-demo") || "Done.");
        }, 1400);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderShell();
    initDrawer();
    initNotifs();
    initThemeToggle();
    initNav();
    initPanels();
    initTabs();
    initAgo();
    initOtp();
    initSteppers();
    initConfirm();
    initFilters();
    initEmptyStates();
    initValidationReset();
    initOffline();
    initIdleTimeout();
    initSort();
    initTables();
    initStatusText();
    initDateRange();
    initSwitch();
    initModals();
    initMenus();
    initLoadingDemo();
    initDesignToggle();
  });
})();
