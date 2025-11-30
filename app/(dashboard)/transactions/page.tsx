"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import axios from "axios";
// import { paymentOptions } from "../make-payment/[id]/page";

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
    invoiceNumber: "",
    date: "",
  });
  useEffect(() => {
    if (openEdit) {
      const formattedDate = openEdit.date ? openEdit.date.split("T")[0] : "";

      setEditForm({
        feeType: openEdit.feeType || "",
        paymentMethod: openEdit.paymentMethod || "",
        amount: openEdit.amount || "",
        status: openEdit.status || "",
        invoiceNumber: openEdit.invoiceNumber || "",
        date: formattedDate,
      });
    }
  }, [openEdit]);

  // Fetch payments
  const fetchPayments = async () => {
    const res = await axios.get(`/api/payment?status=APPROVED`, {
      withCredentials: true,
    });
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
      const res = await axios.patch(
        `/api/payment/${updatedData.id}`,
        updatedData,
        {
          withCredentials: true,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setOpenEdit(null);
    },
  });
  return (
    <>
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
            <Input type="date" onChange={(e) => setFromDate(e.target.value)} />
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
                      onClick={() => {
                        console.log(p);
                        setOpenEdit(p);
                      }}
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
                      onClick={() => window.open(`/invoice/${p.id}`, "_blank")}
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

      {/* Invoice Modal */}
      {/* {openInvoice && (
        <InvoiceModal data={openInvoice} onClose={() => setOpenInvoice(null)} />
      )} */}

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

              <Input
                value={editForm.invoiceNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, invoiceNumber: e.target.value })
                }
              />

              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updatePaymentMutation?.isPending}
              onClick={() => {
                const payload = {
                  ...editForm,
                  amount: Number(editForm.amount), // convert to number
                  date: editForm.date
                    ? new Date(editForm.date).toISOString()
                    : null,
                };

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
    </>
  );
}
