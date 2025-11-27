"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import api from "@/lib/axios"; // your axios instance
import { Button } from "@/components/ui/button";

// ---------- Types ----------
interface StudentRegistration {
  id: string;
  stid: string;
  studentName: string;
  email: string;
  mobileNumber: string;
  abroadMasters: string;
}

interface Payment {
  id: string;
  feeType: string;
  paymentMethod: string;
  amount: number;
  invoiceNumber: string;
  status: "APPROVED" | "PENDING" | "FAILED";
  bankDetails: string;
  gst?: number | null;
  gstAmount?: number | null;
  referenceNo?: string | null;
  date: string;
  student: StudentRegistration;
}

// ---------- Static company info ----------
const COMPANY = {
  name: "VSOURCE VARSITY PRIVATE LIMITED",
  address:
    "#PLOT NO:13, VASANTH NAGAR, DHARMA REDDY COLONY PHASE-2, KPHB COLONY, HYDERABAD - 500085",
  gstNo: "36AAKCV9728P1Z8",
  cin: "U85499TS2025PTC197291",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US");
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  // ----- Fetch invoice -----
  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setErr(null);

        // 👇 change this if your route is different
        const res = await api.get<Payment>(`/api/payments/${id}`);
        setInvoice(res.data);
      } catch (error) {
        console.error(error);
        setErr("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  // ----- Print & PDF -----
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoice?.invoiceNumber || "invoice"}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading invoice…</span>
      </div>
    );
  }

  if (err || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {err || "Invoice not found"}
      </div>
    );
  }

  const student = invoice.student;
  const baseAmount = invoice.amount || 0;
  const gstAmount = invoice.gstAmount || 0;
  const halfGst = gstAmount / 2;
  const total = baseAmount + gstAmount;

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center px-4">
      {/* MODAL / CARD */}
      <div
        ref={invoiceRef}
        className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-8 print:w-[210mm] print:min-h-[297mm] print:rounded-none print:shadow-none"
      >
        {/* CLOSE BUTTON (only screen) */}
        <button
          onClick={() => router.back()}
          className="no-print absolute right-5 top-5 rounded-full border border-gray-300 p-1 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold tracking-wide">TAX INVOICE</h1>
          <p className="text-xs text-gray-600 mt-1">{COMPANY.address}</p>
        </div>

        {/* INVOICE META ROW */}
        <div className="flex justify-between text-sm mb-4">
          <div className="space-y-1">
            <p>
              <span className="font-semibold">:</span>{" "}
              {invoice.invoiceNumber}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(invoice.date)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p>
              <span className="font-semibold">GST NO:</span> {COMPANY.gstNo}
            </p>
            <p>
              <span className="font-semibold">CIN:</span> {COMPANY.cin}
            </p>
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* STUDENT DETAILS */}
        <div className="text-sm mb-4 space-y-1">
          <p>
            <span className="font-semibold">Student Name:</span>{" "}
            {student.studentName}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {student.email}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {student.mobileNumber}
          </p>
          <p>
            <span className="font-semibold">Masters:</span>{" "}
            {student.abroadMasters}
          </p>
        </div>

        {/* TABLE */}
        <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 border-b border-gray-200">
                  Description
                </th>
                <th className="text-right px-4 py-2 border-b border-gray-200">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2">Service Fee</td>
                <td className="px-4 py-2 text-right">
                  ₹{baseAmount.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2">CGST</td>
                <td className="px-4 py-2 text-right">₹{halfGst.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2">SGST</td>
                <td className="px-4 py-2 text-right">₹{halfGst.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2">IGST</td>
                <td className="px-4 py-2 text-right">₹0.00</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 font-semibold">Total</td>
                <td className="px-4 py-2 text-right font-semibold">
                  ₹
                  {total.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PAYMENT LINE */}
        <p className="text-sm mb-6">
          <span className="font-semibold">Payment:</span>{" "}
          {invoice.paymentMethod.toLowerCase()}{" "}
          {invoice.referenceNo ? `- ${invoice.referenceNo}` : ""}
        </p>

        {/* STAMP ROW */}
        <div className="flex items-end justify-between">
          <div>{/* Extra space if you ever want terms */}</div>
          <div className="flex flex-col items-center">
            <Image
              src="/assets/stamp.jpg"
              alt="Stamp"
              width={90}
              height={90}
              className="object-contain"
            />
            <span className="text-[11px] mt-1 text-gray-700">
              Authorised Signatory
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (NOT PRINTED) */}
      <div className="no-print fixed bottom-6 right-6 flex gap-3">
        <Button variant="outline" onClick={handleDownloadPdf}>
          Download PDF
        </Button>
        <Button onClick={handlePrint}>Print A4</Button>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
