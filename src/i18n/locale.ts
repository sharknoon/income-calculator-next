"use server";

import { cookies, headers } from "next/headers";
import { Locale, defaultLocale } from "@/i18n/config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value;
  if (cookieLocale) {
    return cookieLocale;
  }

  const acceptLanguage = (await headers()).get("accept-language");
  if (acceptLanguage) {
    const headerLocale = parseAcceptLanguage(acceptLanguage)[0];
    if (headerLocale) {
      return headerLocale;
    }
  }

  return defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}

function parseAcceptLanguage(acceptLanguage: string): string[] {
  if (!acceptLanguage) return [];

  return acceptLanguage
    .split(",")
    .map((item) => {
      const [lang, qPart] = item.trim().split(";");
      // Extract quality value (q) if present, default to 1.0
      const q = qPart ? parseFloat(qPart.split("=")[1]) : 1.0;
      return { lang: lang.trim(), quality: q };
    })
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.lang);
}
