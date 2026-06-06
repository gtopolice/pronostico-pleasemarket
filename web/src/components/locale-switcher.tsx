"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localePath, normalizeLocale, type Locale } from "@/lib/i18n";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const current = normalizeLocale(segments[0]);
  const rest = segments.slice(1).join("/");

  function hrefFor(locale: Locale) {
    if (segments[0] === "en" || segments[0] === "es") {
      return localePath(locale, rest);
    }
    return localePath(locale);
  }

  return (
    <div className="locale-switcher" role="group" aria-label="Language">
      {(["en", "es"] as const).map((locale) => (
        <Link
          key={locale}
          href={hrefFor(locale)}
          className={`locale-switcher__btn${current === locale ? " locale-switcher__btn--active" : ""}`}
          aria-current={current === locale ? "true" : undefined}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
