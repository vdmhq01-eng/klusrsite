"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { AiAssistantWidget } from "@/components/ai/ai-assistant-widget";
import { ExitIntentPopup } from "@/components/marketing/exit-intent-popup";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsPageView } from "@/components/analytics/gtm";

/**
 * Client-only overlays mounted once at the app root: cart drawer, AI assistant,
 * exit-intent popup, toasts and SPA page-view tracking.
 */
export function GlobalOverlays() {
  return (
    <>
      <CartDrawer />
      <AiAssistantWidget />
      <ExitIntentPopup />
      <Toaster />
      <AnalyticsPageView />
    </>
  );
}
