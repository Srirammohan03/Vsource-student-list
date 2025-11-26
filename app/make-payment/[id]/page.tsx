"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
// import { Toast } from "@/components/ui/toast";
// import { toast } from "@/components/ui/use-toast";

const paymentOptions = [
  { value: "online", label: "By Online Payment" },
  { value: "cash", label: "By Cash" },
  { value: "cash-deposit", label: "By Cash-Deposit" },
  { value: "neft", label: "By NEFT" },
  { value: "card-swipe", label: "By Card Swipe" },
  { value: "cheque", label: "By Cheque" },
  { value: "link", label: "By Link" },
  { value: "cash-swipe", label: "By Cash & Swipe" },
  { value: "online-cash", label: "By Online & Cash" },
];

export default function PaymentFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [collapsed, setCollapsed] = useState(false);

  const [feeType, setFeeType] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [bankDetails, setBankDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceNo, setReferenceNo] = useState("");

  const needsReferenceNo = [
    "online",
    "neft",
    "cheque",
    "link",
    "cash-swipe",
    "online-cash",
  ].includes(paymentMethod || "");

  // ------------------------------
  // FETCH STUDENT DETAILS
  // ------------------------------
  const fetchStudent = async () => {
    const res = await fetch(`/api/student-registration/${id}`);
    const json = await res.json();
    return json.data;
  };

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: fetchStudent,
  });

  // ------------------------------
  // FETCH PAYMENT HISTORY
  // ------------------------------
  const fetchPayments = async () => {
    const res = await fetch(`/api/payment`);
    const json = await res.json();
    return json.data.filter((p: any) => p.studentId === id);
  };

  const { data: history = [] } = useQuery({
    queryKey: ["payments", id],
    queryFn: fetchPayments,
  });

  // ------------------------------
  // SUBMIT PAYMENT MUTATION
  // ------------------------------
  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        studentId: id,
        feeType,
        subFeeType: null,
        paymentMethod,
        amount: Number(amount),
        bankDetails,
        referenceNo,
      };

      const res = await fetch("/api/payment", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Payment entry created.",
      });

      queryClient.invalidateQueries(["payments", id]);
      router.push("/make-payment");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Loading...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Student not found.
      </div>
    );
  }

  return (
    <div className="flex w-full bg-slate-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex-1">
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />

        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Make Payments</h1>

          {/* PAYMENT FORM */}
          <div className="rounded-xl bg-white border shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-10">
              {/* LEFT */}
              <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Student:</span>{" "}
                  {student.studentName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {student.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Service Fee:</span>{" "}
                  {student.serviceCharge}
                </p>
              </div>

              {/* RIGHT — FORM */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Fee Type */}
                  <div>
                    <label className="text-[11px] font-medium uppercase">
                      Fee Type
                    </label>
                    <Select onValueChange={setFeeType}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service-fee">Service Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-[11px] font-medium uppercase">
                      Payment Method
                    </label>
                    <Select onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentOptions.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bank */}
                <div>
                  <label className="text-[11px] font-medium uppercase">
                    Company Bank
                  </label>
                  <Input
                    className="h-9"
                    placeholder="Bank Name"
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-[11px] font-medium uppercase">
                    Amount
                  </label>
                  <Input
                    className="h-9"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Reference No */}
                {needsReferenceNo && (
                  <div>
                    <label className="text-[11px] font-medium uppercase">
                      Reference No
                    </label>
                    <Input
                      className="h-9"
                      placeholder="Reference Number"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  className="w-full h-9 mt-3"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate()}
                >
                  {mutation.isPending ? "Saving..." : "Submit Payment"}
                </Button>
              </div>
            </div>
          </div>

          {/* PAYMENT HISTORY TABLE */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>

            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No payments found.</p>
            ) : (
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">S.No</th>
                    <th className="p-2 border">Fee Type</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Method</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Invoice</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((p: any, index: number) => (
                    <tr key={p.id}>
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{p.feeType}</td>
                      <td className="p-2 border">{p.amount}</td>
                      <td className="p-2 border">{p.paymentMethod}</td>
                      <td className="p-2 border">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">{p.invoiceNumber}</td>
                      <td className="p-2 border text-green-600">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
