import { NextResponse } from "next/server";
// `after()` om werk ná de respons door te laten lopen. De geïnstalleerde Next
// 14.2.x exporteert `after`/`unstable_after` NIET, dus gebruiken we een
// versie-veilige helper: hij benut after() als die bestaat (Next 15) en valt
// anders terug op inline afronden binnen de invocatie (veilig op serverless).
import { runDeferred } from "@/lib/runtime/after";
import { getAdminSession } from "@/auth";
import { products } from "@/lib/data";
import { generateProductContent, type ContentType } from "@/lib/ai/content";
import { getProductContent, saveProductContent } from "@/lib/store/product-content";
import {
  acquireLock,
  releaseLock,
  isEnabled,
  readCursor,
  writeCursor,
  getProgress,
  updateProgress,
  stop,
  DEFAULT_JOB_TYPES,
} from "@/lib/store/content-job";

/**
 * Self-chaining achtergrond-worker die de hele catalogus van AI-content voorziet
 * ZONDER dat de admin de browser open hoeft te houden.
 *
 * Werking: elke invocatie verwerkt één TIME-BOXED batch en triggert daarna de
 * volgende schakel via een `fetch` naar zichzelf (geautoriseerd met CRON_SECRET).
 * Zo wordt de doorvoer bepaald door de self-chain — NIET door de cron-frequentie
 * — en werkt het dus op élk Vercel-plan (ook Hobby, waar crons alleen dagelijks
 * mogen draaien). De dagelijkse cron in vercel.json is enkel een vangnet om een
 * onderbroken run te hervatten.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 60s is geldig op zowel Hobby als Pro. We stoppen elke batch ruim binnen deze
// limiet (zie TIME_BUDGET_MS) en hervatten via de self-chain.
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;

/** Wall-clock budget per batch; ruim onder maxDuration zodat we netjes afronden. */
const TIME_BUDGET_MS = 45_000;
/** Kleine parallelliteit per product-batch. */
const CONCURRENCY = 3;

const SELF_PATH = "/api/cron/generate-content";

/* ------------------------------------------------------------------------ auth */

/**
 * Toegestaan als: Authorization === `Bearer ${CRON_SECRET}` (Vercel Cron + de
 * self-trigger sturen dit), OF een ingelogde admin (handmatige start/trigger).
 * Wanneer CRON_SECRET niet is gezet, spiegelen we de bestaande cron-routes: de
 * bearer-check vervalt en alleen de admin-sessie (of open, net als de andere
 * crons) bepaalt toegang.
 */
async function isAuthorized(req: Request): Promise<boolean> {
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth === `Bearer ${CRON_SECRET}`) return true;
  }
  // Admin-sessie mag ook (handmatige trigger vanuit de admin-UI).
  if (await getAdminSession()) return true;
  // Geen CRON_SECRET gezet → mirror de andere crons (die dan open staan).
  return !CRON_SECRET;
}

/* --------------------------------------------------------------------- helpers */

/** Bepaal de absolute basis-URL van deze app om naar onszelf te kunnen fetchen. */
function selfBaseUrl(): string | null {
  // Voorkeur: de canonieke site-URL die ook e-mails/canonical gebruiken.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/\/$/, "");
  // Vercel zet VERCEL_URL (zonder protocol) op elke deployment.
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return null;
}

/** Trigger de volgende schakel zonder op de body te wachten (fire-and-forget). */
function triggerNext(): void {
  const base = selfBaseUrl();
  if (!base) {
    console.warn(
      "[cron/generate-content] geen NEXT_PUBLIC_SITE_URL of VERCEL_URL — " +
        "self-chain niet mogelijk; dagelijkse cron hervat de run.",
    );
    return;
  }
  if (!CRON_SECRET) {
    console.warn(
      "[cron/generate-content] geen CRON_SECRET — self-trigger overgeslagen; " +
        "dagelijkse cron hervat de run.",
    );
    return;
  }
  const url = `${base}${SELF_PATH}`;
  // Bewust niet awaiten: we willen dat de huidige invocatie snel afrondt.
  fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
    cache: "no-store",
  }).catch((err) => {
    console.error("[cron/generate-content] self-trigger mislukt", err);
  });
}

/** Verwerk in kleine parallelle groepjes om geheugen/doorvoer in balans te houden. */
async function mapWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

/* ------------------------------------------------------------------ batch werk */

/**
 * Verwerk één time-boxed batch vanaf de cursor. Retourneert of er nog werk over
 * is (zodat de aanroeper de volgende schakel kan triggeren).
 */
async function runBatch(startedAt: number, runId: string): Promise<{ moreWork: boolean }> {
  const progress = await getProgress();
  const types: ContentType[] =
    progress.types && progress.types.length ? progress.types : DEFAULT_JOB_TYPES;

  const total = products.length;
  let cursor = await readCursor();
  let generated = progress.generated;
  let failed = progress.failed;

  while (cursor < total) {
    // Stop netjes als de tijd op is of de admin de job heeft gestopt.
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
    if (!(await isEnabled())) {
      return { moreWork: false };
    }

    const product = products[cursor];

    // Bepaal de ontbrekende types voor dit product (only-missing).
    const existing = (await getProductContent(product.id)) ?? {};
    const missing = types.filter((t) => {
      const entry = existing[t];
      return !entry || !entry.content || !entry.content.trim();
    });

    if (missing.length) {
      // Per type een eigen try/catch: één fout stopt de batch nooit.
      await mapWithConcurrency(missing, CONCURRENCY, async (type) => {
        try {
          const { text } = await generateProductContent(product, type);
          if (text && text.trim()) {
            await saveProductContent(product.id, type, text);
            generated++;
          } else {
            failed++;
          }
        } catch (err) {
          failed++;
          console.error(
            `[cron/generate-content] mislukt product=${product.id} type=${type}`,
            err,
          );
        }
      });
    }

    // Cursor pas ná dit product opschuiven (idempotent hervatten).
    cursor++;
    await writeCursor(cursor);

    // Voortgang periodiek wegschrijven (elke ~5 producten of aan het eind).
    if (cursor % 5 === 0 || cursor >= total) {
      await updateProgress({ done: cursor, generated, failed, status: "running" });
    }
  }

  // Slotstand van deze batch wegschrijven.
  await updateProgress({ done: Math.min(cursor, total), generated, failed });

  const moreWork = cursor < total;
  if (!moreWork) {
    // Klaar: zet enabled uit zodat een volgende cron niet opnieuw begint, reset
    // de cursor, en markeer de voortgang als "done".
    await stop();
    await updateProgress({ status: "done", done: total });
    await writeCursor(0);
  }
  console.info(
    `[cron/generate-content] batch klaar run=${runId} cursor=${cursor}/${total} ` +
      `generated=${generated} failed=${failed} moreWork=${moreWork}`,
  );
  return { moreWork };
}

/* ------------------------------------------------------------------- handlers */

async function handle(req: Request): Promise<NextResponse> {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Job niet gestart → niets te doen.
  if (!(await isEnabled())) {
    return NextResponse.json({ ok: true, status: "idle" });
  }

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Eén schakel tegelijk: claim de lock (TTL > maxDuration zodat hij vanzelf
  // vrijkomt mocht een invocatie hardhandig worden afgebroken).
  const locked = await acquireLock(runId, 90);
  if (!locked) {
    return NextResponse.json({ ok: true, status: "busy" });
  }

  const startedAt = Date.now();

  // Het echte werk draait (waar mogelijk) NA de respons door, zodat de
  // triggerende fetch snel terugkeert. Op runtimes zonder after() ronden we de
  // batch binnen deze invocatie af — voor de fire-and-forget triggerende link is
  // dat onzichtbaar. De lock blijft vastgehouden tot het werk klaar is.
  await runDeferred(async () => {
    try {
      const { moreWork } = await runBatch(startedAt, runId);
      // Volgende schakel alleen triggeren als er werk is én de job nog aan staat.
      if (moreWork && (await isEnabled())) {
        triggerNext();
      }
    } catch (err) {
      console.error("[cron/generate-content] batch-fout", err);
    } finally {
      await releaseLock();
    }
  });

  return NextResponse.json({ ok: true, status: "working", runId }, { status: 202 });
}

// GET: Vercel Cron (dagelijks vangnet). POST: admin-start + self-trigger.
export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
