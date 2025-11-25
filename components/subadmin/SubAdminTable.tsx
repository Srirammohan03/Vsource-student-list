// src/components/subadmin/SubAdminTable.tsx
"use client";

import React from "react";
import { SubAdmin, BRANCH_OPTIONS } from "@/types/subAdmin";

type Props = {
  items: SubAdmin[];
  loading?: boolean;
  onEdit: (item: SubAdmin) => void;
  onDelete: (item: SubAdmin) => void;
};

function getBranchLabel(code: string) {
  return BRANCH_OPTIONS.find((b) => b.code === code)?.label ?? code;
}

export const SubAdminTable: React.FC<Props> = ({
  items,
  loading,
  onEdit,
  onDelete
}) => {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">S.No</th>
            <th className="px-4 py-3">Employee ID</th>
            <th className="px-4 py-3">Staff Name</th>
            <th className="px-4 py-3">Mobile Number</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-sm text-slate-600"
              >
                Loading sub admins...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-sm text-slate-600"
              >
                No sub admins added yet.
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr
                key={item.id}
                className="border-t last:border-b hover:bg-slate-50/60"
              >
                <td className="px-4 py-3 text-xs text-slate-500">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {item.employeeId}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {item.staffName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {item.mobile}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  {item.email}
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">
                  <span className="font-semibold">{item.branchCode}</span>
                  <div className="text-xs text-slate-500">
                    {getBranchLabel(item.branchCode)}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
