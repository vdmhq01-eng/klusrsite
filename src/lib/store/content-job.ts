/**
 * KV-backed state voor de achtergrond-content-generatiejob (server-side).
 *
 * De admin start/stopt de job; een self-chaining worker
 * (`/api/cron/generate-content`) verwerkt de catalogus in time-boxed batches en
 * triggert telkens de volgende schakel — onafhankelijk van of de browser open
 * staat. Een dagelijkse cron is alleen een vangnet om te hervatten.
 *
 * Keys (zie functies):
 *   content-job:enabled    "true" als de job loopt; afwezig = uit / gestopt.
 *   content-job:cursor     int-index in de productcatalogus (volgende te doen).
 *   content-job:progress   JSON-voortgang (zie JobProgress).
 *   content-job:lock       run-lock via SET EX NX (één schakel tegelijk).
 *
 * Best-effort: leunt op kv.ts dat nooit gooit. Zonder KV (demo) valt alles terug
 * op in-memory state binnen één serverinstance.
 */

import {
  isKvEnabled,
  kvDel,
  kvGetJSON,
  kvSetExNX,
  kvSetJSON,
} from "./kv";
import type { ContentType } from "@/lib/ai/content";

const ENABLED_KEY = "content-job:enabled";
const CURSOR_KEY = "content-job:cursor";
const PROGRESS_KEY = "content-job:progress";
const LOCK_KEY = "content-job:lock";

/** Standaard te genereren content-types voor de achtergrondjob. */
export const DEFAULT_JOB_TYPES: ContentType[] = ["seo", "faqs"];

export type JobStatus = "idle" | "running" | "done" | "stopped";

export interface JobProgress {
  total: number;
  done: number;
  generated: number;
  failed: number;
  startedAt: string | null;
  updatedAt: string | null;
  status: JobStatus;
  /** De gekozen content-types voor deze run. */
  types: ContentType[];
}

function emptyProgress(): JobProgress {
  return {
    total: 0,
    done: 0,
    generated: 0,
    failed: 0,
    startedAt: null,
    updatedAt: null,
    status: "idle",
    types: DEFAULT_JOB_TYPES,
  };
}

/* ---------------------------------------------------------- in-memory fallback */

let memEnabled = false;
let memCursor = 0;
let memProgress: JobProgress = emptyProgress();
let memLock: { value: string; expiresAt: number } | null = null;

/* --------------------------------------------------------------------- enabled */

export async function isEnabled(): Promise<boolean> {
  if (isKvEnabled()) {
    const v = await kvGetJSON<string>(ENABLED_KEY);
    return v === "true";
  }
  return memEnabled;
}

async function setEnabled(on: boolean): Promise<void> {
  if (isKvEnabled()) {
    if (on) await kvSetJSON(ENABLED_KEY, "true");
    else await kvDel(ENABLED_KEY);
    return;
  }
  memEnabled = on;
}

/* ---------------------------------------------------------------------- cursor */

export async function readCursor(): Promise<number> {
  if (isKvEnabled()) {
    const v = await kvGetJSON<number>(CURSOR_KEY);
    return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
  }
  return memCursor;
}

export async function writeCursor(index: number): Promise<void> {
  const safe = Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
  if (isKvEnabled()) {
    await kvSetJSON(CURSOR_KEY, safe);
    return;
  }
  memCursor = safe;
}

/* -------------------------------------------------------------------- progress */

export async function getProgress(): Promise<JobProgress> {
  if (isKvEnabled()) {
    const p = await kvGetJSON<JobProgress>(PROGRESS_KEY);
    return p ? { ...emptyProgress(), ...p } : emptyProgress();
  }
  return memProgress;
}

export async function writeProgress(progress: JobProgress): Promise<void> {
  if (isKvEnabled()) {
    await kvSetJSON(PROGRESS_KEY, progress);
    return;
  }
  memProgress = progress;
}

/** Patch de voortgang (merge) en zet updatedAt automatisch. */
export async function updateProgress(patch: Partial<JobProgress>): Promise<JobProgress> {
  const current = await getProgress();
  const next: JobProgress = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeProgress(next);
  return next;
}

/* ------------------------------------------------------------------ public API */

/** Gecombineerde status voor de admin-UI. */
export async function getStatus(): Promise<{ enabled: boolean; progress: JobProgress }> {
  const [enabled, progress] = await Promise.all([isEnabled(), getProgress()]);
  return { enabled, progress };
}

/** Start de job: zet enabled, reset cursor + voortgang met het opgegeven totaal. */
export async function start(total: number, types: ContentType[] = DEFAULT_JOB_TYPES): Promise<JobProgress> {
  const now = new Date().toISOString();
  await writeCursor(0);
  const progress: JobProgress = {
    total: Math.max(0, Math.floor(total)),
    done: 0,
    generated: 0,
    failed: 0,
    startedAt: now,
    updatedAt: now,
    status: "running",
    types: types.length ? types : DEFAULT_JOB_TYPES,
  };
  await writeProgress(progress);
  await setEnabled(true);
  return progress;
}

/** Stop de job: enabled uit en status → stopped (cursor blijft staan om te hervatten). */
export async function stop(): Promise<JobProgress> {
  await setEnabled(false);
  const current = await getProgress();
  const next: JobProgress = {
    ...current,
    status: current.status === "done" ? "done" : "stopped",
    updatedAt: new Date().toISOString(),
  };
  await writeProgress(next);
  return next;
}

/* ------------------------------------------------------------------------ lock */

/**
 * Probeer de run-lock te claimen (SET EX NX). True = geclaimd, jij mag draaien.
 * `value` identificeert de huidige run (bijv. een runId) puur ter informatie.
 */
export async function acquireLock(value: string, ttlSeconds: number): Promise<boolean> {
  if (isKvEnabled()) {
    return kvSetExNX(LOCK_KEY, value, ttlSeconds);
  }
  const now = Date.now();
  if (memLock && memLock.expiresAt > now) return false;
  memLock = { value, expiresAt: now + ttlSeconds * 1000 };
  return true;
}

/** Geef de run-lock weer vrij zodat de volgende schakel direct kan starten. */
export async function releaseLock(): Promise<void> {
  if (isKvEnabled()) {
    await kvDel(LOCK_KEY);
    return;
  }
  memLock = null;
}
