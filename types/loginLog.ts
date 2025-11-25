// src/types/loginLog.ts

import type { BranchCode } from "@/types/subAdmin";

export const LOGIN_LOG_STORAGE_KEY = "vsource_login_logs";

// Prisma: role String  (e.g., SuperAdmin, Admin, SubAdmin, Accountant, etc.)
export type LoginRole =
  | "SuperAdmin"
  | "Admin"
  | "SubAdmin"
  | "Accountant"
  | "Staff"
  | "Other";

// One login event, mapped from Prisma User
// User model:
//  id, employeeId, name, email, loginType, phone, branch, role, date, time...
export type LoginLog = {
  id: string;
  userId?: string;        // Optional link to Prisma User.id
  employeeId: string;     // User.employeeId
  name: string;           // User.name
  username: string;       // Usually User.email
  role: LoginRole;        // User.role
  loginType: string;      // User.loginType (e.g., "Web", "Manual", etc.)
  branch: BranchCode;     // User.branch
  timestamp: string;      // ISO datetime when they logged in
};

/**
 * Get today's date in IST as YYYY-MM-DD (for <input type="date" />)
 */
export function getISTTodayISO(): string {
  const now = new Date();
  const ist = toIST(now);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convert a timestamp to IST date (YYYY-MM-DD) for filtering.
 */
export function getISTDateISO(timestamp: string): string {
  const date = new Date(timestamp);
  const ist = toIST(date);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * For display in table: DD-MM-YYYY in IST.
 */
export function getISTDateDisplay(timestamp: string): string {
  const date = new Date(timestamp);
  const ist = toIST(date);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

/**
 * For display in table: hh:mm AM/PM in IST.
 */
export function getISTTimeDisplay(timestamp: string): string {
  const date = new Date(timestamp);
  const ist = toIST(date);

  let hours = ist.getUTCHours();
  const minutes = String(ist.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Convert a Date to "IST" by adding +5:30 hours.
 * (IST has no DST, so a fixed offset is fine here.)
 */
function toIST(date: Date): Date {
  const utcMs = date.getTime();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(utcMs + istOffsetMs);
}
