/* ============================================================
   Kivie — app.js
   Minimal vanilla JS. ONLY: tab navigation, expand/collapse,
   done/undone toggles, and the exercise timer.
   No framework. No API calls. Mock/in-memory state only.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------
     Tab bar
     Active tab is marked by the page itself (class "is-active"
     on the matching .tab, or via [data-tab] on <body>). Tabs are
     real links between .html files, so we just ensure the correct
     one is highlighted on load.
     ------------------------------------------------------------ */
  function initTabs() {
    var current = document.body.getAttribute("data-tab");
    if (!current) return;
    $$(".tab").forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-tab") === current);
    });
  }

  /* ------------------------------------------------------------
     Expand / collapse
     Any [data-toggle="TARGET_ID"] flips .is-open on #TARGET_ID
     and its own aria-expanded. Used by check-in note, help FAQ.
     ------------------------------------------------------------ */
  function initToggles() {
    $$('[data-toggle]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = document.getElementById(btn.getAttribute("data-toggle"));
        if (!target) return;
        var open = target.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ------------------------------------------------------------
     Done / undone toggles
     Any [data-done-toggle] flips .is-done on the closest
     [data-done-row] (or itself). Used by checklist rows, mark-done.

     A page that owns its own done-state marks the control [data-ex-tick]
     and is skipped here. Exercise logging (R4) tracks a repetition count,
     not a boolean, so a second generic listener would flip .is-done back
     immediately after the page's own handler set it.
     ------------------------------------------------------------ */
  function initDoneToggles() {
    $$('[data-done-toggle]').forEach(function (el) {
      if (el.hasAttribute("data-ex-tick")) return;
      el.addEventListener("click", function () {
        var row = el.closest("[data-done-row]") || el;
        var done = row.classList.toggle("is-done");
        el.setAttribute("aria-pressed", done ? "true" : "false");
      });
    });
  }

  /* ------------------------------------------------------------
     Large-text toggle  — [data-textsize-toggle] flips html.text-lg
     High-contrast toggle — [data-contrast-toggle] flips html.high-contrast
     Both work as plain buttons or as .switch (aria-checked).
     ------------------------------------------------------------ */
  function initClassToggle(attr, cls) {
    $$('[' + attr + ']').forEach(function (el) {
      el.addEventListener("click", function () {
        var on = document.documentElement.classList.toggle(cls);
        el.setAttribute("aria-pressed", on ? "true" : "false");
        if (el.hasAttribute("aria-checked")) el.setAttribute("aria-checked", on ? "true" : "false");
      });
    });
  }
  /* Text-size picker: [data-textsize] group with [data-size="sm|md|lg"]
     buttons. Applies html.text-sm / (none) / html.text-lg, exclusively. */
  function initTextSize() {
    $$('[data-textsize]').forEach(function (group) {
      var opts = $$('[data-size]', group);
      opts.forEach(function (opt) {
        opt.addEventListener("click", function () {
          var size = opt.getAttribute("data-size");
          var root = document.documentElement;
          root.classList.remove("text-sm", "text-lg");
          if (size === "sm") root.classList.add("text-sm");
          else if (size === "lg") root.classList.add("text-lg");
          opts.forEach(function (o) {
            o.classList.remove("is-active");
            o.setAttribute("aria-pressed", "false");
          });
          opt.classList.add("is-active");
          opt.setAttribute("aria-pressed", "true");
        });
      });
    });
  }
  function initContrast() { initClassToggle("data-contrast-toggle", "high-contrast"); }

  /* ------------------------------------------------------------
     Plain toggle switches (settings) — [data-switch] flips its own
     aria-checked (visual state driven by CSS).
     ------------------------------------------------------------ */
  function initSwitches() {
    $$('[data-switch]').forEach(function (el) {
      el.addEventListener("click", function () {
        var on = el.getAttribute("aria-checked") === "true";
        el.setAttribute("aria-checked", on ? "false" : "true");
      });
    });
  }

  /* ------------------------------------------------------------
     Segmented single-select — [data-segmented] wraps [data-seg]
     buttons (splash platform, settings channel).
     ------------------------------------------------------------ */
  function initSegmented() {
    $$('[data-segmented]').forEach(function (group) {
      var segs = $$('[data-seg]', group);
      segs.forEach(function (seg) {
        seg.addEventListener("click", function () {
          segs.forEach(function (s) { s.classList.remove("is-active"); s.setAttribute("aria-pressed", "false"); });
          seg.classList.add("is-active");
          seg.setAttribute("aria-pressed", "true");
          /* optional: reveal a target panel named by data-seg-target */
          var target = seg.getAttribute("data-seg-target");
          if (target) {
            $$('[data-seg-panel]', group.parentNode || document).forEach(function (p) {
              p.hidden = p.getAttribute("data-seg-panel") !== target;
            });
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------
     OTP boxes — auto-advance on entry, backspace to previous.
     [data-otp] wraps single-char inputs.
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     Done/undone with a scale-pulse (checklist rows).
     Any [data-check-row] toggles .is-done + a one-shot .just-done
     animation, and flips its aria-pressed / aria-checked.
     ------------------------------------------------------------ */
  function initCheckRows() {
    $$('[data-check-row]').forEach(function (row) {
      row.addEventListener("click", function () {
        var done = row.classList.toggle("is-done");
        row.setAttribute("aria-pressed", done ? "true" : "false");
        if (done) {
          row.classList.remove("just-done");
          /* reflow so the animation restarts on each mark */
          void row.offsetWidth;
          row.classList.add("just-done");
        }
        saveDraft();
      });
    });
  }

  /* ------------------------------------------------------------
     Pain scale — 0..10 single select. Updates the big value +
     word. [data-painscale] wraps the segments; segments are
     [data-pain="N"]; readouts are [data-pain-num]/[data-pain-word].
     ------------------------------------------------------------ */
  var PAIN_WORDS = [
    "No pain", "Very mild", "Mild", "Mild", "Moderate", "Moderate",
    "Moderate", "Strong", "Strong", "Very strong", "Worst"
  ];
  function initPainScale() {
    $$('[data-painscale]').forEach(function (scale) {
      var segs = $$('[data-pain]', scale);
      var numEl  = $('[data-pain-num]', scale);
      var wordEl = $('[data-pain-word]', scale);
      var faceEl = $('[data-pain-face]', scale);
      var FACE = [0,0,1,1,2,2,3,3,4,4,4];   /* level 0-10 -> face 0-4 */
      segs.forEach(function (seg) {
        seg.addEventListener("click", function () {
          segs.forEach(function (s) {
            s.classList.remove("is-selected");
            s.setAttribute("aria-checked", "false");
          });
          seg.classList.add("is-selected");
          seg.setAttribute("aria-checked", "true");
          var v = parseInt(seg.getAttribute("data-pain"), 10);
          if (numEl)  numEl.textContent = v;
          if (wordEl) wordEl.textContent = PAIN_WORDS[v] || "";
          if (faceEl) {
            faceEl.src = "../assets/art/pain-face-" + FACE[v] + ".svg";
            scale.classList.add("has-pain");
          }
          saveDraft();
        });
      });
    });
  }

  /* ------------------------------------------------------------
     Pill toggle groups — single select within [data-pillgroup].
     ------------------------------------------------------------ */
  function initPillGroups() {
    $$('[data-pillgroup]').forEach(function (group) {
      var pills = $$('[data-pill]', group);
      pills.forEach(function (pill) {
        pill.addEventListener("click", function () {
          pills.forEach(function (p) {
            p.classList.remove("is-selected");
            p.setAttribute("aria-checked", "false");
          });
          pill.classList.add("is-selected");
          pill.setAttribute("aria-checked", "true");
          saveDraft();
        });
      });
    });
  }

  /* ------------------------------------------------------------
     Voice-to-text mic (prototype stub).
     No real speech API — just toggles a recording affordance so
     the flow is demonstrable. [data-mic] toggles .is-recording.
     ------------------------------------------------------------ */
  function initMic() {
    $$('[data-mic]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.classList.toggle("is-recording");
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        var label = $('[data-mic-label]', btn);
        if (label) label.textContent = on ? "Listening… tap to stop" : "Tap to speak";
      });
    });
  }

  /* ------------------------------------------------------------
     Draft autosave (in-memory only). Keeps check-in input across
     accidental interactions during the session. No storage, no API
     — this is a prototype; the object simply lives on window.
     ------------------------------------------------------------ */
  function saveDraft() {
    var form = $('[data-checkin-form]');
    if (!form) return;
    var pain = $('[data-painscale] .is-selected', form);
    var compare = $('[data-pillgroup] .is-selected', form);
    var note = $('[data-note-text]', form);
    window.__paveDraft = {
      pain: pain ? parseInt(pain.getAttribute("data-pain"), 10) : null,
      exercisesDone: $$('[data-check-row].is-done', form).length,
      compare: compare ? compare.textContent.trim() : null,
      note: note ? note.value : ""
    };
  }

  /* ------------------------------------------------------------
     Exercise timer — big countdown ring for holds/reps.
     Markup: [data-timer][data-duration="15"] wrapping an SVG with
     [data-timer-prog] (progress arc), plus [data-timer-count],
     [data-timer-start], [data-timer-reset]. The ring depletes as
     the countdown runs; an optional gentle chime marks completion.
     ------------------------------------------------------------ */
  function chime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 660;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.start();
      o.stop(ctx.currentTime + 0.65);
    } catch (e) { /* audio not available — silent, that's fine */ }
  }

  function initTimer() {
    $$('[data-timer]').forEach(function (t) {
      var dur    = parseInt(t.getAttribute("data-duration"), 10) || 15;
      var countEl = $('[data-timer-count]', t);
      var prog    = $('[data-timer-prog]', t);
      var startBtn = $('[data-timer-start]', t);
      var resetBtn = $('[data-timer-reset]', t);
      var R = 88;                      /* must match r= on the arc */
      var C = 2 * Math.PI * R;
      var remaining = dur, tickId = null, running = false;

      prog.style.strokeDasharray = C;

      function render() {
        countEl.textContent = remaining;
        prog.style.strokeDashoffset = C * (1 - remaining / dur);
      }
      function stopTimer() {
        running = false;
        if (tickId) { clearInterval(tickId); tickId = null; }
      }

      startBtn.addEventListener("click", function () {
        if (running) { stopTimer(); startBtn.textContent = "Resume"; return; }
        if (remaining === 0) { remaining = dur; render(); }
        running = true;
        startBtn.textContent = "Pause";
        tickId = setInterval(function () {
          remaining -= 1;
          if (remaining <= 0) {
            remaining = 0;
            render();
            stopTimer();
            startBtn.textContent = "Done ✓";
            chime();
            return;
          }
          render();
        }, 1000);
      });

      resetBtn.addEventListener("click", function () {
        stopTimer();
        remaining = dur;
        render();
        startBtn.textContent = "Start";
      });

      render();
    });
  }

  /* ---- Respect reduced motion ---- */
  function prefersReduce() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---- Count a number up from 0 to its data-count-to (easeOutCubic) ---- */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count-to"), 10);
    if (isNaN(target)) return;
    if (prefersReduce()) { el.textContent = target; return; }
    var dur = 950, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }
  function initCountUp() {
    $$("[data-count-to]").forEach(function (el) {
      if (el.offsetParent !== null) countUp(el);   /* only the currently visible ones */
    });
  }

  /* ---- Fill progress bars from 0 to their data-fill percentage ---- */
  function initBars() {
    $$("[data-fill]").forEach(function (f) {
      var pct = parseInt(f.getAttribute("data-fill"), 10);
      if (isNaN(pct)) return;
      if (prefersReduce()) { f.style.width = pct + "%"; return; }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { f.style.width = pct + "%"; });
      });
    });
  }

  /* ---- Milestone celebration: drifting petals + plant growth + count-up.
     Warm and calm by design (older-adult gamification: clarity over spectacle). */
  function spawnPetals(container, n) {
    var colors = ["#D98E73", "#F2B705", "#8FD1B8", "#E7B7A3"];  /* terracotta, gold, soft green, blush */
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      var sz = (11 + Math.random() * 12).toFixed(0);
      p.style.left = (Math.random() * 100) + "%";
      p.style.background = colors[i % colors.length];
      p.style.width = sz + "px";
      p.style.height = sz + "px";
      p.style.setProperty("--spin", (Math.random() * 300 - 150).toFixed(0) + "deg");
      p.style.animationDelay = (Math.random() * 0.9).toFixed(2) + "s";
      p.style.animationDuration = (3 + Math.random() * 1.8).toFixed(2) + "s";
      container.appendChild(p);
    }
    setTimeout(function () { container.innerHTML = ""; }, 6500);
  }
  function playMilestone() {
    var grow = $("#grow"), bloom = $("#bloom");
    if (grow) setTimeout(function () { grow.classList.add("is-grown"); }, 450);
    if (bloom && !prefersReduce()) spawnPetals(bloom, 22);
    $$("#milestoneView [data-count-to]").forEach(function (el) {
      setTimeout(function () { countUp(el); }, 700);
    });
  }
  function showMilestone() {
    var calm = $("#calmView"), mile = $("#milestoneView");
    if (calm) calm.hidden = true;
    if (mile) mile.hidden = false;
    playMilestone();
  }
  function initMilestone() {
    var btn = $("#previewMilestone");
    if (btn) btn.addEventListener("click", showMilestone);
    if ($("#milestoneView") && /[?&]milestone=/.test(window.location.search)) showMilestone();
  }



  /* ============================================================
     S13 — Choose your companion.
     Plant and cat were two builds of the same portal. They
     are now one portal with a runtime motif: the patient picks at
     onboarding and can change it in Settings without losing streak,
     points or badges.

     Both motifs ship THREE stages, and the 1/2/3 art files map 1:1 —
     the five-stage `data-grow` layering in components.css was an
     earlier iteration that no markup ever used (dead CSS).

     html[data-companion] is set pre-paint by a <head> bootstrap so
     colour and copy are correct immediately; the image sources are
     swapped here on mount. In production this would be rendered
     server-side from the stored preference.
     ============================================================ */
  var COMPANIONS = {
    plant: {
      label: "plant",
      art: { "1": "plant-1-young.svg", "2": "plant-2-mature.svg", "3": "plant-3-flowering.svg" },
      alt: { "1": "Your plant, a young seedling", "2": "Your plant, growing well", "3": "Your plant, in flower" },
      /* medallions carry the motif too — leaf emblem */
      medal: { bronze: "badge-bronze-plant.svg", gold: "badge-gold-plant.svg",
               locked: "badge-locked-plant.svg", platinum: "badge-platinum-plant.svg" },
      copy: {
        growNote: "2 days until your plant grows taller",
        growing:  "Your plant is growing. A little care each day and it keeps getting stronger.",
        fresh:    "A fresh start. Check in today and your plant begins again \u2014 everyone starts here.",
        chip:     "Your plant is growing \u2014 see your rewards \u2192",
        /* the journey track \u2014 one line per milestone */
        j1:       "Your seed was planted",
        j14:      "Your seedling becomes a young plant.",
        j14soon:  "Just 2 days away. Your plant grows taller \ud83c\udf31",
        j30:      "Steady Hand. Your plant begins to bud.",
        j60:      "Your plant flowers."
      }
    },
    cat: {
      label: "cat",
      art: { "1": "cat-1-kitten.svg", "2": "cat-2-young.svg", "3": "cat-3-wise.svg" },
      alt: { "1": "Your cat, a small kitten", "2": "Your cat, a playful young cat", "3": "Your cat, wise and content" },
      /* paw emblem — the designed cat medallions */
      medal: { bronze: "badge-bronze-cat.svg", gold: "badge-gold-cat.svg",
               locked: "badge-locked-cat.svg", platinum: "badge-platinum-cat.svg" },
      copy: {
        growNote: "2 days until your cat grows up",
        growing:  "Your cat is growing. A little care each day and it keeps getting stronger.",
        fresh:    "A fresh start. Check in today and your cat begins again \u2014 everyone starts here.",
        chip:     "Your cat is growing \u2014 see your rewards \u2192",
        /* the journey track \u2014 one line per milestone */
        j1:       "Your kitten came home",
        j14:      "Your kitten becomes a young cat.",
        j14soon:  "Just 2 days away. Your cat grows up \ud83d\udc3e",
        j30:      "Steady Hand. Your cat grows surer of itself.",
        j60:      "Your cat, wise and content."
      }
    }
  };

  function getCompanion() {
    var c;
    try { c = localStorage.getItem("kivie-companion"); } catch (e) {}
    return (c === "cat" || c === "plant") ? c : "plant";
  }

  function paintCompanion(name) {
    var c = COMPANIONS[name] || COMPANIONS.plant;
    document.documentElement.setAttribute("data-companion", name);
    $$("[data-companion-art]").forEach(function (img) {
      var stage = img.getAttribute("data-companion-art");
      if (!c.art[stage]) return;
      img.setAttribute("src", "../assets/art/" + c.art[stage]);
      img.setAttribute("alt", c.alt[stage]);
    });
    /* medallions follow the motif — the emblem inside the frame changes */
    $$("[data-companion-medal]").forEach(function (img) {
      var tier = img.getAttribute("data-companion-medal");
      if (!c.medal[tier]) return;
      img.setAttribute("src", "../assets/art/" + c.medal[tier]);
      img.setAttribute("alt", (img.getAttribute("alt") || "")
        .replace(/ medallion.*$/, " medallion") || "Medallion");
    });
    /* any copy that names the companion */
    $$("[data-companion-word]").forEach(function (el) { el.textContent = c.label; });
    /* whole sentences that only make sense for one motif */
    $$("[data-companion-copy]").forEach(function (el) {
      var key = el.getAttribute("data-companion-copy");
      if (c.copy && c.copy[key]) el.textContent = c.copy[key];
    });
    /* keep every chooser in sync */
    $$("[data-companion-pick]").forEach(function (btn) {
      var on = btn.getAttribute("data-companion-pick") === name;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function setCompanion(name) {
    try { localStorage.setItem("kivie-companion", name); } catch (e) {}
    paintCompanion(name);
  }

  function initCompanion() {
    paintCompanion(getCompanion());
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-companion-pick]");
      if (!btn) return;
      var name = btn.getAttribute("data-companion-pick");
      if (name === getCompanion()) return;
      setCompanion(name);
      /* the art change is self-evident visually; announce it for AT */
      var live = $("[data-companion-live]");
      if (!live) {
        live = document.createElement("div");
        live.setAttribute("data-companion-live", "");
        live.setAttribute("role", "status");
        live.setAttribute("aria-live", "polite");
        live.className = "sr-only";
        document.body.appendChild(live);
      }
      live.textContent = "Your companion is now a " + COMPANIONS[name].label + ".";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCompanion();
    initTabs();
    initToggles();
    initDoneToggles();
    initTextSize();
    initCheckRows();
    initPainScale();
    initPillGroups();
    initMic();
    initTimer();
    initContrast();
    initSwitches();
    initSegmented();
    initOtp();
    initCountUp();
    initBars();
    initMilestone();
  });
})();