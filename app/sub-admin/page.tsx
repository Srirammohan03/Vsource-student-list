// src/app/sub-admin/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { SubAdmin, BranchCode } from "@/types/subAdmin";
import { subAdminService } from "@/services/subAdmin.service";
import { Sidebar } from "@/components/layout/sidebar";
import {
  SubAdminModal,
  FormState,
  FormErrors,
} from "@/components/subadmin/SubAdminModal";
import { SubAdminTable } from "@/components/subadmin/SubAdminTable";
import { TopNav } from "@/components/layout/top-nav";
import { useSubAdmins } from "@/hooks/useSubAdmins";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const emptyForm: FormState = {
  staffName: "",
  mobile: "",
  email: "",
  password: "",
  branchCode: "",
};

export default function SubAdminPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const queryClient = useQueryClient();

  // -----------------------------
  // LOAD LIST USING useQuery
  // -----------------------------
  const { data: subAdmins = [], isLoading } = useSubAdmins();

  // -----------------------------
  // SEARCH
  // -----------------------------
  const filtered = useMemo(() => {
    if (!search.trim()) return subAdmins;
    const term = search.toLowerCase();
    return subAdmins.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term) ||
        s.employeeId.toLowerCase().includes(term)
    );
  }, [search, subAdmins]);

  // -----------------------------
  // FORM CHANGE
  // -----------------------------
  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // -----------------------------
  // OPEN CREATE MODAL
  // -----------------------------
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  // -----------------------------
  // OPEN EDIT MODAL
  // -----------------------------
  const openEditModal = (item: SubAdmin) => {
    setEditingId(item.id);
    setForm({
      staffName: item.name,
      mobile: item.phone,
      email: item.email,
      password: item.password || "",
      branchCode: item.branch as BranchCode,
    });
    setErrors({});
    setModalOpen(true);
  };

  // -----------------------------
  // VALIDATE
  // -----------------------------
  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.staffName) newErrors.staffName = "Required";
    if (!form.mobile) newErrors.mobile = "Required";
    if (!form.email) newErrors.email = "Required";
    if (!form.password) newErrors.password = "Required";
    if (!form.branchCode) newErrors.branchCode = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // CREATE / UPDATE MUTATION
  // -----------------------------
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return subAdminService.update(editingId, {
          name: form.staffName,
          email: form.email,
          phone: form.mobile,
          password: form.password,
          branch: form.branchCode,
        });
      } else {
        return subAdminService.create({
          name: form.staffName,
          email: form.email,
          phone: form.mobile,
          password: form.password,
          branch: form.branchCode,
          loginType: "SUB_ADMIN",
          role: "SUB_ADMIN",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    },
  });

  // -----------------------------
  // DELETE MUTATION
  // -----------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subAdminService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
    },
  });

  // -----------------------------
  // HANDLE DELETE
  // -----------------------------
  const handleDelete = (item: SubAdmin) => {
    if (confirm(`Delete "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="flex flex-1 flex-col">
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Sub Admin List</h1>
                <p className="text-sm text-slate-600">
                  Manage staff sub admin accounts.
                </p>
              </div>

              <div className="flex gap-2 flex-col sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm shadow-sm sm:w-64"
                />

                <button
                  onClick={openCreateModal}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm"
                >
                  + Add Sub Admin
                </button>
              </div>
            </div>

            <SubAdminTable
              items={filtered}
              loading={isLoading}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />

            <SubAdminModal
              open={modalOpen}
              loading={saveMutation.isPending}
              title={editingId ? "Edit Sub Admin" : "Add Sub Admin"}
              mode={editingId ? "add" : "edit"}
              form={form}
              errors={errors}
              onChange={handleChange}
              onClose={() => setModalOpen(false)}
              onSubmit={() => {
                if (validate()) saveMutation.mutate();
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
