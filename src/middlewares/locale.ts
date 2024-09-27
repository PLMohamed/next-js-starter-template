import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { ALLOWED_LOCALES, DEFAULT_LOCALE, LOCALE_PREFIX } from "@/constants/locale";

export default async function localeMiddleware(request: NextRequest) {

  const handleI18nRouting = createIntlMiddleware({
    locales: ALLOWED_LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: LOCALE_PREFIX,
  });

  const response = handleI18nRouting(request);

  return response;
}