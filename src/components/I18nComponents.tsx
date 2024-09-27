import { ALLOWED_LOCALES, LOCALE_PREFIX } from "@/constants/locale";
import { createSharedPathnamesNavigation } from "next-intl/navigation";


export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
    locales: ALLOWED_LOCALES,
    localePrefix: LOCALE_PREFIX
});
