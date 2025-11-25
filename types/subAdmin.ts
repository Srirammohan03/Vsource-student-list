// src/types/subAdmin.ts

// Match Prisma enum Branch
export type BranchCode =
  | "HYDERABAD_VS_HYD"
  | "VIJAYAWADA_VS_BZA"
  | "TIRUPATI_VS_TIR"
  | "VIZAG_VS_VIZAG"
  | "MUMBAI_VS_MUM"
  | "BANGALURU_VS_BAN"
  | "PUNE_VS_PUN"
  | "ASSOCIATES_VS_MOU"
  | "ONLINE"
  | "GEORGIA";

export type BranchOption = {
  code: BranchCode;
  label: string;
};

export const BRANCH_OPTIONS: BranchOption[] = [
  { code: "HYDERABAD_VS_HYD", label: "Hyderabad (VS HYD)" },
  { code: "VIJAYAWADA_VS_BZA", label: "Vijayawada (VS BZA)" },
  { code: "TIRUPATI_VS_TIR", label: "Tirupati (VS TIR)" },
  { code: "VIZAG_VS_VIZAG", label: "Vizag (VS VIZAG)" },
  { code: "MUMBAI_VS_MUM", label: "Mumbai (VS MUM)" },
  { code: "BANGALURU_VS_BAN", label: "Bengaluru (VS BAN)" },
  { code: "PUNE_VS_PUN", label: "Pune (VS PUN)" },
  { code: "ASSOCIATES_VS_MOU", label: "Associates (VS MOU)" },
  { code: "ONLINE", label: "Online" },
  { code: "GEORGIA", label: "Georgia" }
];

// Frontend shape mapped from Prisma User
// Prisma User:
//  employeeId, name, email, phone, password, branch, role, loginType, date/time...
export type SubAdmin = {
  id: string;
  employeeId: string;
  staffName: string;       // Prisma: name
  mobile: string;          // Prisma: phone
  email: string;
  password: string;
  branchCode: BranchCode;  // Prisma: branch
  role?: string;
  loginType?: string;
  createdAt: string;       // ISO string
};
