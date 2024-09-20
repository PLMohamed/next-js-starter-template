import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { ALLOWED_LOCALES } from "./constants/locale";

export default getRequestConfig(async ({ locale }) => {
    // @ts-expect-error
    if (!ALLOWED_LOCALES.includes(locale)) notFound();

    return {
        messages: (await import(`../locales/${locale}.json`)).default,
    };
});