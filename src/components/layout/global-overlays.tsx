"use client";

import { CartDrawer } from "@/components/cart/cart-drawer";
import { AiAssistantWidget } from "@/components/ai/ai-assistant-widget";
import { CompareBar } from "@/components/product/compare-bar";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsPageView } from "@/components/analytics/gtm";

/**
 * Client-only overlays mounted once at the app root: cart drawer, AI assistant,
 * vergelijkbalk, toasts and SPA page-view tracking.
 */
export function GlobalOverlays() {
  return (
    <>
      <CartDrawer />
      <AiAssistantWidget />
      <CompareBar />
      <Toaster />
      <AnalyticsPageView />
    </>
  );
}
