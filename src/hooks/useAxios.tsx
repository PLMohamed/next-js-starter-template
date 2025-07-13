"use client";

import { useRouter } from "@/components/I18nComponents";
import { API_URL } from "@/constants/api";
import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";

export function useAxios(): AxiosInstance {
  const { refresh } = useRouter();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
    });

    instance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 403) refresh();
        return Promise.reject(error);
      },
    );

    return instance;
  }, [refresh]);

  return axiosInstance;
}
