"use client";

import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "./chat-panel";
import { useUI } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

/**
 * Floating KLUSR AI assistant. Launcher sits above the mobile bottom nav.
 */
export function AiAssistantWidget() {
  const open = useUI((s) => s.aiChatOpen);
  const toggle = useUI((s) => s.toggleAiChat);
  const pending = useUI((s) => s.aiPendingQuestion);
  const clearPending = useUI((s) => s.clearAiPending);

  return (
    <>
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
