import type { Order } from "@/types";
import { pushChannableOrder } from "@/lib/channable";
import { markChannable } from "@/lib/store/orders";

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
