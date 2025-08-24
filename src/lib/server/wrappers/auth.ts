import { redirect } from "next/navigation";
import { getSessionToken } from "../services";

export function withAuthPage<P extends object>(
  page: (
    props: P & {
      session: Exclude<Awaited<ReturnType<typeof getSessionToken>>, null>;
    },
  ) => React.JSX.Element | Promise<React.JSX.Element>,
) {
  return async function AuthProtectedPage(props: P) {
    const payload = await getSessionToken();

    if (!payload) {
      redirect("/auth/login");
    }

    return page({ ...props, session: payload });
  };
}

export function withAuthAction<T extends unknown[], U>(
  action: (
    ...args: [
      ...T,
      { session: Exclude<Awaited<ReturnType<typeof getSessionToken>>, null> },
    ]
  ) => Promise<U>,
) {
  return async function AuthProtectedAction(...args: T) {
    const payload = await getSessionToken();

    if (!payload) {
      redirect("/auth/login");
    }

    return action(...args, { session: payload });
  };
}
