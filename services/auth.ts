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

  getMe: async (): Promise<User> => {
    const res = await api.get<{
      user: {
        id: string;
        email: string;
        user_metadata?: {
          first_name?: string;
          last_name?: string;
          business_name?: string;
          phone?: string;
        };
      };
    }>("/auth/users/me");

    const rawUser = res.data.user;
    return {
      id: rawUser.id,
      email: rawUser.email,
      firstName: rawUser.user_metadata?.first_name || "",
      lastName: rawUser.user_metadata?.last_name || "",
      businessName: rawUser.user_metadata?.business_name || "",
      phone: rawUser.user_metadata?.phone || "",
    };
  },

  updateProfile: (data: { firstName?: string; lastName?: string; businessName?: string; phone?: string }) =>
    api.patch<User>("/auth/users/me", data).then((res) => res.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>("/auth/change-password", data).then((res) => res.data),
};

