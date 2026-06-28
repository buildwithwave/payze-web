import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService, LoginPayload, RegisterPayload, RegisterEmailPayload } from "@/services/auth";
import { toast } from "@/components/ui/toast";
import { AxiosError } from "axios";

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.error || error.message;
  }
  return "Something went wrong";
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
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
    mutationFn: (data: RegisterEmailPayload) => authService.checkEmail(data),
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
      localStorage.setItem("token", res.data.token);
      toast.success("Account created!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Registration failed", getErrorMessage(error));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success("Reset link sent", "Check your email");
    },
    onError: (error) => {
      toast.error("Request failed", getErrorMessage(error));
    },
  });
}
