import api from "@/lib/axios";
import {
  AuthResponse,
  LoginStep1Payload,
  LoginStep2Payload,
} from "@/types/auth";

export const authService = {
  async loginStep1(payload: LoginStep1Payload) {
    const res = await api.post("/api/auth/login-step1", payload);
    return res.data;
  },
  async loginStep2(payload: LoginStep2Payload) {
    const res = await api.post("/api/auth/login-step2", payload);
    return res.data;
  },
  async me(): Promise<{ data: AuthResponse }> {
    const res = await api.get("/api/auth/me", {
      withCredentials: true,
    });
    return res.data;
  },
  async logout() {
    await api.post(
      "/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );
  },
  async sendResetToken(employeeId: string) {
    return await api.post("/api/auth/forgot-password", { employeeId });
  },
  async resetPassword(payload: { resetToken: string; newPassword: string }) {
    return api.post("/api/auth/reset-password", payload);
  },
};
