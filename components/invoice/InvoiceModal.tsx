import { useRef } from "react";
import { Button } from "../ui/button";

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
export function InvoiceModal({ data, onClose }: any) {
  if (!data) return null;
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  // Convert inclusive GST amount into base + gst
  const calculateFromInclusiveGST = (inclusive: number, gstRate = 18) => {
    const factor = 1 + gstRate / 100;
    const base = inclusive / factor;
    const gst = inclusive - base;
    return {
      baseAmount: Number(base.toFixed(2)),
      gstAmount: Number(gst.toFixed(2)),
    };
  };
  const p = data;
  const s = p.student;
  const inclusiveAmount = p.amount;
  const { baseAmount, gstAmount } = calculateFromInclusiveGST(
    inclusiveAmount,
    p.gst
  );

  const gst = splitGST(s.state, gstAmount);

  function numberToWordsFormatted(num: number) {
    const a = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];
    const b = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];

    if ((num = num.toString() as any).length > 9) return "OUT OF RANGE";

    const n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{3})$/);
    if (!n) return "";

    let str = "";
    const crore = +n[1];
    const lakh = +n[2];
    const thousand = +n[3];
    const hundred = +n[4];

    if (crore)
      str +=
        (a[crore] || b[Math.floor(crore / 10)] + " " + a[crore % 10]) +
        " CRORE ";

    if (lakh)
      str +=
        (a[lakh] || b[Math.floor(lakh / 10)] + " " + a[lakh % 10]) + " LAKH ";

    if (thousand)
      str +=
        (a[thousand] || b[Math.floor(thousand / 10)] + " " + a[thousand % 10]) +
        " THOUSAND ";

    if (hundred)
      str +=
        (a[hundred] || b[Math.floor(hundred / 10)] + " " + a[hundred % 10]) +
        " ";

    return str.trim();
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
        {/* Header */}
        <h1 className="text-xl font-bold text-center mb-2 uppercase tracking-wide">
          TAX INVOICE
        </h1>

        {/* Top Section */}
        <div className="border border-black">
          <div className="grid grid-cols-2">
            {/* LEFT SIDE */}
            <div className="border-r border-black p-3 leading-tight text-[13px]">
              <p className="font-semibold">FROM:</p>
              <p>{COMPANY.name}</p>
              <p>{COMPANY.address}</p>
              <p>MOBILE: +91 9160411119</p>
            </div>

            {/* RIGHT SIDE — EXACT STRUCTURE FROM IMAGE */}
            <div className="text-[13px] leading-tight">
              <div className="grid grid-cols-2 border-b border-black">
                {/* INVOICE NO BOX */}
                <div className="border-r border-black p-2">
                  <p className="font-bold uppercase">INVOICE NO.</p>
                  <p className="mt-1">{p.invoiceNumber}</p>
                </div>

                {/* DATED BOX */}
                <div className="p-2">
                  <p className="font-bold uppercase">DATED</p>
                  <p className="mt-1">
                    {new Date(p.date)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      .replace(/ /g, " ")
                      .toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Row 3 — CIN | GST No | SID stacked */}
              <div className="p-2 space-y-2">
                <p>
                  <strong>CIN:</strong> {COMPANY.cin}
                </p>
                <p>
                  <strong>GST NO:</strong> {COMPANY.gstNo}
                </p>
                <p>
                  <strong>SID:</strong> {COMPANY.cin}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice To Section */}
        <div className="border border-black border-t-0 p-3 text-sm">
          <p className="font-bold uppercase">Invoice To:</p>
          <p className="">
            {s.studentName}{" "}
            {s.gender?.toLowerCase() === "female" ? "D/O" : "S/O"}{" "}
            {s.fathersName}
          </p>
          <p className="text-sm">
            ADDRESS:
            {s.addressLine1 && ` ${s.addressLine1},`}
            {s.addressLine2 && ` ${s.addressLine2},`}
            {s.district && ` ${s.district},`}
            {s.city && ` ${s.city},`}
            {s.state && ` ${s.state},`}
            {s.country && ` ${s.country},`}
            {s.pincode && ` ${s.pincode}`}
            <br />
            {s.mobileNumber}
            {s.parentMobile ? ` / ${s.parentMobile}` : ""}
          </p>
        </div>

        {/* TABLE — EXACT REFERENCE MATCH */}
        <table className="w-full border border-black text-sm">
          <thead>
            <tr className="text-center uppercase text-sm">
              <th className="border border-black p-1 w-10">S NO</th>
              <th className="border border-black p-1">DESCRIPTION</th>
              <th className="border border-black p-1 w-14">HSN/SAC</th>
              <th className="border border-black p-1 w-10">QTY</th>
              <th className="border border-black p-1 w-24">RATE</th>
              <th className="border border-black p-1 w-20">IGST 18%</th>
              <th className="border border-black p-1 w-20">CGST 9%</th>
              <th className="border border-black p-1 w-20">SGST 9%</th>
              <th className="border border-black p-1 w-24">AMOUNT</th>
            </tr>
          </thead>

          <tbody>
            <tr className="text-center">
              <td className="border border-black p-1">1</td>

              <td className="border border-black p-1">
                {s.feeType || "SERVICE CHARGE"}
                <br />
                {s.abroadMasters}
              </td>

              <td className="border border-black p-1">9992</td>

              <td className="border border-black p-1">1</td>

              <td className="border border-black p-1">
                {baseAmount.toFixed(2)}
              </td>

              <td className="border border-black p-1">{gst.igst}</td>

              <td className="border border-black p-1">{gst.cgst}</td>

              <td className="border border-black p-1">{gst.sgst}</td>

              <td className="border border-black p-1">
                {inclusiveAmount.toFixed(2)}
              </td>
            </tr>

            {/* TOTAL ROW — SAME AS REFERENCE */}
            <tr className="text-center font-bold">
              <td className="border border-black p-1" colSpan={8}>
                TOTAL
              </td>
              <td className="border border-black p-1">
                {inclusiveAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* AMOUNT SECTION — WITH MIDDLE VERTICAL LINE */}
        <div className="border border-black border-t-0 grid grid-cols-2 text-sm leading-tight">
          {/* Left side */}
          <div className="p-3 border-r border-black">
            <p className="font-bold uppercase">AMOUNT</p>
            <p className="italic mt-1">
              {numberToWordsFormatted(inclusiveAmount)} RUPEES ONLY
            </p>
            <p className="text-sm mt-1">
              ({p.paymentMethod.toUpperCase()}:{p.referenceNo})
            </p>
          </div>

          {/* Right side */}
          <div className="p-3 flex justify-end items-start text-sm">
            <p className="font-semibold">E.& O.E.</p>
          </div>
        </div>

        {/* BANK + STAMP SECTION — PERFECT MIDDLE LINE */}
        <div className="grid grid-cols-2 border border-black border-t-0">
          {/* Bank Details LEFT */}
          <div className="border-r border-black p-3 text-sm leading-tight">
            <p className="font-bold uppercase">BANK DETAILS:</p>
            <p>BANK NAME: HDFC BANK</p>
            <p>A/c Name: VSOURCE VARSITY PRIVATE LIMITED </p>
            <p>A/C NO: 99999160141119</p>
            <p>A/C TYPE: CURRENT</p>
            <p>IFSC:- HDFC0004326</p>
            <p>MOOSARAMBAGH BRANCH ,</p>
            <p>HYDERABAD, TELANGANA</p>
          </div>

          {/* Stamp & Right Text */}
          <div className="p-3 flex flex-col items-center justify-center text-center">
            <p className="uppercase text-sm font-semibold mb-2">
              FOR VSOURCE VARSITY CONSULTANTS PVT. LTD
            </p>

            <img src="/assets/stamp.jpg" className="w-60 mb-2" alt="Stamp" />

            <p className="text-sm uppercase">AUTHORIZED SIGNATORY</p>
          </div>
        </div>

        {/* TERMS & RECEIVER SIGNATURE — WITH MIDDLE LINE */}
        <div className="grid grid-cols-2 border border-black border-t-0 text-[13px] leading-tight">
          {/* Terms Left */}
          <div className="border-r border-black p-3">
            <p className="font-bold uppercase mb-2">TERMS & CONDITIONS:</p>
            <p>1) INCASE OF CANCELLATION AMOUNT WILL NOT BE REFUNDED</p>
            <p>2) SUBJECT TO HYDERABAD JURISDICTION ONLY</p>
          </div>

          {/* Receiver Signature Right */}
          <div className="p-3 flex justify-end items-end pr-10">
            <p className="text-[13px] uppercase">RECEIVER SIGNATURE</p>
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
