"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Download, Send, Smartphone } from "lucide-react";

/**
 * KLUSR Beheer — PWA- en meldingsbediening (client). Mount in het beheer.
 *
 * - Registreert bij mount de service worker (`/sw.js`) als de browser dat kan.
 * - "Installeer app": vangt het `beforeinstallprompt`-event en toont een knop
 *   om de PWA te installeren; op iOS (geen event) tonen we een korte hint.
 * - "Meldingen aanzetten": vraagt toestemming, abonneert via de Push API met de
 *   publieke VAPID-sleutel van de server en stuurt het abonnement naar
 *   `/api/push/subscribe`.
 * - "Stuur testmelding": POST `/api/push/test` om te verifiëren.
 *
 * Alles is best-effort: faalt iets, dan tonen we een nette NL-status en breekt
 * het beheer niet.
 */

// Minimale typing voor het (nog niet overal getypeerde) beforeinstallprompt-event.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type NotifyState =
  | "checking" // bezig met initialiseren
  | "unsupported" // browser ondersteunt geen push
  | "needs-config" // server heeft (nog) geen VAPID-sleutel
  | "off" // ondersteund, nog niet aan
  | "denied" // gebruiker heeft toestemming geweigerd
  | "on"; // geabonneerd

/** Zet een base64url VAPID-sleutel om naar de bytes die de Push API wil. We
 * geven de onderliggende ArrayBuffer terug — dat is een geldige `BufferSource`
 * voor `applicationServerKey`, ongeacht de TS-libversie. */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export function AdminAppControls() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const [notify, setNotify] = useState<NotifyState>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Service worker registreren + begintoestand van meldingen bepalen.
  useEffect(() => {
    let active = true;

    // iOS-detectie (geen beforeinstallprompt; installeren via deelmenu).
    const ua = window.navigator.userAgent || "";
    const iOS =
      /iphone|ipad|ipod/i.test(ua) ||
      // iPadOS meldt zich als Mac met touch.
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (active) setIsIOS(iOS);

    // Al als geïnstalleerde app geopend?
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone && active) setInstalled(true);

    if (!("serviceWorker" in navigator)) {
      if (active) setNotify("unsupported");
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("[admin-pwa] SW-registratie mislukt", err);
    });

    const supportsPush = "PushManager" in window && "Notification" in window;
    if (!supportsPush) {
      if (active) setNotify("unsupported");
      return;
    }

    // Bestaand abonnement? Dan staat het aan.
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (!active) return;
        if (Notification.permission === "denied") setNotify("denied");
        else if (sub) setNotify("on");
        else setNotify("off");
      })
      .catch(() => {
        if (active) setNotify("off");
      });

    return () => {
      active = false;
    };
  }, []);

  // beforeinstallprompt opvangen + 'app geïnstalleerd' bijhouden.
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setInstallEvent(null);
    } catch (err) {
      console.error("[admin-pwa] installeren mislukt", err);
    }
  }, [installEvent]);

  const enableNotifications = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      // 1) Publieke sleutel ophalen — leeg = server niet geconfigureerd.
      const keyRes = await fetch("/api/push/public-key", { cache: "no-store" });
      const keyData = (await keyRes.json().catch(() => null)) as { key?: string } | null;
      const publicKey = keyData?.key ?? "";
      if (!publicKey) {
        setNotify("needs-config");
        setMessage("Meldingen vereisen serverconfiguratie (VAPID-sleutels).");
        return;
      }

      // 2) Toestemming vragen.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotify(permission === "denied" ? "denied" : "off");
        setMessage(
          permission === "denied"
            ? "Meldingen zijn geblokkeerd. Sta ze toe in je browserinstellingen."
            : "Meldingen niet toegestaan.",
        );
        return;
      }

      // 3) Abonneren via de service worker.
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4) Abonnement naar de server sturen.
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) {
        setMessage("Opslaan van het abonnement mislukte. Probeer het opnieuw.");
        return;
      }

      setNotify("on");
      setMessage("Meldingen staan aan op dit apparaat.");
    } catch (err) {
      console.error("[admin-pwa] meldingen aanzetten mislukt", err);
      setMessage("Meldingen aanzetten mislukte. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; reason?: string }
        | null;
      if (data?.ok) {
        setMessage("Testmelding verstuurd. Check je meldingen.");
      } else if (data?.reason === "push-uitgeschakeld") {
        setNotify("needs-config");
        setMessage("Push is op de server uitgeschakeld (geen VAPID-sleutels).");
      } else {
        setMessage("Versturen van de testmelding mislukte.");
      }
    } catch {
      setMessage("Versturen van de testmelding mislukte.");
    } finally {
      setBusy(false);
    }
  }, []);

  const showInstallButton = !installed && !!installEvent;
  const showIOSHint = !installed && !installEvent && isIOS;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* Installeer-app */}
        {showInstallButton && (
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 rounded-lg bg-klusr-black px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-klusr-black/90"
          >
            <Download className="h-4 w-4" />
            Installeer app
          </button>
        )}

        {/* Meldingen aan / status */}
        {notify === "on" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-klusr-stock/10 px-3 py-1.5 text-sm font-semibold text-klusr-stock">
            <Bell className="h-4 w-4" />
            Meldingen aan
          </span>
        ) : notify === "unsupported" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            <BellOff className="h-4 w-4" />
            Meldingen niet ondersteund
          </span>
        ) : notify === "needs-config" ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            <BellOff className="h-4 w-4" />
            Serverconfiguratie nodig
          </span>
        ) : (
          <button
            type="button"
            onClick={enableNotifications}
            disabled={busy || notify === "checking"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bell className="h-4 w-4" />
            Meldingen aanzetten
          </button>
        )}

        {/* Testmelding (alleen zinvol als meldingen aan staan) */}
        {notify === "on" && (
          <button
            type="button"
            onClick={sendTest}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Stuur testmelding
          </button>
        )}
      </div>

      {/* iOS-hint: installeren via het deelmenu. */}
      {showIOSHint && (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          Tik op &quot;Deel&quot; en kies &quot;Zet op beginscherm&quot; om de app te installeren.
        </p>
      )}

      {/* Statusmelding (denied/needs-config/feedback). */}
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
