/* ============================================================
   PAVE Provider Portal — Pro1 app.js
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
  var NAV = [
    ["dashboard","Dashboard",'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',""],
    ["work-queue","Work Queue",'<path d="M4 13h4l1.5 3h5L16 13h4"/><path d="M5 13 7 5h10l2 8v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/>',"9"],
    ["patients","Patients",'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16 5.4a3.2 3.2 0 0 1 0 5.2"/><path d="M17.5 14.8c2 .8 3.5 2.7 3.5 5.2"/>',""],
    ["approvals","Approvals",'<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-5"/>',"3"],
    ["reports","Reports",'<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-3"/>',""],
    ["revenue","Revenue",'<path d="M12 3v18"/><path d="M16.5 6.5C16.5 4.8 14.5 3.5 12 3.5S7.5 4.8 7.5 6.5 9.5 9.5 12 9.5s4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3"/>',""],
    ["org-admin","Org Admin",'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h6"/>',""],
    ["dr-brain","Dr. Brain",'<path d="M12 4a3.5 3.5 0 0 0-3.5 3.5A3 3 0 0 0 6 13a3 3 0 0 0 3 3 3 3 0 0 0 6 0 3 3 0 0 0 3-3 3 3 0 0 0-2.5-5.5A3.5 3.5 0 0 0 12 4z"/><path d="M12 8v4"/><path d="M9.5 10.5 12 12l2.5-1.5"/>',""],
    ["settings","Settings",'<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.5M12 18v2.5M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M19.8 7.5l-2.2 1.3M6.4 15.2l-2.2 1.3"/>',""]
  ];
  function icon(paths) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>'; }
  function renderShell() {
    var host = $("[data-shell]");
    if (!host) return;
    var page = document.body.getAttribute("data-page") || "";
    var title = document.body.getAttribute("data-title") || "";
    var items = NAV.map(function (n) {
      return '<a class="navitem' + (n[0] === page ? " is-active" : "") + '" data-nav="' + n[0] + '" href="' + n[0] + '.html">' +
        icon(n[2]) + n[1] + (n[3] ? '<span class="navitem__badge">' + n[3] + '</span>' : "") + '</a>';
    }).join("");
    var side =
      '<aside class="sidebar">' +
      '<div class="sidebar__brand"><span class="sidebar__logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V8l8-4 8 4v12"/><path d="M9 20v-6h6v6"/></svg></span><span class="sidebar__word">PAVE<span>Provider Portal</span></span></div>' +
      '<nav class="nav" aria-label="Main">' + items + '</nav></aside>';
    host.insertAdjacentHTML("afterbegin", side);
    var tb = $("[data-topbar]", host);
    if (tb) tb.innerHTML =
      '<span class="topbar__ctx">' + title + '</span>' +
      '<span class="topbar__spacer"></span>' +
      '<span class="t-meta">Auto-refresh · updated <span class="num" data-ago>0s ago</span></span>' +
      '<button class="iconbtn" aria-label="Notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><span class="iconbtn__dot"></span></button>' +
      '<span class="topbar__meta"><strong>Dr. Brandon Stillman, MD</strong><span>Stillman Rehabilitation Group</span></span>' +
      '<span class="avatar">BS</span>';
  }

  /* ---- Confirmation banner (top, auto-dismiss ~4s) ---- */
  window.paveBanner = function (text) {
    var b = document.createElement("div");
    b.className = "banner banner--ok";
    b.setAttribute("role", "status");
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5 9.5 17.5 19.5 6.5"/></svg><span></span>';
    b.querySelector("span").textContent = text;
    document.body.appendChild(b);
    setTimeout(function () {
      b.classList.add("is-hiding");
      setTimeout(function () { b.remove(); }, 260);
    }, 4000);
  };

  /* ---- Generic inline panel: [data-panel-toggle="ID"] flips .is-open
     on #ID. Only one open at a time within a [data-panel-group]. ---- */
  function initPanels() {
    $$('[data-panel-toggle]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-panel-toggle"));
        if (!target) return;
        var group = btn.closest("[data-panel-group]");
        if (group) {
          $$('.is-open', group).forEach(function (p) { if (p !== target) p.classList.remove("is-open"); });
        }
        target.classList.toggle("is-open");
      });
    });
  }

  /* ---- Tabs: [data-tabs] with [data-tab="X"] buttons + [data-tabpanel="X"] ---- */
  function initTabs() {
    $$('[data-tabs]').forEach(function (group) {
      var tabs = $$('[data-tab]', group);
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var key = tab.getAttribute("data-tab");
          tabs.forEach(function (t) { t.classList.toggle("is-active", t === tab); });
          $$('[data-tabpanel]', group.parentNode || document).forEach(function (p) {
            p.hidden = p.getAttribute("data-tabpanel") !== key;
          });
        });
      });
    });
  }

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
     Patient v1 · Patient v2 · Provider Pro1  (Pro2 added in S21).
     Self-styled inline so it looks identical in every app.
     ============================================================ */
  function initDesignToggle() {
    if (document.getElementById("paveDesignToggle")) return;
    var path = location.pathname;
    var isProvider = path.indexOf("/pro1/") > -1;
    /* base = everything before the design-folder segment (v1 / v2 / pro1) */
    var seg = null, base = "";
    ["v1", "v2", "pro1"].forEach(function (sg) {
      var i = path.indexOf("/" + sg + "/"); if (i > -1) { seg = sg; base = path.slice(0, i); }
    });
    /* Provider Pro1/Pro2 are ONE codebase — colour scheme only, set via ?ptheme.
       Stay on the current provider page when switching theme; else land on dashboard. */
    var ptheme = document.documentElement.getAttribute("data-ptheme") || "pro1";
    var provTarget = isProvider ? path : base + "/pro1/app/dashboard.html";

    var ITEMS = [
      { label: "Patient · v1",    href: base + "/v1/app/today.html",  cur: seg === "v1" },
      { label: "Patient · v2",    href: base + "/v2/app/today.html",  cur: seg === "v2" },
      { label: "Provider · Pro1", href: provTarget + "?ptheme=pro1",  cur: isProvider && ptheme === "pro1" },
      { label: "Provider · Pro2", href: provTarget + "?ptheme=pro2",  cur: isProvider && ptheme === "pro2" }
    ];
    var curItem = ITEMS.filter(function (i) { return i.cur; })[0] || ITEMS[0];
    var curLabel = curItem.label;

    /* accent follows the live theme so the control matches the page */
    var cs = getComputedStyle(document.documentElement);
    var accent = (cs.getPropertyValue("--c-primary") || "").trim() || "#147D64";
    var accentSoft = (cs.getPropertyValue("--c-primary-soft") || "").trim() || "#E4F2ED";

    var wrap = document.createElement("div");
    wrap.id = "paveDesignToggle";
    var s = wrap.style;
    s.position = "fixed"; s.left = "14px"; s.bottom = "14px"; s.zIndex = "2147483000";
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
        var count = $("[data-filtercount]", group); if (count) count.textContent = shown;
      }
      inputs.forEach(function (i) { i.addEventListener("input", apply); i.addEventListener("change", apply); });
    });
  }

  /* ---- Sortable table: [data-sort] with clickable th[data-col].
     Numeric-aware; toggles asc/desc. ---- */
  function initSort() {
    $$('[data-sort]').forEach(function (table) {
      var ths = $$("th[data-col]", table);
      ths.forEach(function (th, ci) {
        th.classList.add("sortable");
        th.addEventListener("click", function () {
          var tbody = $("tbody", table);
          var rows = $$("tr", tbody);
          var dir = th.getAttribute("data-dir") === "asc" ? "desc" : "asc";
          ths.forEach(function (t) { t.removeAttribute("data-dir"); });
          th.setAttribute("data-dir", dir);
          rows.sort(function (a, b) {
            var av = a.children[ci].textContent.trim(), bv = b.children[ci].textContent.trim();
            var an = parseFloat(av.replace(/[^0-9.\-]/g, "")), bn = parseFloat(bv.replace(/[^0-9.\-]/g, ""));
            var cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : av.localeCompare(bv);
            return dir === "asc" ? cmp : -cmp;
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
        });
      });
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
    $$('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var m = document.getElementById(btn.getAttribute("data-modal-open"));
        if (m) m.classList.add("is-open");
      });
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
    $$('[data-menu]').forEach(function (dd) {
      var trig = $("[data-menu-trigger]", dd) || $("button", dd);
      if (!trig) return;
      trig.addEventListener("click", function (e) {
        e.stopPropagation();
        var willOpen = !dd.classList.contains("is-open");
        $$('[data-menu].is-open').forEach(function (o) { o.classList.remove("is-open"); });
        dd.classList.toggle("is-open", willOpen);
      });
    });
    document.addEventListener("click", function () {
      $$('[data-menu].is-open').forEach(function (o) { o.classList.remove("is-open"); });
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
    initNav();
    initPanels();
    initTabs();
    initAgo();
    initOtp();
    initSteppers();
    initConfirm();
    initFilters();
    initSort();
    initSwitch();
    initModals();
    initMenus();
    initLoadingDemo();
    initDesignToggle();
  });
})();
