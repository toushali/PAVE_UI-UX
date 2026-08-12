/* ============================================================
   Kivie — Patient v2 (cat) · Notification design copy
   ------------------------------------------------------------
   STATIC PROTOTYPE ONLY. There is no web-push, service worker,
   or Notification API here — real delivery lands in the later
   Next.js phase. This file is the single source of the copy so
   app/notifications.html renders the DESIGN preview from it.

   Handoff-ready shape (one object per notification):
     { id, event, title, body, time, icon }
       event : daily_reminder | streak_save | milestone |
               stage_change | comeback
       icon  : cat-stage asset used elsewhere in v2 — the wise
               (older) stage for milestone & stage_change, the
               current stage otherwise
       time  : static example label only
   ============================================================ */
(function () {
  "use strict";

  var CURRENT_STAGE = "../assets/art/cat-2-young.png";   /* current companion */
  var WISE_STAGE    = "../assets/art/cat-3-wise.png";    /* wise, older cat   */

  var NOTIFICATIONS = [
    {
      id: "n-daily",
      event: "daily_reminder",
      title: "Time for today's check-in",
      body: "Your cat is waiting for you. A quick check-in keeps them happy.",
      time: "8:00 AM",
      icon: CURRENT_STAGE
    },
    {
      id: "n-streak",
      event: "streak_save",
      title: "Keep your streak alive",
      body: "Don't leave your cat hanging. A quick check-in keeps your streak going.",
      time: "Just now",
      icon: CURRENT_STAGE
    },
    {
      id: "n-milestone",
      event: "milestone",
      title: "Two weeks strong",
      body: "Your kitten is growing into a healthy young cat. Well done.",
      time: "Yesterday",
      icon: WISE_STAGE
    },
    {
      id: "n-stage",
      event: "stage_change",
      title: "Your cat has grown up",
      body: "Say hello to your wise companion. Look how far you've come.",
      time: "2 days ago",
      icon: WISE_STAGE
    },
    {
      id: "n-comeback",
      event: "comeback",
      title: "Welcome back",
      body: "Your cat missed you. Let's ease back in today.",
      time: "Jul 3",
      icon: CURRENT_STAGE
    }
  ];

  /* App identity used by the lock-screen push preview. */
  var APP = { name: "Kivie", icon: CURRENT_STAGE, logo: "../assets/logo.svg" };

  window.KIVIE_NOTIFICATIONS = NOTIFICATIONS;
  window.KIVIE_APP = APP;
})();
