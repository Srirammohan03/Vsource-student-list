"use client";

import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

// ---------------------------
// Convert Amount -> Words
// ---------------------------
function numberToWords(num: number): string {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred " +
        (n % 100 !== 0 ? inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand " +
        (n % 1000 !== 0 ? inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " Lakh " +
        (n % 100000 !== 0 ? inWords(n % 100000) : "")
      );
    return "";
  }

  return inWords(num).trim() + " Rupees Only";
}

export default function InvoicePage() {
  const { id } = useParams();

  // ---------------------------
  // Fetch Payment + Student
  // ---------------------------
  const fetchPayment = async () => {
    const res = await api.get(`/api/payment/${id}`);
    return res.data.data;
  };

  const { data: payment, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: fetchPayment,
  });

  const printInvoice = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading invoice...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Invoice not found.
      </div>
    );
  }

  // ---------------------------
  // GST Logic
  // ---------------------------
  const isTelangana = payment.student.state?.toLowerCase() === "telangana";

  const gstPercent = 18;
  const gstAmount = (payment.amount * gstPercent) / 100;
  const cgst = isTelangana ? gstAmount / 2 : 0;
  const sgst = isTelangana ? gstAmount / 2 : 0;
  const igst = !isTelangana ? gstAmount : 0;

  const totalAmount = payment.amount + gstAmount;

  const amountWords = numberToWords(totalAmount);

  // Payment description: (METHOD-REFERENCE(DATE))
  const paymentDesc = `(${payment.paymentMethod.toUpperCase()}-${
    payment.referenceNo
  } (${new Date(payment.date).toLocaleDateString()}))`;

  return (
    <div className="p-6 bg-slate-100 min-h-screen print:bg-white">
      <div className="flex justify-end mb-4 gap-3 no-print">
        <Button onClick={printInvoice}>Print</Button>
      </div>

      {/* A4 Invoice Container */}
      <div className="bg-white shadow-lg mx-auto p-8 rounded-xl A4:size A4:shadow-none">
        {/* HEADER */}
        <div className="text-center border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">TAX INVOICE</h1>
          <p className="text-sm mt-1">VSOURCE VARSITY PRIVATE LIMITED</p>
          <p className="text-xs mt-1">
            #PLOT NO:13, VASANTH NAGAR, DHARMA REDDY COLONY PHASE-2, KPHB
            COLONY, HYDERABAD, TELANGANA - 500085
          </p>
          <p className="text-xs">
            GST NO: 36AAKCV9728P1Z8 | CIN: U85499TS2025PTC197291
          </p>
        </div>

        {/* INVOICE INFO */}
        <div className="grid grid-cols-2 text-sm mb-6">
          <div>
            <p>
              <b>Invoice No:</b> {payment.invoiceNumber}
            </p>
            <p>
              <b>Invoice Date:</b> {new Date(payment.date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p>
              <b>Student Name:</b> {payment.student.studentName}
            </p>
            <p>
              <b>D/O:</b> {payment.student.fathersName}
            </p>
            <p>
              <b>Address:</b> {payment.student.addressLine1},{" "}
              {payment.student.city}, {payment.student.state}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <table className="w-full text-sm border mb-6">
          <thead className="bg-slate-100">
            <tr>
              <th className="border p-2">S.No</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border p-2">1</td>
              <td className="border p-2">{payment.student.abroadMasters}</td>
              <td className="border p-2">{payment.amount.toFixed(2)}</td>
            </tr>

            {/* GST Rows */}
            {isTelangana ? (
              <>
                <tr>
                  <td className="border p-2"></td>
                  <td className="border p-2">CGST (9%)</td>
                  <td className="border p-2">{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border p-2"></td>
                  <td className="border p-2">SGST (9%)</td>
                  <td className="border p-2">{sgst.toFixed(2)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="border p-2"></td>
                <td className="border p-2">IGST (18%)</td>
                <td className="border p-2">{igst.toFixed(2)}</td>
              </tr>
            )}

            <tr className="bg-slate-100 font-semibold">
              <td className="border p-2"></td>
              <td className="border p-2">Total</td>
              <td className="border p-2">{totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* AMOUNT IN WORDS */}
        <p className="text-sm mb-6">
          <b>Amount (In Words):</b> {amountWords} {paymentDesc}
        </p>

        {/* BANK DETAILS */}
        <div className="text-sm mb-6">
          <p className="font-semibold mb-1">Bank Details:</p>
          <p>Bank Name: HDFC BANK</p>
          <p>A/c Name: VSOURCE VARSITY PRIVATE LIMITED</p>
          <p>A/c No: 99999160141119</p>
          <p>IFSC: HDFC0004326</p>
          <p>Branch: MOOSARAMBAGH, Hyderabad, Telangana</p>
        </div>

        <div className="flex justify-end">
          <Image
            src="/assets/stamp.jpg"
            alt="Stamp"
            width={160}
            height={160}
            className="opacity-90"
          />
        </div>
      </div>
    </div>
  );
}
