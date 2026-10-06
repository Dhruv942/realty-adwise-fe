// Minimal service worker so the app is installable. It deliberately caches nothing:
// every page is behind a login and must always come from the server.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
