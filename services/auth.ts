import api from "@/lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterEmailPayload {
  email: string;
}

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    businessName: string;
  };
  token: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data),

  checkEmail: (data: RegisterEmailPayload) =>
    api.post("/auth/register/email", data),

  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", data),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};
