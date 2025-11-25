// src/services/loginLog.service.ts
"use client";

import {
  LOGIN_LOG_STORAGE_KEY,
  LoginLog,
  LoginRole
} from "@/types/loginLog";
import type { BranchCode } from "@/types/subAdmin";

function readFromStorage(): LoginLog[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LOGIN_LOG_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LoginLog[];
  } catch {
    return [];
  }
}

function writeToStorage(items: LoginLog[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOGIN_LOG_STORAGE_KEY, JSON.stringify(items));
}

export const loginLogService = {
  async getAll(): Promise<LoginLog[]> {
    return readFromStorage();
  },

  async addLogin(payload: {
    userId?: string;
    employeeId: string;
    name: string;
    username: string;       // usually email
    role: LoginRole;        // Prisma User.role
    loginType?: string;     // Prisma User.loginType
    branch?: BranchCode;    // Prisma User.branch
  }): Promise<LoginLog> {
    const list = readFromStorage();

    const entry: LoginLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: payload.userId,
      employeeId: payload.employeeId,
      name: payload.name,
      username: payload.username,
      role: payload.role,
      loginType: payload.loginType ?? "Web",
      branch: payload.branch ?? "ONLINE",
      timestamp: new Date().toISOString()
    };

    list.push(entry);
    writeToStorage(list);
    return entry;
  }
};
