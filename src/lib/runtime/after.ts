/**
 * Versie-onafhankelijke "draai dit ná de respons door"-helper.
 *
 * Next 15 exporteert `after` uit `next/server` (op Next 14 heette dat
 * `unstable_after`). De in dit project geïnstalleerde Next 14.2.x bevat die API
 * NIET, dus kunnen we er niet statisch op importeren zonder de build te breken.
 *
 * Strategie:
 *  - Als de geïnstalleerde Next een `after`/`unstable_after` export heeft, dan
 *    plannen we het werk daarmee in (echte achtergrond-taak na de respons).
 *  - Zo niet, dan voeren we het werk inline uit en wachten we erop. In een
 *    serverless-omgeving (Vercel) is dat juist veilig: zonder `after()` mag werk
 *    dat ná het verzenden van de respons doorloopt worden bevroren/gekilld, dus
 *    moeten we het binnen de invocatie afronden. De aanroepende fetch is sowieso
 *    fire-and-forget, dus de gebruiker/triggerende link wacht hier nooit op.
 *
 * Voor de self-chaining worker maakt dit functioneel geen verschil: elke schakel
 * wordt fire-and-forget getriggerd, dus of de respons vóór of ná de batch wordt
 * verstuurd is voor de aanroeper onzichtbaar.
 */

// Best-effort: probeer de (mogelijk afwezige) after-API uit next/server te halen
// zonder een statische import die op Next 14.2.x faalt.
type AfterFn = (task: () => Promise<unknown> | unknown) => void;

let cachedAfter: AfterFn | null | undefined;

function resolveAfter(): AfterFn | null {
  if (cachedAfter !== undefined) return cachedAfter;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("next/server") as Record<string, unknown>;
    const fn = (mod.after ?? mod.unstable_after) as AfterFn | undefined;
    cachedAfter = typeof fn === "function" ? fn : null;
  } catch {
    cachedAfter = null;
  }
  return cachedAfter;
}

/**
 * Voer `task` uit "na de respons" als de runtime dat ondersteunt; anders draait
 * `task` inline en wachten we erop. Retourneert een Promise die resolved zodra
 * het werk is ingepland (after) óf is afgerond (fallback).
 */
export async function runDeferred(task: () => Promise<void>): Promise<void> {
  const after = resolveAfter();
  if (after) {
    after(task);
    return;
  }
  // Fallback: inline afronden binnen de invocatie (veilig op serverless).
  await task();
}

/** True als de runtime een echte `after()`-achtergrondtaak ondersteunt. */
export function hasAfter(): boolean {
  return resolveAfter() !== null;
}
