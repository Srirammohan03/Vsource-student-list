// src/types/subAdmin.ts

export type BranchCode =
  | "VS_HYD"
  | "VS_BZA"
  | "VS_TIR"
  | "VS_VIZAG"
  | "VS_MUM"
  | "VS_BAN"
  | "VS_PUN"
  | "VS_MOU"
  | "ONLINE"
  | "GEORGIA";

export type BranchOption = {
  code: BranchCode;
  label: string;
};

export const BRANCH_OPTIONS: BranchOption[] = [
  { code: "VS_HYD", label: "Hyderabad (VS HYD)" },
  { code: "VS_BZA", label: "Vijayawada (VS BZA)" },
  { code: "VS_TIR", label: "Tirupati (VS TIR)" },
  { code: "VS_VIZAG", label: "Vizag (VS VIZAG)" },
  { code: "VS_MUM", label: "Mumbai (VS MUM)" },
  { code: "VS_BAN", label: "Bengaluru (VS BAN)" },
  { code: "VS_PUN", label: "Pune (VS PUN)" },
  { code: "VS_MOU", label: "Associates (VS MOU)" },
  { code: "ONLINE", label: "Online" },
  { code: "GEORGIA", label: "Georgia" }
];

export type SubAdmin = {
  id: string;
  staffName: string;
  mobile: string;
  email: string;
  password: string;
  branchCode: BranchCode;
  createdAt: string;
};
