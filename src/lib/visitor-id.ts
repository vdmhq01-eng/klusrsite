"use client";

/** Stabiele, anonieme bezoeker-id (localStorage) voor bezoekers-/live-statistiek. */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem("klusr-vid");
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem("klusr-vid", id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Stuur (best-effort) een tracking-event naar onze server-analytics. */
export function trackVisit(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, visitorId: getVisitorId() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* nooit de UI breken */
  }
}
