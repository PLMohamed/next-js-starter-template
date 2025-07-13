import { routing } from "@/lib/i18n";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

export default async function localeMiddleware(request: NextRequest) {
  const handleI18nRouting = createIntlMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    localePrefix: routing.localePrefix,
  });

  const response = handleI18nRouting(request);

  return response;
}
