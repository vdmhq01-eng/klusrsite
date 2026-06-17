import type { Messages, MessageKey } from "./dictionaries";

/** Waarden voor `{var}`-interpolatie (string of number). */
export type TVars = Record<string, string | number>;

/**
 * Vervang `{var}`-placeholders in een bericht. Onbekende placeholders blijven
 * letterlijk staan (geen exceptions). Wordt gedeeld door de server-`t()` en de
 * client-`useT()` zodat beide identiek interpoleren → consistente hydration.
 */
export function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Vertaal een sleutel met een gegeven berichtenset. Valt terug op de sleutel
 * zelf als die (om wat voor reden dan ook) ontbreekt, zodat er nooit een lege
 * of `undefined`-string verschijnt.
 */
export function translate(
  messages: Messages,
  key: MessageKey,
  vars?: TVars,
): string {
  const template = messages[key];
  if (typeof template !== "string") return key;
  return interpolate(template, vars);
}
