import {
  AuthResponse,
  LoginStep1Payload,
  LoginStep2Payload,
  AuthUser
} from "@/types/auth";
import { loginLogService } from "./loginLog.service"; 

type TempLoginResponse = { data: { tempToken: string } };
type MeResponse = { data: AuthResponse };

const TEMP_TOKEN_KEY = "vsource_temp_token";
const USER_KEY = "vsource_user";

type MockUser = AuthUser & { password: string };

const MOCK_USERS: MockUser[] = [
  {
    id: "VS-0001",
    name: "Super Admin",
    email: "superadmin@vsource.online",
    employeeId: "VSH001",
    role: "SuperAdmin",
    password: "Vsource@123"
  },
  {
    id: "VS-0002",
    name: "Admin User",
    email: "admin@vsource.online",
    employeeId: "VSH002",
    role: "Admin",
    password: "Admin@123"
  },
  {
    id: "VS-0003",
    name: "Accountant User",
    email: "accountant@vsource.online",
    employeeId: "VSH003",
    role: "Accountant",
    password: "Account@123"
  },
  {
    id: "VS-0100",
    name: "Sub Admin User",
    email: "subadmin@vsource.online",
    employeeId: "VSH005",
    role: "SubAdmin",
    password: "SubAdmin@123"
  }

];

function delay(ms: number = 500) {
  return new Promise((res) => setTimeout(res, ms));
}

export const authService = {
  async loginStep1(payload: LoginStep1Payload): Promise<TempLoginResponse> {
    if (typeof window === "undefined") {
      throw new Error("Login must be called in the browser");
    }
    await delay();

    const user = MOCK_USERS.find(
      (u) => u.email === payload.email && u.password === payload.password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    window.localStorage.setItem(TEMP_TOKEN_KEY, user.id);

    return { data: { tempToken: user.id } };
  },

  async loginStep2(payload: LoginStep2Payload): Promise<{ data: AuthResponse }> {
    if (typeof window === "undefined") {
      throw new Error("Login must be called in the browser");
    }
    await delay();

    const tempId = window.localStorage.getItem(TEMP_TOKEN_KEY);
    if (!tempId) {
      throw new Error("Session expired. Please login again.");
    }

    const user = MOCK_USERS.find(
      (u) => u.id === tempId && u.employeeId === payload.employeeId
    );

    if (!user) {
      throw new Error("Invalid Employee ID");
    }

    const authResp: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role
      }
    };

    window.localStorage.setItem(USER_KEY, JSON.stringify(authResp.user));

    if (typeof document !== "undefined") {
      document.cookie = "vsource_jwt=mock-token; path=/";
    }

    return { data: authResp };
  },

  async me(): Promise<MeResponse> {
    if (typeof window === "undefined") {
      throw new Error("Not authenticated");
    }
    const stored = window.localStorage.getItem(USER_KEY);
    if (!stored) {
      throw new Error("Not authenticated");
    }
    const user: AuthUser = JSON.parse(stored);
    return { data: { user } };
  },

  async logout(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(TEMP_TOKEN_KEY);
    if (typeof document !== "undefined") {
      document.cookie =
        "vsource_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
};
