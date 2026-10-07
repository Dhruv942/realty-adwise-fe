// Minimal service worker so the app is installable. It deliberately caches nothing:
// every page is behind a login and must always come from the server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

// Web Push. The backend sends no customer data, only a lead id; "/leads/<id>" redirects to the
// signed-in user's own lead page (or to the start page when signed out).
self.addEventListener("push", (event) => {
  let n = {};
  try {
    n = event.data ? event.data.json() : {};
  } catch {
    n = {};
  }
  event.waitUntil(
    self.registration.showNotification(n.title || "Realty Adwise", {
      body: n.body,
      tag: n.tag, // a repeat for the same lead replaces the earlier alert
      renotify: true,
      requireInteraction: !!n.requireInteraction, // SLA alerts stay until tapped
      icon: "/icon",
      badge: "/icon",
      data: { entityType: n.entityType, entityId: n.entityId, notificationId: n.notificationId },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { entityType, entityId } = event.notification.data || {};
  const url = entityType === "LEAD" && entityId ? `/leads/${encodeURIComponent(entityId)}` : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ("focus" in w) {
          w.navigate(url);
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
