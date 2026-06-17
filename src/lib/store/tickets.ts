/**
 * Ticketsysteem voor de klantenservice.
 *
 * Tickets komen binnen via:
 *  - het contactformulier op /klantenservice (kanaal "form");
 *  - inkomende e-mail op klantenservice@klus-r.nl, doorgestuurd naar de
 *    inbound-webhook (kanaal "email").
 *
 * Opslag is KV-backed (elk ticket als JSON onder `ticket:{id}`, met een
 * index-lijst `tickets:index`); zonder KV valt alles terug op in-memory zodat
 * de shop in demo-modus blijft werken. Best-effort: gooit nooit.
 */

import { randomUUID } from "node:crypto";
import {
  isKvEnabled,
  kvGetJSON,
  kvSetJSON,
  kvLPush,
  kvLTrim,
  kvLRange,
} from "./kv";

export type TicketStatus = "open" | "pending" | "closed";
export type TicketChannel = "form" | "email";

export interface TicketMessage {
  id: string;
  from: "customer" | "agent";
  body: string;
  createdAt: string;
  authorName?: string;
  authorEmail?: string;
}

export interface Ticket {
  id: string;
  /** Klantvriendelijke referentie, bv. KLUSR-7F3K2A (komt in de mailsubject). */
  reference: string;
  subject: string;
  customerEmail: string;
  customerName?: string;
  channel: TicketChannel;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

const INDEX_KEY = "tickets:index";
const MAX = 500;
const ticketKey = (id: string) => `ticket:${id}`;

// In-memory fallback (demo / geen KV).
const mem = new Map<string, Ticket>();
const memOrder: string[] = [];

function genReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `KLUSR-${s}`;
}

async function persist(ticket: Ticket): Promise<void> {
  mem.set(ticket.id, ticket);
  if (isKvEnabled()) await kvSetJSON(ticketKey(ticket.id), ticket);
}

export async function createTicket(input: {
  subject: string;
  customerEmail: string;
  customerName?: string;
  body: string;
  channel: TicketChannel;
}): Promise<Ticket> {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: randomUUID(),
    reference: genReference(),
    subject: input.subject.trim() || "Vraag via klantenservice",
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerName: input.customerName?.trim() || undefined,
    channel: input.channel,
    status: "open",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: randomUUID(),
        from: "customer",
        body: input.body.trim(),
        createdAt: now,
        authorName: input.customerName?.trim() || undefined,
        authorEmail: input.customerEmail.trim().toLowerCase(),
      },
    ],
  };

  await persist(ticket);

  // Index bijwerken (nieuwste eerst, begrensd).
  memOrder.unshift(ticket.id);
  if (memOrder.length > MAX) memOrder.length = MAX;
  if (isKvEnabled()) {
    await kvLPush(INDEX_KEY, ticket.id);
    await kvLTrim(INDEX_KEY, 0, MAX - 1);
  }

  return ticket;
}

export async function getTicket(id: string): Promise<Ticket | undefined> {
  if (isKvEnabled()) {
    const t = await kvGetJSON<Ticket>(ticketKey(id));
    if (t) return t;
  }
  return mem.get(id);
}

export async function listTickets(limit = 200): Promise<Ticket[]> {
  let ids: string[];
  if (isKvEnabled()) {
    ids = await kvLRange<string>(INDEX_KEY, 0, MAX - 1);
    if (!ids.length) ids = memOrder.slice();
  } else {
    ids = memOrder.slice();
  }

  const seen = new Set<string>();
  const tickets: Ticket[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const t = await getTicket(id);
    if (t) tickets.push(t);
  }

  // Mengvorm KV/in-memory netjes op laatste activiteit sorteren.
  tickets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return tickets.slice(0, limit);
}

export async function addMessage(
  id: string,
  msg: { from: "customer" | "agent"; body: string; authorName?: string; authorEmail?: string },
): Promise<Ticket | undefined> {
  const ticket = await getTicket(id);
  if (!ticket) return undefined;
  const now = new Date().toISOString();
  ticket.messages.push({
    id: randomUUID(),
    from: msg.from,
    body: msg.body.trim(),
    createdAt: now,
    authorName: msg.authorName,
    authorEmail: msg.authorEmail,
  });
  ticket.updatedAt = now;
  // Een klantreactie heropent; een agent-reactie zet 'm op "in afwachting".
  ticket.status = msg.from === "customer" ? "open" : "pending";
  await persist(ticket);
  return ticket;
}

export async function setStatus(id: string, status: TicketStatus): Promise<Ticket | undefined> {
  const ticket = await getTicket(id);
  if (!ticket) return undefined;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  await persist(ticket);
  return ticket;
}

/** Zoek een ticket op zijn klantreferentie (voor e-mailthreading). */
export async function findByReference(reference: string): Promise<Ticket | undefined> {
  const ref = reference.trim().toUpperCase();
  const all = await listTickets(MAX);
  return all.find((t) => t.reference.toUpperCase() === ref);
}
