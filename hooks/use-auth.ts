import { useMutation, useQuery } from "@tanstack/react-query";
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
      const { token } = res.data;
      if (token) localStorage.setItem("token", token);
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
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (res) => {
      const { token } = res.data;
      if (token) localStorage.setItem("token", token);
      toast.success("Account created!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Registration failed", getErrorMessage(error));
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => authService.getMe().then((res) => res.data),
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });
}
