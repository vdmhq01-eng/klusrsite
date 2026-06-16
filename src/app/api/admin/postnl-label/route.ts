import { NextResponse } from "next/server";
import { getOrder, setShipped } from "@/lib/store/orders";
import { createLabel, isPostNLConfigured } from "@/lib/postnl";
import { pushShipment } from "@/lib/channable";

export const runtime = "nodejs";

/** Admin: maak een PostNL-verzendlabel voor een order. */
export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
    const order = orderId ? await getOrder(orderId) : undefined;
    if (!order) {
      return NextResponse.json(
        { ok: false, configured: isPostNLConfigured(), status: 404, message: "Order niet gevonden." },
        { status: 404 },
      );
    }

    const result = await createLabel(order);

    // Bij succes de order als verzonden markeren + verzendgegevens bewaren.
    if (result.ok && result.barcode) {
      await setShipped(order.id, {
        carrier: "postnl",
        barcode: result.barcode,
        trackTrace: result.trackTrace,
        labelCreatedAt: new Date().toISOString(),
      });

      // Marketplace-order? Koppel de PostNL-tracking terug aan Channable, die
      // de verzending doorzet naar de betreffende marketplace. (Demo-safe.)
      if (order.channableOrderId) {
        void pushShipment(order.channableOrderId, {
          trackingCode: result.barcode,
          transporter: "POSTNL",
        }).catch(() => {});
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/admin/postnl-label]", err);
    return NextResponse.json(
      { ok: false, configured: false, status: 500, message: "Er ging iets mis bij het aanmaken van het label." },
      { status: 500 },
    );
  }
}
