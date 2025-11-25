// src/components/subadmin/SubAdminModal.tsx
"use client";

import React from "react";
import { BranchCode, BRANCH_OPTIONS } from "@/types/subAdmin";

type FormState = {
  staffName: string;
  mobile: string;
  email: string;
  password: string;
  branchCode: BranchCode | "";
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type Props = {
  open: boolean;
  loading?: boolean;
  title: string;
  form: FormState;
  errors: FormErrors;
  onChange: (field: keyof FormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export type { FormState, FormErrors };

export const SubAdminModal: React.FC<Props> = ({
  open,
  loading,
  title,
  form,
  errors,
  onChange,
  onClose,
  onSubmit
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Staff Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Staff Name
            </label>
            <input
              type="text"
              value={form.staffName}
              onChange={(e) => onChange("staffName", e.target.value)}
              placeholder="Enter Staff Name"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.staffName && (
              <p className="mt-1 text-xs text-red-600">{errors.staffName}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mobile
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => onChange("mobile", e.target.value)}
              placeholder="Enter Mobile"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.mobile && (
              <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Enter Email"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Enter Password"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Office Branch
            </label>
            <select
              value={form.branchCode}
              onChange={(e) =>
                onChange("branchCode", e.target.value as BranchCode | "")
              }
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select Office Branch</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.label}
                </option>
              ))}
            </select>
            {errors.branchCode && (
              <p className="mt-1 text-xs text-red-600">
                {errors.branchCode}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
