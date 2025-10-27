"use client";

import { APIResponse } from "@/types/response";
import { useTranslations } from "next-intl";

export default function ErrorHandler({ messageTranslationCode }: APIResponse) {
  const t = useTranslations();

  // @ts-ignore
  return <p>{t(messageTranslationCode)}</p>;
}
