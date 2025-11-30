"use client";

import { useQuery } from "@tanstack/react-query";
import RegistrationForm from "@/components/student-registration/RegistrationForm";
import axios from "axios";

export default function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-registration", id],
    queryFn: async () => {
      const res = await axios.get(`/api/student-registration/${id}`, {
        withCredentials: true,
      });
      const student = res.data.data;

      return {
        ...student,
        // normalize for <input type="date" />
        dateOfBirth: student.dateOfBirth
          ? student.dateOfBirth.slice(0, 10)
          : "",
        registrationDate: student.registrationDate
          ? student.registrationDate.slice(0, 10)
          : "",
      };
    },
  });

  if (isLoading) {
    return <p className="p-4">Loading...</p>;
  }

  if (isError || !data) {
    return <p className="p-4 text-red-500">Failed to load student</p>;
  }

  return (
    <div className="p-4">
      <RegistrationForm mode="edit" id={id} defaultValues={data} />
    </div>
  );
}
