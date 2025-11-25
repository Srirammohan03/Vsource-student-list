export type UserRole = "SuperAdmin" | "Admin" | "SubAdmin" | "Accountant";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: UserRole;
}

export interface LoginStep1Payload {
  email: string;
  password: string;
}

export interface LoginStep2Payload {
  employeeId: string;
  tempToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken?: string;
}
