/**
 * Central Google Tag Manager / dataLayer tracking helper.
 *
 * Usage:  trackEvent("add_to_cart", { value: 24.95, items: [...] })
 *
 * All events are pushed to window.dataLayer. When GTM is not configured the
 * calls are safely no-ops (and logged in development for debugging).
 */

export type TrackEventName =
  | "page_view"
  | "view_item"
  | "view_item_list"
  | "select_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_shipping_info"
  | "add_payment_info"
  | "purchase"
  | "search"
  | "sign_up"
  | "newsletter_signup"
  | "klusadvies_started"
  | "klusadvies_completed"
  | "color_picker_opened"
  | "color_selected"
  | "kleurenkiezer_klus"
  | "ai_chat_started"
  | "ai_product_suggestion_clicked"
  | "save_for_later"
  | "exit_intent_shown";

export interface TrackPayload {
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Push an event to the GTM dataLayer.
 * GA4 ecommerce expects an `ecommerce` object — we clear it first per Google's
 * recommendation to avoid pollution between events.
 */
export function trackEvent(eventName: TrackEventName, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  const isEcommerce =
    "items" in payload || "value" in payload || "transaction_id" in payload;

  if (isEcommerce) {
    // Clear the previous ecommerce object first (GA4 best practice).
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: eventName,
      ecommerce: { currency: "EUR", ...payload },
    });
  } else {
    window.dataLayer.push({ event: eventName, ...payload });
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[trackEvent]", eventName, payload);
  }
}

/** Build a GA4-style item object from a product-ish shape. */
export function toAnalyticsItem(p: {
  id: string;
  title: string;
  brand: string;
  category?: string;
  price: number;
  quantity?: number;
}) {
  return {
    item_id: p.id,
    item_name: p.title,
    item_brand: p.brand,
    item_category: p.category,
    price: p.price,
    quantity: p.quantity ?? 1,
  };
}
