import type { CartItem, Order, OrderCustomer, OrderStatus } from "@/types";

/**
 * In-memory order store for the demo. In production this would be a database.
 * A module-level Map persists for the lifetime of the server process.
 *
 * A few seeded orders are added so the "Bestelstatus" page works out of the box.
 */

const orders = new Map<string, Order>();

function generateId(): string {
  return "ord_" + Math.random().toString(36).slice(2, 10);
}

function generateReference(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `KLR-${n}`;
}

export interface CreateOrderInput {
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  kluspasSavings: number;
  paymentMethod?: string;
}

export function createOrder(input: CreateOrderInput): Order {
  const id = generateId();
  const now = new Date();
  const delivery = new Date(now);
  delivery.setDate(delivery.getDate() + 1);

  const order: Order = {
    id,
    reference: generateReference(),
    customer: input.customer,
    items: input.items,
    paymentStatus: "open",
    paymentMethod: input.paymentMethod,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    kluspasSavings: input.kluspasSavings,
    createdAt: now.toISOString(),
    estimatedDelivery: delivery.toISOString(),
  };
  orders.set(id, order);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id) ?? seededOrders.find((o) => o.id === id || o.reference === id);
}

export function getOrderByReference(reference: string): Order | undefined {
  const ref = reference.trim().toUpperCase();
  for (const order of orders.values()) {
    if (order.reference.toUpperCase() === ref) return order;
  }
  return seededOrders.find((o) => o.reference.toUpperCase() === ref);
}

export function getOrderByMollieId(paymentId: string): Order | undefined {
  for (const order of orders.values()) {
    if (order.molliePaymentId === paymentId) return order;
  }
  return undefined;
}

export function setMolliePaymentId(orderId: string, molliePaymentId: string): void {
  const order = orders.get(orderId);
  if (order) order.molliePaymentId = molliePaymentId;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
  const order = orders.get(orderId);
  if (!order) return undefined;
  order.paymentStatus = status;
  return order;
}

/**
 * Claim het versturen van de bestelbevestiging. Geeft exact één keer per order
 * `true` terug (synchroon check-and-set, dus geen dubbele mails bij meerdere
 * webhook-calls). Onbekende/seeded orders leveren `false`.
 */
export function claimConfirmationEmail(orderId: string): boolean {
  const order = orders.get(orderId);
  if (!order || order.confirmationSentAt) return false;
  order.confirmationSentAt = new Date().toISOString();
  return true;
}

/** Geef de claim weer vrij (bv. na een mislukte verzending) zodat een retry mag. */
export function releaseConfirmationEmail(orderId: string): void {
  const order = orders.get(orderId);
  if (order) order.confirmationSentAt = undefined;
}

export function markChannable(
  orderId: string,
  status: NonNullable<Order["channableStatus"]>,
  channableOrderId?: string,
): void {
  const order = orders.get(orderId);
  if (!order) return;
  order.channableStatus = status;
  if (channableOrderId) order.channableOrderId = channableOrderId;
}

/** Alle orders (in-memory + seeded), nieuwste eerst — voor het admin-overzicht. */
export function listOrders(): Order[] {
  const live = [...orders.values()];
  const liveIds = new Set(live.map((o) => o.id));
  return [...live, ...seededOrders.filter((o) => !liveIds.has(o.id))].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

/** Markeer een order als verzonden en bewaar de PostNL-verzendgegevens. */
export function setShipped(
  orderId: string,
  shipment: NonNullable<Order["shipment"]>,
): Order | undefined {
  const order = orders.get(orderId) ?? seededOrders.find((o) => o.id === orderId);
  if (!order) return undefined;
  order.shipment = shipment;
  if (order.paymentStatus === "paid" || order.paymentStatus === "authorized") {
    order.paymentStatus = "shipped";
  }
  return order;
}

/** Seeded example orders for the bestelstatus lookup page. */
export const seededOrders: Order[] = [
  {
    id: "ord_demo123",
    reference: "KLR-204815",
    customer: {
      email: "klant@voorbeeld.nl",
      firstName: "Demo",
      lastName: "Klant",
      street: "Grotestraat 1",
      postalCode: "7443 BR",
      city: "Nijverdal",
    },
    items: [],
    paymentStatus: "shipped",
    paymentMethod: "ideal",
    subtotal: 95.4,
    shipping: 0,
    total: 95.4,
    kluspasSavings: 15,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
  },
];
