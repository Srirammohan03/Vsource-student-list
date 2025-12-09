"use client";

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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

export const paymentOptions = [
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

  const [feeType, setFeeType] = useState<string>();
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [bankDetails, setBankDetails] = useState("");
  const [amount, setAmount] = useState(0);
  const [referenceNo, setReferenceNo] = useState("");
  const [gstPercent, setGstPercent] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);

  const needsReferenceNo = [
    "online",
    "neft",
    "cheque",
    "link",
    "cash-swipe",
    "online-cash",
  ].includes(paymentMethod || "");

  const fetchStudent = async (id: string) => {
    const { data } = await axios.get(`/api/student-registration/${id}`, {
      withCredentials: true,
    });
    return data?.data;
  };

  const {
    data: student,
    isLoading: isStudentLoading,
    isError: isStudentError,
    error: studentError,
  } = useQuery({
    queryKey: ["student", id],
    queryFn: ({ queryKey }) => fetchStudent(queryKey[1] as string),
    enabled: !!id,
  });

  const totalPaid =
    student?.payment?.reduce(
      (sum: number, p: any) =>
        p.status === "APPROVED" ? sum + Number(p.amount) : sum,
      0
    ) || 0;

  const rawRemaining = (student?.serviceCharge || 0) - (totalPaid || 0);
  const remaining = Math.max(0, rawRemaining);

  useEffect(() => {
    if (feeType === "service-fee") {
      const base = Number(amount) || 0;
      const gst = 18;

      setGstPercent(gst);

      if (base > 0) {
        const calcGstAmount = (base * gst) / 100;
        setGstAmount(Number(calcGstAmount.toFixed(2)));
      } else {
        setGstAmount(0);
      }
    } else {
      // not service-fee → no gst
      setGstPercent(0);
      setGstAmount(0);
    }
  }, [feeType, amount]);

  useEffect(() => {
    if (isStudentError) {
      toast({
        title: "Failed to load student",
        description: (studentError as any)?.message || "Unable to fetch data",
        variant: "destructive",
      });
    }
  }, [isStudentError, studentError]);

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
      const res = await axios.post("/api/payment", payload, {
        withCredentials: true,
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Payment entry created.",
      });
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      router.push("/make-payment");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create payment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const isSubmitDisabled =
    mutation.isPending || isStudentLoading || remaining <= 0;

  // ✅ Client-side check: amount must NOT be greater than remaining
  const handleSubmit = () => {
    if (!feeType || !paymentMethod || !bankDetails || !amount) {
      toast({
        title: "Missing details",
        description: "Please fill fee type, payment method, bank, and amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (amount > remaining) {
      toast({
        title: "Invalid amount",
        description: "Entered amount is greater than remaining balance.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate();
  };

  return (
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
                {student?.studentName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {student?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Service Fee:</span>{" "}
                {student?.serviceCharge}
              </p>
              <p className="text-sm">
                <span className="font-medium">Total Paid:</span> {totalPaid}
              </p>
              <p className="text-sm">
                <span className="font-medium">Remaining:</span> {remaining}
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

              <div className="space-y-1">
                <Input
                  type="number"
                  className="h-9"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) =>
                    setAmount(Math.max(0, Number(e.target.value)))
                  }
                />
                {/* {remaining > 0 && (
                  <p className="text-xs text-slate-500">
                    You can pay up to{" "}
                    <span className="font-medium">{remaining}</span> only.
                  </p>
                )} */}
                {amount > remaining && remaining > 0 && (
                  <p className="text-xs text-red-600">
                    Entered amount is greater than remaining. Please check
                    amount.
                  </p>
                )}
              </div>

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
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                  </>
                ) : remaining <= 0 ? (
                  "Fully Paid"
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

        {isStudentLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !student?.payment || student.payment.length === 0 ? (
          <p>No Payment history found</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Sub Fee Type</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Type of Payment</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.payment.map((p: any, idx: number) => (
                  <TableRow key={p.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{p.feeType?.toUpperCase()}</TableCell>
                    <TableCell>{p.subFeeType || "S.C (GST)"}</TableCell>
                    <TableCell>{p.amount}</TableCell>
                    <TableCell>{p.paymentMethod}</TableCell>
                    <TableCell>{p.invoiceNumber}</TableCell>
                    <TableCell>
                      {new Date(p.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className={
                        p.status === "APPROVED"
                          ? "text-green-600"
                          : p.status === "FAILED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                    >
                      {p.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
