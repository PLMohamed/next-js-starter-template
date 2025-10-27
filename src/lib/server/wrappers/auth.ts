import { redirect } from "@/components/I18nComponents";
import { getSessionToken } from "../services";
import { AppRoutes } from "../../../../.next/types/routes";
import { Locale } from "next-intl";
import { getLocale } from "next-intl/server";

export function withAuthPage<T extends AppRoutes, P extends PageProps<T>>(
  page: (props: P) => React.JSX.Element | Promise<React.JSX.Element>,
) {
  return async function AuthProtectedPage(props: P) {
    const payload = await getSessionToken();

    if (!payload) {
      const { locale } = await props.params;
      redirect({
        href: "/auth/login",
        locale: locale as Locale,
      });
    }

    return page({ ...props, session: payload });
  };
}

export function withAuthAction<T extends unknown[], U>(
  action: (
    ...args: [...T, { session: Exclude<Awaited<ReturnType<typeof getSessionToken>>, null> }]
  ) => Promise<U>,
) {
  return async function AuthProtectedAction(...args: T) {
    const payload = await getSessionToken();

    if (!payload) {
      const locale = await getLocale();

      redirect({
        href: "/auth/login",
        locale: locale as Locale,
      });

      return;
    }

    return action(...args, { session: payload });
  };
}
