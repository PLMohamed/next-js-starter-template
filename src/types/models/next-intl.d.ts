import en from "@/../locales/en.json";
import { formats, routing } from "@/lib/i18n";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
    Formats: typeof formats;
    Locale: (typeof routing.locales)[number];
  }
}
