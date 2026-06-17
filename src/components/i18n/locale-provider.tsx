"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import {
  dictionaries,
  type Messages,
  type MessageKey,
} from "@/lib/i18n/dictionaries";
import { translate, type TVars } from "@/lib/i18n/interpolate";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
};

/**
 * Default = NL. Zo werkt `useT()` ook als een component (per ongeluk) buiten de
 * provider gerenderd wordt: dan krijg je gewoon de Nederlandse tekst i.p.v. een
 * crash of een kale sleutel.
 */
const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  messages: dictionaries[DEFAULT_LOCALE],
});

/**
 * Wikkelt de app. De `locale` + `messages` worden server-side bepaald
 * (getLocale/getMessages in de layout) en hierin doorgegeven, zodat de
 * client-waarde exact gelijk is aan wat de server renderde → geen
 * hydration-mismatch.
 */
export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, messages }),
    [locale, messages],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/** Huidige locale (client). */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

/**
 * Vertaalfunctie (client). Sleutel → string, met optionele `{var}`-interpolatie.
 * Gebruikt dezelfde `translate()`-helper als de server.
 */
export function useT(): (key: MessageKey, vars?: TVars) => string {
  const { messages } = useContext(LocaleContext);
  return useMemo(
    () =>
      (key: MessageKey, vars?: TVars) =>
        translate(messages, key, vars),
    [messages],
  );
}
