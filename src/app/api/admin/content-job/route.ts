import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { products } from "@/lib/data";
import {
  getStatus,
  start,
  stop,
  DEFAULT_JOB_TYPES,
} from "@/lib/store/content-job";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-bediening voor de achtergrond-content-generatiejob.
 *
 * GET  → huidige status `{ enabled, progress }` (voor de poll in de admin-UI).
 * POST → `{ action: "start" | "stop" }`. Bij "start" wordt de eerste
 *        worker-schakel gekickt; de rest loopt via de self-chain door, ook als
 *        de browser dichtgaat.
 */

const CRON_SECRET = process.env.CRON_SECRET;
const SELF_PATH = "/api/cron/generate-content";

/** Basis-URL om de worker te kunnen kicken (zelfde logica als de worker zelf). */
function workerBaseUrl(): string | null {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return null;
}

/** Kick de eerste worker-schakel (fire-and-forget, niet awaiten). */
function kickWorker(): void {
  const base = workerBaseUrl();
  if (!base) {
    console.warn(
      "[admin/content-job] geen NEXT_PUBLIC_SITE_URL of VERCEL_URL — " +
        "worker niet gekickt; de dagelijkse cron start de run alsnog.",
    );
    return;
  }
  const headers: Record<string, string> = {};
  if (CRON_SECRET) headers.Authorization = `Bearer ${CRON_SECRET}`;
  fetch(`${base}${SELF_PATH}`, {
    method: "POST",
    headers,
    cache: "no-store",
  }).catch((err) => {
    console.error("[admin/content-job] worker kicken mislukt", err);
  });
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { enabled, progress } = await getStatus();
  return NextResponse.json({ enabled, progress });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { action?: string };
  try {
    body = (await req.json()) as { action?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const action = body.action;

  if (action === "start") {
    const progress = await start(products.length, DEFAULT_JOB_TYPES);
    // Eerste schakel kicken; daarna draait de self-chain door (browser mag dicht).
    kickWorker();
    return NextResponse.json({ ok: true, enabled: true, progress });
  }

  if (action === "stop") {
    const progress = await stop();
    return NextResponse.json({ ok: true, enabled: false, progress });
  }

  return NextResponse.json(
    { ok: false, error: "invalid-action", hint: "Gebruik action: 'start' of 'stop'." },
    { status: 400 },
  );
}
