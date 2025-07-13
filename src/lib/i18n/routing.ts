import { ALLOWED_LOCALES, DEFAULT_LOCALE, LOCALE_PREFIX } from "@/constants/locale";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ALLOWED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: LOCALE_PREFIX,
});

export type AllowedLocales = (typeof routing.locales)[number];
