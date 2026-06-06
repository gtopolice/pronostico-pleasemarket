"use client";

import { usePathname } from "next/navigation";

import { LocaleProvider } from "@/components/locale-provider";
import { normalizeLocale } from "@/lib/i18n";

export function AppLocaleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0];
  const locale = normalizeLocale(segment);

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
