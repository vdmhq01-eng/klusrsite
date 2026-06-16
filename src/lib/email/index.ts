import type { Order } from "@/types";
import { sendEmail, isEmailConfigured, type SendEmailResult } from "./client";
import {
  orderConfirmationEmail,
  welcomeEmail,
  verificationEmail,
  magicLinkEmail,
} from "./templates";

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
