import type { Order } from "@/types";

/**
 * PostNL Send API — verzendlabel aanmaken.
 *
 * Degradeert naar demo (geen echte call) zonder credentials en gooit nooit,
 * zodat de admin-UI altijd een gestructureerd resultaat krijgt.
 *
 * Activeren: POSTNL_API_KEY + POSTNL_CUSTOMER_CODE + POSTNL_CUSTOMER_NUMBER
 * (optioneel POSTNL_COLLECTION_LOCATION, POSTNL_SENDER_NAME, en POSTNL_API_BASE
 * voor de sandbox: https://api-sandbox.postnl.nl).
 */

const API_KEY = process.env.POSTNL_API_KEY;
const CUSTOMER_CODE = process.env.POSTNL_CUSTOMER_CODE;
const CUSTOMER_NUMBER = process.env.POSTNL_CUSTOMER_NUMBER;
const COLLECTION_LOCATION = process.env.POSTNL_COLLECTION_LOCATION || "000000";
const SENDER_NAME = process.env.POSTNL_SENDER_NAME || "KLUSR B.V.";
const API_BASE = (process.env.POSTNL_API_BASE || "https://api.postnl.nl").replace(/\/$/, "");

export function isPostNLConfigured(): boolean {
  return Boolean(API_KEY && CUSTOMER_CODE && CUSTOMER_NUMBER);
}

export interface LabelResult {
  ok: boolean;
  configured: boolean;
  demo?: boolean;
  status: number;
  message: string;
  barcode?: string;
  trackTrace?: string;
  /** Base64-PDF van het label (indien beschikbaar). */
  labelBase64?: string;
  response?: unknown;
}

function splitStreet(street = ""): { street: string; houseNr: string; houseNrExt?: string } {
  const m = street.trim().match(/^(.*?)\s+(\d+)\s*([a-zA-Z][\w-]*)?$/);
  if (!m) return { street: street.trim(), houseNr: "" };
  return { street: m[1].trim(), houseNr: m[2], houseNrExt: m[3]?.trim() || undefined };
}

function trackTraceUrl(barcode: string, postalCode: string): string {
  const zip = postalCode.replace(/\s/g, "").toUpperCase();
  return `https://postnl.nl/tracktrace/?B=${encodeURIComponent(barcode)}&P=${encodeURIComponent(zip)}&D=NL&T=C`;
}

function nowStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function generateBarcode(): Promise<string | null> {
  try {
    const url =
      `${API_BASE}/shipment/v1_1/barcode?CustomerCode=${encodeURIComponent(CUSTOMER_CODE!)}` +
      `&CustomerNumber=${encodeURIComponent(CUSTOMER_NUMBER!)}&Type=3S`;
    const res = await fetch(url, {
      headers: { apikey: API_KEY!, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as { Barcode?: string };
    return data?.Barcode ?? null;
  } catch {
    return null;
  }
}

export async function createLabel(order: Order): Promise<LabelResult> {
  const c = order.customer;

  if (!isPostNLConfigured()) {
    const demoBarcode = `3SDEMO${order.reference.replace(/\D/g, "")}`;
    return {
      ok: true,
      configured: false,
      demo: true,
      status: 0,
      barcode: demoBarcode,
      trackTrace: trackTraceUrl(demoBarcode, c.postalCode),
      message: "PostNL niet geconfigureerd — demo-label aangemaakt (geen echte verzending).",
    };
  }

  try {
    const barcode = (await generateBarcode()) || `3S${CUSTOMER_CODE}${Date.now()}`;
    const { street, houseNr, houseNrExt } = splitStreet(c.street);

    const body = {
      Customer: {
        CustomerCode: CUSTOMER_CODE,
        CustomerNumber: CUSTOMER_NUMBER,
        CollectionLocation: COLLECTION_LOCATION,
        ContactPerson: SENDER_NAME,
        Name: SENDER_NAME,
      },
      Message: {
        MessageID: order.reference,
        MessageTimeStamp: nowStamp(),
        Printertype: "GraphicFile|PDF",
      },
      Shipments: [
        {
          Addresses: [
            {
              AddressType: "01",
              FirstName: c.firstName,
              Name: c.lastName,
              Street: street,
              HouseNr: houseNr,
              ...(houseNrExt ? { HouseNrExt: houseNrExt } : {}),
              Zipcode: c.postalCode.replace(/\s/g, "").toUpperCase(),
              City: c.city,
              Countrycode: "NL",
            },
          ],
          Barcode: barcode,
          Dimension: { Weight: "2000" },
          ProductCodeDelivery: "3085",
          Reference: order.reference,
        },
      ],
    };

    const res = await fetch(`${API_BASE}/shipment/v2_2/label?confirm=true`, {
      method: "POST",
      headers: { apikey: API_KEY!, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ResponseShipments?: { Barcode?: string; Labels?: { Content?: string }[] }[];
    };

    if (!res.ok) {
      return {
        ok: false,
        configured: true,
        status: res.status,
        message: `PostNL gaf een fout (HTTP ${res.status}). Controleer de credentials en het adres.`,
        response: data,
      };
    }

    const shp = data?.ResponseShipments?.[0];
    const finalBarcode = shp?.Barcode || barcode;
    return {
      ok: true,
      configured: true,
      status: res.status,
      barcode: finalBarcode,
      trackTrace: trackTraceUrl(finalBarcode, c.postalCode),
      labelBase64: shp?.Labels?.[0]?.Content,
      message: `Verzendlabel aangemaakt (barcode ${finalBarcode}).`,
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      status: 0,
      message: "Aanmaken van het PostNL-label is mislukt (netwerk/timeout).",
      response: String(err),
    };
  }
}
