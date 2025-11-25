// src/components/login/EmployeeLoginTable.tsx
"use client";

import React from "react";
import { LoginLog } from "@/types/loginLog";
import {
  getISTDateDisplay,
  getISTTimeDisplay
} from "@/types/loginLog";

type Props = {
  items: LoginLog[];
  loading?: boolean;
  page: number; // 0-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export const EmployeeLoginTable: React.FC<Props> = ({
  items,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange
}) => {
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + items.length, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white">
      {/* Top controls: page-size selector */}
      <div className="flex flex-col gap-2 border-b px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-slate-600">entries</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">S No</th>
              <th className="px-4 py-3">Employee ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Login Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-slate-600"
                >
                  Loading login history...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-sm text-slate-600"
                >
                  No login records found for the selected date.
                </td>
              </tr>
            ) : (
              items.map((log, idx) => (
                <tr
                  key={log.id}
                  className="border-t last:border-b hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {log.employeeId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {log.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {log.username}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {log.role}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {getISTDateDisplay(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {getISTTimeDisplay(log.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: pagination info */}
      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-600">
          {total === 0 ? (
            "Showing 0 to 0 of 0 entries"
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold">{startIndex + 1}</span> to{" "}
              <span className="font-semibold">{endIndex}</span> of{" "}
              <span className="font-semibold">{total}</span> entries
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className="text-xs text-slate-600">
            {page + 1} / {totalPages}
          </span>
          <button
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
