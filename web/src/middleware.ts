import { NextRequest, NextResponse } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n/locales";

const PUBLIC_LOCALE_PREFIXES = ["/dashboard", "/leaderboard"];

function preferredLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie) return normalizeLocale(cookie);

  const accept = request.headers.get("accept-language") ?? "";
  if (/\bes\b/i.test(accept)) return "es";
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/link-x") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const localeFromPath = pathname.split("/")[1];
  if (localeFromPath === "en" || localeFromPath === "es") {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, localeFromPath, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const locale = preferredLocale(request);

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (PUBLIC_LOCALE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
