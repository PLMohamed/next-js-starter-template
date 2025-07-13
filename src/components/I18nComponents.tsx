import { ALLOWED_LOCALES, LOCALE_PREFIX } from "@/constants/locale";
import { createNavigation } from "next-intl/navigation";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: ALLOWED_LOCALES,
  localePrefix: LOCALE_PREFIX,
});
