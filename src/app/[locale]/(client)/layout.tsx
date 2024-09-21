import { RTL_LOCALE } from "@/constants/locale";
import { PageProps } from "@/types/data/page";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

interface RootLayoutProps extends PageProps {
    children: React.ReactNode;
}

export default async function RootLayout({ children, params: { locale } }: Readonly<RootLayoutProps>) {
    const dictionary = await getMessages();
    return (
        <html
            lang={locale}
            className="scroll-smooth"
        >
            <body
                className={`overflow-x-hidden scroll-smooth text-neutral-900`}
                dir={RTL_LOCALE.includes(locale) ? "rtl" : "ltr"}
            >
                <NextIntlClientProvider messages={dictionary}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}