export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "please_locale";

export function normalizeLocale(value: string | undefined | null): Locale {
  const code = value?.toLowerCase().split("-")[0];
  return code === "es" ? "es" : "en";
}

export function localePath(locale: Locale, path = ""): string {
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${suffix}`;
}
