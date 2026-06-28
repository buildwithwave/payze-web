import api from "@/lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CheckEmailPayload {
  email: string;
}

export interface CheckEmailResponse {
  exists: boolean;
}

export interface RegisterPayload {
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post("/auth/login", data),

  checkEmail: (data: CheckEmailPayload) =>
    api.post<CheckEmailResponse>("/auth/check-email", data),

  register: (data: RegisterPayload) =>
    api.post("/auth/register", data),

  getMe: () =>
    api.get<User>("/auth/users/me"),
};
