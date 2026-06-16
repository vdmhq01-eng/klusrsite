import type { Order } from "@/types";
import { sendEmail, isEmailConfigured, type SendEmailResult } from "./client";
import {
  orderConfirmationEmail,
  welcomeEmail,
  verificationEmail,
  magicLinkEmail,
  abandonedCartEmail,
  supportConfirmationEmail,
  supportReplyEmail,
} from "./templates";

/** Verstuur een "winkelwagen-vergeten" herinnering. */
export async function sendAbandonedCart(input: {
  email: string;
  name?: string;
  items: { title: string; quantity: number; price: number }[];
  total: number;
}): Promise<SendEmailResult> {
  const { subject, html, text } = abandonedCartEmail({
    name: input.name,
    items: input.items,
    total: input.total,
  });
  return sendEmail({ to: input.email, subject, html, text });
}

export { isEmailConfigured };
export type { SendEmailResult };

/** Verstuur een e-mailbevestigingslink na registratie. */
export async function sendVerificationEmail(input: {
  email: string;
  name?: string;
  url: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = verificationEmail(input.name ?? "", input.url);
  return sendEmail({ to: input.email, subject, html, text });
}

/** Verstuur een magic-link inlogmail. */
export async function sendMagicLink(input: {
  email: string;
  name?: string;
  url: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = magicLinkEmail(input.name ?? "", input.url);
  return sendEmail({ to: input.email, subject, html, text });
}

/** Verstuur de bestelbevestiging naar de klant. */
export async function sendOrderConfirmation(order: Order): Promise<SendEmailResult> {
  const { subject, html, text } = orderConfirmationEmail(order);
  return sendEmail({ to: order.customer.email, subject, html, text });
}

/** Verstuur een welkomstmail na nieuwsbrief-inschrijving. */
export async function sendWelcomeEmail(input: {
  email: string;
  firstName?: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = welcomeEmail({ firstName: input.firstName });
  return sendEmail({ to: input.email, subject, html, text });
}

/** Bevestig de ontvangst van een klantenservicevraag. */
export async function sendSupportConfirmation(input: {
  email: string;
  name?: string;
  reference: string;
  subject: string;
  body: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = supportConfirmationEmail(
    input.name ?? "",
    input.reference,
    input.subject,
    input.body,
  );
  return sendEmail({ to: input.email, subject, html, text });
}

/** Verstuur het antwoord van de klantenservice op een ticket. */
export async function sendSupportReply(input: {
  email: string;
  name?: string;
  reference: string;
  body: string;
}): Promise<SendEmailResult> {
  const { subject, html, text } = supportReplyEmail(input.name ?? "", input.reference, input.body);
  return sendEmail({ to: input.email, subject, html, text });
}
