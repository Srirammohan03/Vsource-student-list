import {
  AuthResponse,
  LoginStep1Payload,
  LoginStep2Payload,
} from "@/types/auth";
import axios from "axios";

export const authService = {
  async loginStep1(payload: LoginStep1Payload) {
    const res = await axios.post("/api/auth/login-step1", payload, {
      withCredentials: true,
    });
    return res.data;
  },
  async loginStep2(payload: LoginStep2Payload) {
    const res = await axios.post("/api/auth/login-step2", payload, {
      withCredentials: true,
    });
    return res.data;
  },
  async me(): Promise<{ data: AuthResponse }> {
    const res = await axios.get("/api/auth/me", {
      withCredentials: true,
    });
    return res.data;
  },
  async logout() {
    await axios.post(
      "/api/auth/logout",
      {},
      {
        withCredentials: true,
      }
    );
  },
  async sendResetToken(employeeId: string) {
    return await axios.post(
      "/api/auth/forgot-password",
      { employeeId },
      {
        withCredentials: true,
      }
    );
  },
  async resetPassword(payload: { resetToken: string; newPassword: string }) {
    return axios.post("/api/auth/reset-password", payload, {
      withCredentials: true,
    });
  },
};
