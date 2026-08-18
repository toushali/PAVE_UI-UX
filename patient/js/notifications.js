/* ============================================================
   Kivie — Patient PWA · Notification design copy
   ------------------------------------------------------------
   STATIC PROTOTYPE ONLY. There is no web-push, service worker,
   or Notification API here — real delivery lands in the later
   Next.js phase. This file is the single source of the copy so
   app/notifications.html renders the DESIGN preview from it.

   Handoff-ready shape (one object per notification):
     { id, event, title, body, time, icon }
       event : daily_reminder | streak_save | milestone |
               stage_change | comeback
       icon  : companion-stage asset used elsewhere in the app —
               a later stage for milestone & stage_change, the
               current stage otherwise
       time  : static example label only

   Every string is written twice, once per companion. A plant is
   watered and takes root; a cat is fed and settles in. Copy that
   works for one and not the other is the bug this shape prevents:
   the two tables are asserted to define the same events.
   ============================================================ */
(function () {
  "use strict";

  /* S13: icons were pinned to the plant, so previews showed a plant even
     for a patient who had chosen the cat. R-series: the words had the same
     problem. Read the choice once, here. */
  var COMPANION = (function () {
    var c; try { c = localStorage.getItem("kivie-companion"); } catch (e) {}
    return (c === "cat") ? "cat" : "plant";
  })();

  var STAGES = {
    plant: ["../assets/art/plant-2-mature.svg", "../assets/art/plant-3-flowering.svg"],
    cat:   ["../assets/art/cat-2-young.svg",    "../assets/art/cat-3-wise.svg"]
  };
  var CURRENT_STAGE = STAGES[COMPANION][0];   /* current companion */
  var LATER_STAGE   = STAGES[COMPANION][1];   /* later growth stage */

  /* ---- copy, per event, per companion ---- */
  var COPY = {
    daily_reminder: {
      plant: { title: "Time for today's check-in",
               body:  "A little care today keeps your plant growing. It only takes a minute." },
      cat:   { title: "Time for today's check-in",
               body:  "A little care today keeps your cat happy. It only takes a minute." }
    },
    streak_save: {
      plant: { title: "Keep your streak alive",
               body:  "Your plant hasn't been watered today. One small step keeps it going." },
      cat:   { title: "Keep your streak alive",
               body:  "Your cat hasn't been fed today. One small step keeps it going." }
    },
    milestone: {
      plant: { title: "Two weeks strong",
               body:  "Your plant is really taking root. Well done." },
      cat:   { title: "Two weeks strong",
               body:  "Your cat is really settling in. Well done." }
    },
    stage_change: {
      plant: { title: "New growth",
               body:  "Your plant is now flowering. Look how far you've come." },
      cat:   { title: "All grown up",
               body:  "Your kitten is a cat now. Look how far you've come." }
    },
    comeback: {
      plant: { title: "Welcome back",
               body:  "Your plant is happy to see you. Let's pick up where you left off." },
      cat:   { title: "Welcome back",
               body:  "Your cat is happy to see you. Let's pick up where you left off." }
    }
  };

  /* time and icon are motif-independent; only the words and the art differ */
  var SCHEDULE = [
    { id: "n-daily",     event: "daily_reminder", time: "8:00 AM",    icon: CURRENT_STAGE },
    { id: "n-streak",    event: "streak_save",    time: "Just now",   icon: CURRENT_STAGE },
    { id: "n-milestone", event: "milestone",      time: "Yesterday",  icon: LATER_STAGE },
    { id: "n-stage",     event: "stage_change",   time: "2 days ago", icon: LATER_STAGE },
    { id: "n-comeback",  event: "comeback",       time: "Jul 3",      icon: CURRENT_STAGE }
  ];

  /* Resolve to the documented flat shape, so the handoff contract is
     unchanged: consumers still see { id, event, title, body, time, icon }. */
  var NOTIFICATIONS = SCHEDULE.map(function (n) {
    var c = (COPY[n.event] || {})[COMPANION] || (COPY[n.event] || {}).plant || {};
    return { id: n.id, event: n.event, title: c.title, body: c.body,
             time: n.time, icon: n.icon };
  });

  /* App identity used by the lock-screen push preview. */
  var APP = { name: "Kivie", icon: CURRENT_STAGE, logo: "../assets/logo.svg" };

  window.KIVIE_NOTIFICATIONS = NOTIFICATIONS;
  window.KIVIE_APP = APP;
  window.KIVIE_NOTIFICATION_COPY = COPY;   /* exposed so tests can diff the motifs */
})();
