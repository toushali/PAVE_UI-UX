/* ============================================================
   PAVE — app.js
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
     ------------------------------------------------------------ */
  function initDoneToggles() {
    $$('[data-done-toggle]').forEach(function (el) {
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
  function initTextSize() { initClassToggle("data-textsize-toggle", "text-lg"); }
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

  document.addEventListener("DOMContentLoaded", function () {
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
  });
})();
