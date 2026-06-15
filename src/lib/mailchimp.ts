import crypto from "crypto";
import mailchimp from "@mailchimp/mailchimp_marketing";

/**
 * Mailchimp marketing helper. Degrades to a no-op (demo mode) when env vars
 * are missing so newsletter/abandoned-cart flows never break the UX.
 */

const API_KEY = process.env.MAILCHIMP_API_KEY;
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

let configured = false;

export function isMailchimpConfigured(): boolean {
  return Boolean(API_KEY && SERVER_PREFIX && AUDIENCE_ID);
}

function ensure() {
  if (!isMailchimpConfigured()) return false;
  if (!configured) {
    mailchimp.setConfig({ apiKey: API_KEY!, server: SERVER_PREFIX! });
    configured = true;
  }
  return true;
}

function subscriberHash(email: string): string {
  return crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
}

export interface SubscribeInput {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  source?: string;
}

/**
 * Upsert a contact and (optionally) tag them. Returns a result describing
 * whether a live call was made.
 */
export async function subscribe({
  email,
  firstName,
  lastName,
  tags = [],
  source,
}: SubscribeInput): Promise<{ ok: boolean; demo: boolean }> {
  if (!ensure()) {
    // Demo mode — pretend success so the UI flow is testable.
    console.info("[mailchimp] demo mode — would subscribe", { email, tags, source });
    return { ok: true, demo: true };
  }

  try {
    const hash = subscriberHash(email);
    await mailchimp.lists.setListMember(AUDIENCE_ID!, hash, {
      email_address: email,
      status_if_new: "subscribed",
      merge_fields: {
        ...(firstName ? { FNAME: firstName } : {}),
        ...(lastName ? { LNAME: lastName } : {}),
        ...(source ? { SOURCE: source } : {}),
      },
    });

    if (tags.length) {
      await mailchimp.lists.updateListMemberTags(AUDIENCE_ID!, hash, {
        tags: tags.map((name) => ({ name, status: "active" })),
      });
    }
    return { ok: true, demo: false };
  } catch (err) {
    console.error("[mailchimp] subscribe failed", err);
    return { ok: false, demo: false };
  }
}

/**
 * Trigger an abandoned-cart / follow-up event. In a real setup this maps to a
 * Mailchimp customer journey or event; here it's a tagged upsert in demo mode.
 */
export async function triggerCartReminder(email: string): Promise<void> {
  await subscribe({ email, tags: ["abandoned-cart"], source: "cart" });
}
