import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { Formats, hasLocale } from "next-intl";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`@/../locales/${locale}.json`)).default,
  };
});

export const formats: Formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 5,
    },
    currency: {
      style: "currency",
      currency: "DZD",
      numberingSystem: "latn",
    },
  },
  list: {
    enumeration: {
      style: "long",
      type: "conjunction",
    },
  },
} satisfies Formats;
