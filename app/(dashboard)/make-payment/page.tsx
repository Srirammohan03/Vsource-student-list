"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

export default function MakePaymentPage() {
  const router = useRouter();

  const fetchConfirmedStudents = async () => {
    const { data } = await axios.get(
      "/api/student-registration?status=CONFIRMED",
      {
        withCredentials: true,
      }
    );
    return data;
  };
  const {
    data: students,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["confirmed-students"],
    queryFn: fetchConfirmedStudents,
    placeholderData: keepPreviousData,
  });
  if (isError) {
    toast({
      title: error.message,
      description: "failed to load",
    });
    console.log(error.message, error);
  }
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Make Payments</h1>

      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
        <table className="min-w-full text-sm border">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Student Name</th>
              <th className="p-3 border">Mobile</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Abroad-Masters</th>
              <th className="p-3 border">Service Fee</th>
              <th className="p-3 border text-center">Make Payment</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-500">
                  Loading...
                </td>
              </tr>
            )}

            {!isLoading &&
              students?.data?.map((item: any, index: number) => {
                return (
                  <tr
                    key={item?.id}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{item?.studentName}</td>
                    <td className="p-3 border">{item?.mobileNumber}</td>
                    <td className="p-3 border">{item?.email}</td>
                    <td className="p-3 border">{item?.abroadMasters}</td>
                    <td className="p-3 border">{item?.serviceCharge}</td>

                    <td className="p-3 border text-center">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push(`/make-payment/${item?.id}`)}
                      >
                        +
                      </Button>
                    </td>

                    <td className="p-3 border text-green-600 font-semibold">
                      {item.status}
                    </td>
                  </tr>
                );
              })}

            {!isLoading && students.data.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-500">
                  {students.message}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
