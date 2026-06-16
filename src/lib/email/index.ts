import type { Order } from "@/types";
import { sendEmail, isEmailConfigured, type SendEmailResult } from "./client";
import { orderConfirmationEmail, welcomeEmail } from "./templates";

export { isEmailConfigured };
export type { SendEmailResult };

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
