/* ============================================================
   Kivie — Patient v1 (plant) · Notification design copy
   ------------------------------------------------------------
   STATIC PROTOTYPE ONLY. There is no web-push, service worker,
   or Notification API here — real delivery lands in the later
   Next.js phase. This file is the single source of the copy so
   app/notifications.html renders the DESIGN preview from it.

   Handoff-ready shape (one object per notification):
     { id, event, title, body, time, icon }
       event : daily_reminder | streak_save | milestone |
               stage_change | comeback
       icon  : plant-stage asset used elsewhere in v1 — a later
               (flowering) stage for milestone & stage_change,
               the current stage otherwise
       time  : static example label only
   ============================================================ */
(function () {
  "use strict";

  /* S13: these were pinned to the plant, so notification previews showed a
     plant even for a patient who had chosen the cat. Read the choice. */
  var COMPANION = (function () {
    var c; try { c = localStorage.getItem("kivie-companion"); } catch (e) {}
    return (c === "cat") ? "cat" : "plant";
  })();
  var STAGES = {
    plant: ["../assets/art/plant-2-mature.svg", "../assets/art/plant-3-flowering.svg"],
    cat:   ["../assets/art/cat-2-young.png",    "../assets/art/cat-3-wise.png"]
  };
  var CURRENT_STAGE = STAGES[COMPANION][0];   /* current companion */
  var LATER_STAGE   = STAGES[COMPANION][1];   /* later growth stage */

  var NOTIFICATIONS = [
    {
      id: "n-daily",
      event: "daily_reminder",
      title: "Time for today's check-in",
      body: "A little care today keeps your plant growing. It only takes a minute.",
      time: "8:00 AM",
      icon: CURRENT_STAGE
    },
    {
      id: "n-streak",
      event: "streak_save",
      title: "Keep your streak alive",
      body: "Your plant hasn't been watered today. One small step keeps it going.",
      time: "Just now",
      icon: CURRENT_STAGE
    },
    {
      id: "n-milestone",
      event: "milestone",
      title: "Two weeks strong",
      body: "Your plant is really taking root. Well done.",
      time: "Yesterday",
      icon: LATER_STAGE
    },
    {
      id: "n-stage",
      event: "stage_change",
      title: "New growth",
      body: "Your plant is now flowering. Look how far you've come.",
      time: "2 days ago",
      icon: LATER_STAGE
    },
    {
      id: "n-comeback",
      event: "comeback",
      title: "Welcome back",
      body: "Your plant is happy to see you. Let's pick up where you left off.",
      time: "Jul 3",
      icon: CURRENT_STAGE
    }
  ];

  /* App identity used by the lock-screen push preview. */
  var APP = { name: "Kivie", icon: CURRENT_STAGE, logo: "../assets/logo.svg" };

  window.KIVIE_NOTIFICATIONS = NOTIFICATIONS;
  window.KIVIE_APP = APP;
})();
