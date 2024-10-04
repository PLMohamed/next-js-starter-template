import { axiosInstance } from "@/lib/axios";
import { LoginRequest, SignupRequest } from "@/types/request/auth";
import { APIResponse } from "@/types/response";
import { useMutation, UseMutationOptions, useQueryClient } from "react-query";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

export function useLogin(
    options?: UseMutationOptions<APIResponse, APIResponse, LoginRequest>
) {
    const queryClient = useQueryClient();
    const t = useTranslations();

    async function login(values: LoginRequest) {
        try {
            const response = await axiosInstance.post("auth/login", values);

            return response.data;
        } catch (error: any) {
            throw error?.response?.data;
        }

    }

    return useMutation<APIResponse, APIResponse, LoginRequest>(login, {
        onSuccess: () => {
            queryClient.invalidateQueries("user");
        },
        onError: (error) => {
            toast.error(t(error.messageTranslationCode));
        },
        ...options
    });
}

export function useSignup(
    options?: UseMutationOptions<APIResponse, APIResponse, SignupRequest>
) {
    const queryClient = useQueryClient();
    const t = useTranslations();

    async function signup(values: SignupRequest) {
        try {
            const response = await axiosInstance.post("auth/signup", values);

            return response.data;
        } catch (error: any) {
            throw error?.response?.data;
        }

    }

    return useMutation<APIResponse, APIResponse, SignupRequest>(signup, {
        onSuccess: () => {
            queryClient.invalidateQueries("user");
        },
        onError: (error) => {
            toast.error(t(error.messageTranslationCode));
        },
        ...options
    });
}
