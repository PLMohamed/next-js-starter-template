"use client";

import { APIResponse } from "@/types/response";
import { useTranslations } from "next-intl";

export default function ErrorHandler({ messageTranslationCode }: APIResponse) {
  const t = useTranslations();

  return <p>{t(messageTranslationCode)}</p>;
}
