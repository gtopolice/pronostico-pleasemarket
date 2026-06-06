"use client";

import { createContext, useContext, useMemo } from "react";

import { getMessages, type Locale, type Messages } from "@/lib/i18n";

const LocaleContext = createContext<{ locale: Locale; t: Messages } | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: getMessages(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? "en";
}

export function useTranslations(): Messages {
  const ctx = useContext(LocaleContext);
  return ctx?.t ?? getMessages("en");
}
