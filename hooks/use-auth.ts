import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  authService,
  LoginPayload,
  RegisterPayload,
  CheckEmailPayload,
} from "@/services/auth";
import { toast } from "@/components/ui/toast";
import { AxiosError } from "axios";

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  return "Something went wrong";
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (res) => {
      const token = res.data?.session?.access_token || res.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        window.dispatchEvent(new Event("payze-auth-token-changed"));
      }
      toast.success("Welcome back!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Login failed", getErrorMessage(error));
    },
  });
}

export function useCheckEmail() {
  return useMutation({
    mutationFn: (data: CheckEmailPayload) => authService.checkEmail(data),
    onError: (error) => {
      toast.error("Email check failed", getErrorMessage(error));
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onError: (error) => {
      toast.error("Registration failed", getErrorMessage(error));
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => authService.getMe(),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; businessName?: string; phone?: string }) =>
      authService.updateProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(["user", "me"], user);
      toast.success("Profile updated", "Your profile details have been saved");
    },
    onError: (error) => {
      toast.error("Couldn't update profile", getErrorMessage(error));
    },
  });
}

export function useChangePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully", "Please log in again with your new password");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("payze-auth-token-changed"));
      router.push("/login");
    },
    onError: (error) => {
      toast.error("Couldn't change password", getErrorMessage(error));
    },
  });
}
