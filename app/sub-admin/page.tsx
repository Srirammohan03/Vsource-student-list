// src/app/sub-admin/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SubAdmin, BranchCode } from "@/types/subAdmin";
import { subAdminService } from "@/services/subAdmin.service";
import { Sidebar } from "@/components/layout/sidebar";
import {
  SubAdminModal,
  FormState,
  FormErrors
} from "@/components/subadmin/SubAdminModal";
import { SubAdminTable } from "@/components/subadmin/SubAdminTable";

const TopNav: React.FC<{
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}> = ({ sidebarCollapsed, onToggleSidebar }) => {
  return (
    <header className="border-b bg-white py-3 px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-md p-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        </button>
        <div className="text-sm text-slate-700">Sub Admins</div>
      </div>
    </header>
  );
};

const emptyForm: FormState = {
  staffName: "",
  employeeId: "",
  mobile: "",
  email: "",
  password: "",
  branchCode: ""
};

export default function SubAdminPage() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // sidebar collapsed state
  const [collapsed, setCollapsed] = useState(false);

  // Load existing sub admins from storage on first render
  useEffect(() => {
    const load = async () => {
      try {
        const all = await subAdminService.getAll();
        setSubAdmins(all);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return subAdmins;
    const term = search.toLowerCase();
    return subAdmins.filter(
      (s) =>
        s.staffName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.mobile.toLowerCase().includes(term) ||
        s.employeeId.toLowerCase().includes(term)
    );
  }, [search, subAdmins]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (item: SubAdmin) => {
    setEditingId(item.id);
    setForm({
      staffName: item.staffName,
      employeeId: item.employeeId,
      mobile: item.mobile,
      email: item.email,
      password: item.password,
      branchCode: item.branchCode as BranchCode
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.staffName.trim()) newErrors.staffName = "Staff Name is required";
    if (!form.employeeId.trim())
      newErrors.employeeId = "Employee ID is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.branchCode) newErrors.branchCode = "Office Branch is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      if (editingId) {
        const updated = await subAdminService.update(editingId, {
          staffName: form.staffName,
          employeeId: form.employeeId,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
          branchCode: form.branchCode as BranchCode
        });

        if (updated) {
          setSubAdmins((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
        }
      } else {
        const created = await subAdminService.create({
          staffName: form.staffName,
          employeeId: form.employeeId,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
          branchCode: form.branchCode as BranchCode
        });
        setSubAdmins((prev) => [...prev, created]);
      }

      // Close modal & reset form
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: SubAdmin) => {
    const ok = window.confirm(
      `Are you sure you want to delete sub admin "${item.staffName}"?`
    );
    if (!ok) return;

    await subAdminService.remove(item.id);
    setSubAdmins((prev) => prev.filter((s) => s.id !== item.id));
  };

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
            {/* Heading + Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  Sub Admin List
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage staff sub admin accounts and office branches.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Search by name, email, mobile or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-64"
                />
                <button
                  onClick={openCreateModal}
                  className="flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  + Add Sub Admin
                </button>
              </div>
            </div>

            {/* Table */}
            <SubAdminTable
              items={filtered}
              loading={loading}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />

            {/* Modal */}
            <SubAdminModal
              open={modalOpen}
              loading={saving}
              title={editingId ? "Edit Sub Admin" : "Add Sub Admin"}
              form={form}
              errors={errors}
              onChange={handleChange}
              onClose={() => setModalOpen(false)}
              onSubmit={handleSave}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
