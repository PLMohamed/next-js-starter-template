import { RTL_LOCALE } from "@/constants/locale";
import { AllowedLocales, routing } from "@/lib/i18n";
import { PageProps } from "@/types/data/page";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

interface RootLayoutProps extends PageProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children, params }: Readonly<RootLayoutProps>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as AllowedLocales)) return notFound();

  const dictionary = await getMessages();

  return (
    <html
      lang={locale}
      className="scroll-smooth"
    >
      <body
        className={"overflow-x-hidden scroll-smooth"}
        dir={RTL_LOCALE.includes(locale) ? "rtl" : "ltr"}
      >
        <NextIntlClientProvider messages={dictionary}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
