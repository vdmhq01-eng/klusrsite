import type { Order } from "@/types";
import { pushChannableOrder } from "@/lib/channable";
import {
  claimConfirmationEmail,
  markChannable,
  releaseConfirmationEmail,
} from "@/lib/store/orders";
import { sendOrderConfirmation } from "@/lib/email";

/**
 * Verwerk een betaalde order: schiet hem in Channable (die routeert naar Tilroy)
 * en houd de fulfilment-status bij. Idempotent: een al verzonden order wordt niet
 * opnieuw gepusht.
 */
export async function fulfillPaidOrder(order: Order): Promise<void> {
  if (order.channableStatus === "sent" || order.channableStatus === "demo") return;

  const result = await pushChannableOrder(order);
  if (result.demo) {
    markChannable(order.id, "demo");
  } else if (result.ok) {
    markChannable(order.id, "sent", result.channableOrderId);
  } else {
    markChannable(order.id, "failed");
  }
}

/**
 * Stuur de bestelbevestiging naar de klant — exact één keer per order. De claim
 * is synchroon, dus parallelle webhook-calls leveren geen dubbele mail op. Bij
 * een echte verzendfout geven we de claim vrij zodat een retry alsnog mag.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!claimConfirmationEmail(order.id)) return;

  const result = await sendOrderConfirmation(order);
  if (!result.ok && !result.demo) {
    releaseConfirmationEmail(order.id);
  }
}
