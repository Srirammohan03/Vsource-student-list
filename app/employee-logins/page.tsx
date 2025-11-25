// src/app/employee-logins/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import {
  LoginLog,
  getISTDateISO,
  getISTTodayISO
} from "@/types/loginLog";
import { loginLogService } from "@/services/loginLog.service";
import { EmployeeLoginTable } from "@/components/login/EmployeeLoginTable";

export default function EmployeeLoginPage() {
  const [collapsed, setCollapsed] = useState(false);

  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [pendingDate, setPendingDate] = useState<string>(() =>
    getISTTodayISO()
  );
  const [activeDate, setActiveDate] = useState<string>(() =>
    getISTTodayISO()
  );

  const [page, setPage] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await loginLogService.getAll();
        setLogs(all);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter by date (IST) + search (employeeId, name, username, role, loginType)
  const filtered = useMemo(() => {
    const byDate = logs.filter((log) => {
      if (!activeDate) return true;
      const logDateISO = getISTDateISO(log.timestamp);
      return logDateISO === activeDate;
    });

    if (!search.trim()) return byDate;
    const term = search.toLowerCase();
    return byDate.filter((log) => {
      return (
        log.employeeId.toLowerCase().includes(term) ||
        log.name.toLowerCase().includes(term) ||
        log.username.toLowerCase().includes(term) ||
        log.role.toLowerCase().includes(term) ||
        log.loginType.toLowerCase().includes(term)
      );
    });
  }, [logs, activeDate, search]);

  // Pagination
  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    // reset page when filters change and current page is out of range
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages - 1) {
      setPage(0);
    }
  }, [filtered.length, pageSize, page]);

  const handleSubmitDate = () => {
    setActiveDate(pendingDate);
    setPage(0);
  };

  const todayDisplay = useMemo(() => {
    // For heading: DD-MM-YYYY
    const [y, m, d] = activeDate.split("-");
    if (!y || !m || !d) return "";
    return `${d}-${m}-${y}`;
  }, [activeDate]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Main content area */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top navigation */}
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />

        {/* Page body */}
        <main className="flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Heading + filters */}
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  Employee Login History
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Today&apos;s Login Details – Date{" "}
                  <span className="font-semibold text-slate-900">
                    {todayDisplay}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  View login activity for Super Admin, Admin, Sub Admin and
                  other employees in IST.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {/* Date filter */}
                <div className="flex flex-col text-sm">
                  <label className="mb-1 text-xs font-medium text-slate-700">
                    Date (DD-MM-YYYY)
                  </label>
                  <input
                    type="date"
                    value={pendingDate}
                    onChange={(e) => setPendingDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSubmitDate}
                  className="mt-1 flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 sm:mt-0"
                >
                  Submit
                </button>

                {/* Search */}
                <div className="flex flex-col text-sm">
                  <label className="mb-1 text-xs font-medium text-slate-700">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search by ID, name, username, role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <EmployeeLoginTable
              items={paginated}
              loading={loading}
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(0);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
