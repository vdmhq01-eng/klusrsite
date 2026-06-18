"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./chat-panel";
import { useUI } from "@/lib/store/ui";
import { useT } from "@/components/i18n/locale-provider";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/dictionaries";

/** sessionStorage-vlag: gezet zodra de bezoeker de teaser sluit of de chat opent. */
const TEASER_DISMISSED_KEY = "klusr_chat_teaser_dismissed";
/** Vertraging voordat de teaser verschijnt (ms). */
const TEASER_DELAY = 4000;

/**
 * Bepaalt de contextuele één-regel op basis van het pad. Houdt rekening met een
 * optionele locale-prefix (/en, /fr, /de) vóór het eigenlijke pad.
 *
 * Retourneert `null` voor paden waar de teaser NIET hoort te verschijnen
 * (checkout en de back-office), zodat we de bezoeker daar niet afleiden.
 */
function teaserKeyForPath(pathname: string): MessageKey | null {
  // Strip een eventuele locale-prefix: "/en/product/x" → "/product/x".
  const path = pathname.replace(/^\/(en|fr|de)(?=\/|$)/, "") || "/";

  if (path === "/checkout" || path.startsWith("/checkout/")) return null;
  if (path === "/admin" || path.startsWith("/admin/")) return null;

  if (path.startsWith("/product/")) return "chat.teaser.product";
  if (path.startsWith("/categorie/")) return "chat.teaser.category";
  if (path === "/winkelwagen") return "chat.teaser.cart";

  return "chat.teaser.general";
}

/**
 * Floating KLUSR AI assistant. Launcher sits above the mobile bottom nav.
 * Toont site-breed een proactieve teaser-bubbel die naar dezelfde chat trechtert.
 */
export function AiAssistantWidget() {
  const open = useUI((s) => s.aiChatOpen);
  const toggle = useUI((s) => s.toggleAiChat);
  const setOpen = useUI((s) => s.setAiChatOpen);
  const pending = useUI((s) => s.aiPendingQuestion);
  const clearPending = useUI((s) => s.clearAiPending);
  const t = useT();
  const pathname = usePathname() ?? "/";

  const [showTeaser, setShowTeaser] = useState(false);
  const teaserKey = teaserKeyForPath(pathname);

  /**
   * Markeer de teaser als afgehandeld voor de rest van de sessie. Best-effort:
   * als sessionStorage faalt verbergen we de teaser in elk geval voor deze view.
   */
  function dismissTeaserForSession() {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(TEASER_DISMISSED_KEY, "1");
    } catch {
      /* sessionStorage niet beschikbaar — niet kritiek */
    }
  }

  // Toon de teaser na een korte vertraging, mits toegestaan op dit pad, nog niet
  // afgewezen deze sessie en de chat nog niet open staat.
  useEffect(() => {
    if (!teaserKey || open) return;
    try {
      if (sessionStorage.getItem(TEASER_DISMISSED_KEY)) return;
    } catch {
      /* lezen mislukt — toon de teaser dan gewoon */
    }
    const timer = window.setTimeout(() => {
      setShowTeaser(true);
      trackEvent("ai_chat_teaser_shown", { page: pathname });
    }, TEASER_DELAY);
    return () => window.clearTimeout(timer);
  }, [teaserKey, open, pathname]);

  // Zodra de chat (op welke manier dan ook: FAB, hero-vraag of de teaser zelf)
  // opent, is de teaser klaar voor deze sessie en mag hij niet meer terugkomen.
  useEffect(() => {
    if (open) dismissTeaserForSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Escape sluit de teaser (zonder de chat te openen).
  useEffect(() => {
    if (!showTeaser) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissTeaserForSession();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTeaser]);

  function openFromTeaser() {
    trackEvent("ai_chat_teaser_clicked", { page: pathname });
    dismissTeaserForSession();
    setOpen(true);
  }

  const teaserVisible = showTeaser && !open && !!teaserKey;

  return (
    <>
      {/* Proactieve teaser — boven de FAB, trechtert naar dezelfde chat. */}
      {teaserVisible && teaserKey && (
        <div
          className={cn(
            "fixed bottom-36 right-4 z-40 w-[min(20rem,calc(100%-2rem))] lg:bottom-24 lg:right-6",
            "animate-slide-up motion-reduce:animate-none",
          )}
        >
          <div className="relative rounded-2xl border border-border bg-card p-3 pr-9 shadow-card-hover">
            {/* Klikbaar oppervlak dat de chat opent. */}
            <button
              type="button"
              onClick={openFromTeaser}
              aria-label={t("chat.teaser.openAria")}
              className="flex w-full items-start gap-2.5 text-left"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-klusr-red-dark text-white">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-snug text-foreground">
                  {t(teaserKey)}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-primary">
                  {t("chat.teaser.cta")}
                </span>
              </span>
            </button>

            {/* Sluiten — verbergt de teaser voor de rest van de sessie. */}
            <button
              type="button"
              onClick={dismissTeaserForSession}
              aria-label={t("chat.teaser.dismissAria")}
              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={toggle}
        aria-label="KLUSR Klushulp openen"
        className={cn(
          "fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-card-hover transition-transform hover:scale-105 lg:bottom-6 lg:right-6",
          open && "scale-0 opacity-0",
        )}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-klusr-action opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-klusr-action" />
        </span>
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card-hover transition-all lg:bottom-6 lg:right-6",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-90 opacity-0",
        )}
        style={{ height: "min(560px, 75vh)" }}
      >
        {/* Header — red gradient like the visual */}
        <div className="flex items-center justify-between bg-gradient-to-br from-primary to-klusr-red-dark px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">KLUSR Klushulp</p>
              <p className="text-[11px] text-white/70">Advies van ex-schilders, 24/7</p>
            </div>
          </div>
          <button onClick={toggle} aria-label="Sluiten" className="rounded-md p-1 hover:bg-white/15">
            <X className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <ChatPanel
            className="flex-1"
            autoSendMessage={pending}
            onAutoSent={clearPending}
          />
        )}
      </div>
    </>
  );
}
