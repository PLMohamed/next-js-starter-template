import { RTL_LOCALE } from "@/constants/locale";
import { NextIntlClientProvider } from "next-intl";

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className="scroll-smooth"
    >
      <body
        className={"overflow-x-hidden scroll-smooth"}
        dir={RTL_LOCALE.includes(locale) ? "rtl" : "ltr"}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
