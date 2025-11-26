"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import RegistrationForm from "@/components/student-registration/RegistrationForm";
import api from "@/lib/axios";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [collapsed, setCollapsed] = useState(false);

  // Fetch single student with React Query
  const fetchStudent = async () => {
    const { data } = await api.get(`/api/student-registration/${id}`);

    return data;
  };

  const {
    data: student,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: fetchStudent,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading student details...
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-red-600">
        Failed to load student.
        <button
          onClick={() => router.push("/student-registration-list")}
          className="ml-2 underline text-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full bg-slate-100">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main Content */}
      <div className={collapsed ? "flex-1" : "flex-1"}>
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />

        <div className="max-w-5xl mx-auto p-4 mt-6">
          <h1 className="text-2xl font-semibold mb-4">Edit Student</h1>

          {/* Pass student to form */}
          <RegistrationForm mode="edit" defaultValues={student.data} id={id} />
        </div>
      </div>
    </div>
  );
}
