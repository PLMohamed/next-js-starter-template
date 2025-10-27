"use client";

import ErrorHandler from "@/components/ErrorHandler";
import { ActionLogin, ActionSignup } from "@/lib/server/actions/auth/login";
import { LoginRequest, SignupRequest } from "@/types/request/Auth";
import { APIResponse } from "@/types/response";
import { handleAction } from "@/utils/actions";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLogin(options?: UseMutationOptions<void, APIResponse, LoginRequest>) {
  const queryClient = useQueryClient();

  async function login(values: LoginRequest) {
    return handleAction(ActionLogin, values);
  }

  return useMutation<void, APIResponse, LoginRequest>({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
    onError: error => {
      toast.error(<ErrorHandler {...error} />);
    },
    ...options,
  });
}

export function useSignup(options?: UseMutationOptions<void, APIResponse, SignupRequest>) {
  const queryClient = useQueryClient();

  async function signup(values: SignupRequest) {
    return handleAction(ActionSignup, values);
  }

  return useMutation<void, APIResponse, SignupRequest>({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
    onError: error => {
      toast.error(<ErrorHandler {...error} />);
    },
    ...options,
  });
}
