/**
 * KLUSR Beheer — service worker voor de installeerbare admin-PWA en Web Push.
 *
 * Bewust minimaal: we cachen NIETS van de webshop of het beheer (geen offline
 * app-shell), zodat de admin altijd verse data ziet. De fetch-handler is een
 * no-op die het netwerk gewoon zijn werk laat doen; hij bestaat enkel omdat de
 * aanwezigheid van een fetch-handler de installeerbaarheid (PWA-criteria) helpt.
 *
 * De push-handler toont de melding; notificationclick focust een bestaand
 * beheer-tabblad of opent /admin.
 */

self.addEventListener("install", () => {
  // Meteen activeren, niet wachten op het sluiten van oude tabs.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // De nieuwe SW direct de controle over alle clients geven.
  event.waitUntil(self.clients.claim());
});

// No-op fetch-handler: niets cachen/onderscheppen — laat het netwerk het doen.
self.addEventListener("fetch", () => {
  return;
});

self.addEventListener("push", (event) => {
  let title = "KLUSR Beheer";
  let body = "Er is een nieuwe melding.";
  let url = "/admin";

  if (event && event.data) {
    try {
      const payload = event.data.json();
      if (payload && typeof payload === "object") {
        if (typeof payload.title === "string" && payload.title) title = payload.title;
        if (typeof payload.body === "string" && payload.body) body = payload.body;
        if (typeof payload.url === "string" && payload.url) url = payload.url;
      }
    } catch {
      // Geen geldige JSON — gebruik de tekst als body, anders de fallback.
      try {
        const text = event.data.text();
        if (text) body = text;
      } catch {
        /* houd de fallback aan */
      }
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/admin";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus een al geopend beheer-tabblad als dat er is.
        for (const client of clientList) {
          try {
            const path = new URL(client.url).pathname;
            if (path.startsWith("/admin") && "focus" in client) {
              return client.focus();
            }
          } catch {
            /* negeer onleesbare client-url's */
          }
        }
        // Anders: open een nieuw venster op de doel-URL.
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      }),
  );
});
