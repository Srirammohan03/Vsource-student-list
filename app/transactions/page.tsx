"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import * as XLSX from "xlsx";
import { FileDown, Loader2, Scroll, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { paymentOptions } from "../make-payment/[id]/page";
import Image from "next/image";
import { toWords } from "number-to-words";
const COMPANY = {
  name: "VSOURCE VARSITY PRIVATE LIMITED",
  address:
    "#PLOT NO:13, VASANTH NAGAR, DHARMA REDDY COLONY PHASE-2, KPHB COLONY, HYDERABAD - 500085 ",
  gstNo: "36AAKCV9728P1Z8",
  cin: "U85499TS2025PTC197291",
};
const splitGST = (state: string | undefined, totalGst: number) => {
  if (!state) return { cgst: "0", sgst: "0", igst: totalGst.toFixed(2) };
  if (state.toUpperCase() === "TELANGANA") {
    const half = (totalGst / 2).toFixed(2);
    return { cgst: half, sgst: half, igst: "0.00" };
  }
  return { cgst: "0.00", sgst: "0.00", igst: totalGst.toFixed(2) };
};
function InvoiceModal({ data, onClose }: any) {
  if (!data) return null;
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  const p = data;
  const s = p.student;
  const gst = splitGST(s.state, p.gstAmount || 0);
  function numberToWords(num: number) {
    const words = toWords(num).toUpperCase();
    return words;
  }
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
    pdf.save(`${p?.invoiceNumber || "invoice"}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center py-10 z-50 overflow-y-auto">
      <div
        ref={invoiceRef}
        className="bg-white w-[210mm] min-h-[297mm] p-6 shadow-lg relative border border-gray-400 text-[13px] font-[Calibri] leading-tight"
      >
        {/* Close Button */}
        {/* <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button> */}

        {/* Header */}
        <h1 className="text-xl font-bold text-center mb-2 uppercase tracking-wide">
          TAX INVOICE
        </h1>

        {/* Top Section */}
        <div className="grid grid-cols-2 border border-gray-500">
          {/* Left Box */}
          <div className="p-3 border-r border-gray-500">
            <p>
              <span>From:</span>
              <br /> {COMPANY.name}
            </p>
            <p>
              <span>ADDRESS:</span> {COMPANY.address}
              <br />
              Mobile: +91 9160411119
            </p>
          </div>

          {/* Right Box */}
          <div className="p-3 text-sm">
            <p>
              <strong>Invoice No.</strong> {p.invoiceNumber}
            </p>
            <p>
              <strong>Dated </strong>
              {new Date(p.date).toLocaleDateString()}
            </p>
            <p>
              <strong>CIN:</strong> U80904TG2017PTC116397
            </p>
            <p>
              <strong>GST NO.</strong> 36AAFCV8632D1Z9
            </p>
            <p>
              <strong>SID:</strong> ABMS1
            </p>
          </div>
        </div>

        {/* Invoice To Section */}
        <div className="border border-gray-500 border-t-0 p-3 text-sm">
          <p className="font-bold uppercase">Invoice To:</p>
          <p className="">
            {s.studentName} S/O {s.fathersName}
          </p>
          <p className="text-xs">
            ADDRESS: H NO:- {s.addressLine1 || "Not Provided"}{" "}
            {s.addressLine2 || "Not Provided"} <br />
            {s.mobileNumber} {","} {s.parentMobile}
          </p>
        </div>

        {/* Table */}
        <table className="w-full mt-2 border border-gray-500 text-xs">
          <thead>
            <tr className="bg-gray-100 text-center uppercase text-[11px]">
              <th className="border p-1 w-12">S No</th>
              <th className="border p-1">Description</th>
              <th className="border p-1 w-16">HSN/SAC</th>
              <th className="border p-1 w-10">QTY</th>
              <th className="border p-1 w-20">Rate</th>
              <th className="border p-1 w-20">IGST 18%</th>
              <th className="border p-1 w-20">CGST 9%</th>
              <th className="border p-1 w-20">SGST 9%</th>
              <th className="border p-1 w-24">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className="text-center">
              <td className="border p-1">1</td>
              <td className="border p-1">
                {s.feeType}
                <br />
                {s.abroadMasters}
              </td>
              <td className="border p-1">9992</td>
              <td className="border p-1">1</td>
              <td className="border p-1">₹{p.amount}</td>
              <td className="border p-1">₹{gst.igst}</td>
              <td className="border p-1">₹{gst.cgst}</td>
              <td className="border p-1">₹{gst.sgst}</td>
              <td className="border p-1">₹{p.amount + (p.gstAmount || 0)}</td>
            </tr>
            <tr className="text-right font-bold">
              <td className="border p-1 text-center" colSpan={8}>
                TOTAL
              </td>
              <td className="border p-1">
                ₹{(p.amount + (p.gstAmount || 0)).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words and notes */}
        <div className="border border-gray-500 border-t-0 p-3 text-xs">
          <p>
            <strong>Amount:</strong> {numberToWords(p.amount)}
          </p>
          <p className="mt-1">
            <strong>
              ({p.paymentMethod.toUpperCase()} -
              {p.paymentMethod ? p.referenceNo : ""})
            </strong>
          </p>
        </div>

        {/* Bank Details & Stamp Section */}
        <div className="grid grid-cols-2 border border-gray-500 border-t-0">
          {/* Bank Details */}
          <div className="p-3 text-xs border-r border-gray-500 leading-tight">
            <p className="font-bold uppercase">Bank Details:</p>
            <p>BANK NAME: HDFC BANK</p>
            <p>A/C NAME: VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD</p>
            <p>A/C NO: 59209160411119</p>
            <p>A/C TYPE: CURRENT</p>
            <p>IFSC:- HDFC0004326</p>
            <p>MOSARAMBAGH BRANCH , HYDERABAD, TELANGANA</p>
          </div>

          {/* Stamp */}
          <div className="p-3 flex flex-col items-center justify-between">
            <img src="/assets/stamp.jpg" className="w-52 opacity-95" />
            <p className="text-[11px] font-semibold mt-2 text-center">
              FOR VSOURCE EDUCATIONAL CONSULTANTS PVT. LTD
            </p>
            <p className="text-[11px] mt-6">AUTHORIZED SIGNATORY</p>
          </div>
        </div>

        {/* Terms & Receiver Signature */}
        <div className="border border-gray-500 border-t-0 p-3 grid grid-cols-2 text-xs">
          <div>
            <p className="font-bold uppercase mb-2">Terms & Conditions:</p>
            <p>1) INCASE OF CANCELLATION AMOUNT WILL NOT BE REFUNDED</p>
            <p>2) SUBJECT TO HYDERABAD JURISDICTION ONLY</p>
          </div>
          <div className="flex justify-end items-end pr-20">
            <p>RECEIVER SIGNATURE</p>
          </div>
        </div>
      </div>
      <div className="no-print fixed bottom-6 right-6 flex gap-3">
        <Button variant="outline" onClick={handleDownloadPdf}>
          Download PDF
        </Button>
        <Button onClick={handlePrint}>Print A4</Button>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [collapsed, setCollapsed] = useState(false);

  // Filters
  const [masters, setMasters] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const [openInvoice, setOpenInvoice] = useState<any>(null);
  const [openEdit, setOpenEdit] = useState<any>(null);
  const queryClient = useQueryClient();

  const [editForm, setEditForm] = useState({
    feeType: "",
    paymentMethod: "",
    amount: "",
    status: "",
  });

  useEffect(() => {
    if (openEdit) {
      setEditForm({
        feeType: openEdit?.feeType || "",
        paymentMethod: openEdit?.paymentMethod || "",
        amount: openEdit?.amount || "",
        status: openEdit?.status || "", // ✅ added
      });
    }
  }, [openEdit]);

  // Fetch payments
  const fetchPayments = async () => {
    const res = await api.get(`/api/payment?status=APPROVED`);
    return res.data.data;
  };

  const { data = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchPayments,
    placeholderData: keepPreviousData,
  });

  // Filter logic
  const filtered = useMemo(() => {
    return data.filter((pay: any) => {
      const s = pay.student;

      if (masters !== "ALL" && masters && s.abroadMasters !== masters)
        return false;

      if (team !== "ALL" && team && s.processedBy !== team) return false;

      if (year !== "ALL" && year && s.academicYear !== year) return false;

      if (fromDate && new Date(pay.date) < new Date(fromDate)) return false;
      if (toDate && new Date(pay.date) > new Date(toDate)) return false;

      if (search) {
        const v = search.toLowerCase();
        if (
          !(
            s.studentName.toLowerCase().includes(v) ||
            s.email.toLowerCase().includes(v) ||
            s.mobileNumber.includes(v)
          )
        )
          return false;
      }
      return true;
    });
  }, [data, masters, team, year, fromDate, toDate, search]);

  // Excel Export
  const exportExcel = () => {
    const rows = filtered.map((p: any) => ({
      Invoice: p.invoiceNumber,
      Student: p.student.studentName,
      Masters: p.student.abroadMasters,
      Amount: p.amount,
      Method: p.paymentMethod,
      Date: new Date(p.date).toLocaleDateString(),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Transactions");
    XLSX.writeFile(book, "transactions.xlsx");
  };

  const updatePaymentMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await api.patch(
        `/api/payment/${updatedData.id}`,
        updatedData
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setOpenEdit(null);
    },
  });
  return (
    <div className="flex w-full bg-slate-100 min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="flex-1 min-h-screen">
        <TopNav
          sidebarCollapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />

        <Card className="p-6 m-4 shadow-md bg-white">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>

          {/* Filters */}
          <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6">
            {/* Masters */}
            <div>
              <label className="text-sm font-medium">Abroad Masters</label>
              <Select onValueChange={setMasters}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ABROADMASTERS-USA">USA</SelectItem>
                  <SelectItem value="ABROADMASTERS-UK">UK</SelectItem>
                  <SelectItem value="ABROADMASTERS-AUSTRALIA">
                    Australia
                  </SelectItem>
                  <SelectItem value="ABROADMASTERS-CANADA">Canada</SelectItem>
                  <SelectItem value="ABROADMASTERS-GERMANY">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team */}
            <div>
              <label className="text-sm font-medium">Team</label>
              <Select onValueChange={setTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="TEAM-1">TEAM-1</SelectItem>
                  <SelectItem value="TEAM-2">TEAM-2</SelectItem>
                  <SelectItem value="TEAM-ONLINE">TEAM-ONLINE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-medium">Year</label>
              <Select onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="SPRING-2024">SPRING-2024</SelectItem>
                  <SelectItem value="SPRING-2025">SPRING-2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">From</label>
              <Input
                type="date"
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">To</label>
              <Input type="date" onChange={(e) => setToDate(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Export */}
          <Button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 mb-4 flex gap-2"
          >
            <FileDown className="w-4 h-4" /> Export Excel
          </Button>

          {/* Table */}
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Student Id</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Counsellor</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Mobile No</TableHead>
                  <TableHead>Masters</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Approve</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((p: any, i: number) => (
                  <TableRow key={p.id || i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{p?.student?.stid}</TableCell>
                    <TableCell>{p?.student?.processedBy}</TableCell>
                    <TableCell>{p?.student?.assigneeName}</TableCell>
                    <TableCell>{p?.student?.counselorName}</TableCell>

                    <TableCell>{p?.student?.studentName}</TableCell>
                    <TableCell>{p?.student?.mobileNumber}</TableCell>

                    <TableCell>{p?.student?.abroadMasters}</TableCell>

                    <TableCell>₹{p?.amount}</TableCell>
                    <TableCell>{p?.paymentMethod}</TableCell>

                    <TableCell>
                      {new Date(p?.date).toLocaleDateString()}
                    </TableCell>

                    <TableCell>{p?.invoiceNumber}</TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setOpenEdit(p)}
                      >
                        Edit
                      </Button>
                    </TableCell>

                    {/* Invoice Button */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex gap-2"
                        onClick={() => setOpenInvoice(p)}
                      >
                        <Scroll className="w-4 h-4" />
                        Open
                      </Button>
                    </TableCell>

                    {/* Approve */}
                    <TableCell>
                      <span className="text-green-600 font-semibold">
                        Approved
                      </span>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Invoice Modal */}
      {openInvoice && (
        <InvoiceModal data={openInvoice} onClose={() => setOpenInvoice(null)} />
      )}

      <Dialog open={!!openEdit} onOpenChange={() => setOpenEdit(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Information</DialogTitle>
          </DialogHeader>

          {openEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              <Input
                value={openEdit?.student?.studentName}
                readOnly
                className="bg-gray-100"
              />

              <Input
                value={openEdit?.student?.mobileNumber}
                readOnly
                className="bg-gray-100"
              />

              <Input
                value={openEdit?.student?.abroadMasters}
                readOnly
                className="bg-gray-100"
              />

              <Select
                value={editForm.feeType}
                onValueChange={(v) => setEditForm({ ...editForm, feeType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service-fee">Service Fee</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={editForm.paymentMethod}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, paymentMethod: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentOptions.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* <Select
                value={editForm.companyBank}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, companyBank: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Company Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HDFC Bank">HDFC</SelectItem>
                  <SelectItem value="SBI Bank">SBI</SelectItem>
                </SelectContent>
              </Select> */}
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updatePaymentMutation?.isPending}
              onClick={() => {
                const payload = { ...editForm };
                updatePaymentMutation.mutate({
                  id: openEdit.id,
                  ...payload,
                });
              }}
            >
              {updatePaymentMutation.isPending ? "Saving..." : "Submit"}
            </Button>

            <Button variant="default" onClick={() => setOpenEdit(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
