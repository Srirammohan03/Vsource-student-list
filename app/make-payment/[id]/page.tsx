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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/axios";

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
  const [gstPercent, setGstPercent] = useState("");
  const [gstAmount, setGstAmount] = useState("");

  const needsReferenceNo = [
    "online",
    "neft",
    "cheque",
    "link",
    "cash-swipe",
    "online-cash",
  ].includes(paymentMethod || "");

  const fetchStudent = async () => {
    const res = await api.get(`/api/student-registration/${id}`);
    return res.data;
  };

  const {
    data: student,
    isLoading: isStudentLoading,
    isError: isStudentError,
    error: studentError,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: fetchStudent,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isStudentError) {
      toast({
        title: "Failed to load student",
        description: studentError?.message || "Unable to fetch data",
        variant: "destructive",
      });
    }
  }, [isStudentError, studentError]);

  const fetchPayments = async () => {
    const { data } = await api.get(`/api/payment/${id}`);
    return data?.data;
  };

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
  } = useQuery({
    queryKey: ["payments", id],
    queryFn: fetchPayments,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isHistoryError) {
      toast({
        title: "Failed to load payment history",
        description: historyError?.message || "Unable to fetch records",
        variant: "destructive",
      });
    }
  }, [isHistoryError, historyError]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        studentId: id,
        feeType,
        subFeeType: null,
        paymentMethod,
        amount: Number(amount),
        bankDetails,
        referenceNo: referenceNo || undefined,
        gst: gstPercent ? Number(gstPercent) : undefined,
        gstAmount: gstAmount ? Number(gstAmount) : undefined,
      };
      const res = await api.post("/api/payment", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Payment entry created.",
      });
      queryClient.invalidateQueries({ queryKey: ["payments", id] });
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

  return (
    <div className="flex w-full bg-slate-100 min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1">
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">Make Payments</h1>
          <div className="rounded-xl bg-white border shadow-sm p-6 mb-8">
            {isStudentLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Student:</span>{" "}
                    {student?.data?.studentName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {student?.data?.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Service Fee:</span>{" "}
                    {student?.data?.serviceCharge}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={setFeeType}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service-fee">Service Fee</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Select onValueChange={setBankDetails}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HDFC">HDFC Bank</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    className="h-9"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {feeType === "service-fee" && (
                    <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-slate-50">
                      <Input
                        className="h-9"
                        placeholder="GST %"
                        value={gstPercent}
                        onChange={(e) => setGstPercent(e.target.value)}
                      />
                      <Input
                        className="h-9"
                        placeholder="GST Amount"
                        value={gstAmount}
                        onChange={(e) => setGstAmount(e.target.value)}
                      />
                    </div>
                  )}
                  {needsReferenceNo && (
                    <Input
                      className="h-9"
                      placeholder="Reference Number"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                    />
                  )}
                  <Button
                    className="w-full h-9 mt-3"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate()}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                        Saving...
                      </>
                    ) : (
                      "Submit Payment"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>
            {isHistoryLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    <TableRow>
                      <TableCell>{1}</TableCell>
                      <TableCell>{history?.feeType}</TableCell>
                      <TableCell>{history?.amount}</TableCell>
                      <TableCell>
                        {history?.gst
                          ? `${history?.gst}% (${history?.gstAmount})`
                          : "-"}
                      </TableCell>
                      <TableCell>{history?.paymentMethod}</TableCell>
                      <TableCell>
                        {new Date(history?.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{history?.invoiceNumber}</TableCell>
                      <TableCell className="text-green-600">
                        {history?.status}
                      </TableCell>
                    </TableRow>
                  }
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
