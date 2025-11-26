import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

function generateInvoiceNumber(lastInvoice?: string) {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const shortYear = currentYear.toString().slice(2);
  const shortNext = nextYear.toString().slice(2);
  const yearRange = `${shortYear}-${shortNext}`;

  let nextNumber = 1;
  if (lastInvoice) {
    const match = lastInvoice.match(/B(\d+)$/);
    nextNumber = match ? parseInt(match[1]) + 1 : 1;
  }

  return `VS/${yearRange}/B${nextNumber.toString().padStart(2, "0")}`;
}

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  console.log(body)
  if (
    !body.studentId ||
    !body.feeType ||
    !body.paymentMethod ||
    !body.amount ||
    !body.bankDetails
  ) {
    throw new ApiError(
      400,
      "studentId, feeType, paymentMethod, amount, and bankDetails are required"
    );
  }

  if (body.amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  const student = await prisma.studentRegistration.findUnique({
    where: { id: body.studentId },
    include: { payment: true },
  });

  if (!student) throw new ApiError(404, "Student not found");

  if (student.status !== "CONFIRMED") {
    throw new ApiError(400, "Payment allowed only for confirmed students");
  }

  if (student.payment) {
    throw new ApiError(400, "This student already has a payment record");
  }

  const lastPayment = await prisma.payment.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const nextInvoiceNumber = generateInvoiceNumber(lastPayment?.invoiceNumber);

  const payment = await prisma.payment.create({
    data: {
      feeType: body.feeType,
      subFeeType: body.subFeeType || null,
      paymentMethod: body.paymentMethod,
      amount: body.amount,
      bankDetails: body.bankDetails,
      invoiceNumber: nextInvoiceNumber,
      studentId: body.studentId,
      gst: body.gst,
      gstAmount: body.gstAmount,
      referenceNo: body.referenceNo,
    },
  });

  return NextResponse.json(
    new ApiResponse(201, payment, "Payment created successfully")
  );
});

export const GET = apiHandler(async (_req: Request) => {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          id: true,
          stid: true,
          studentName: true,
          mobileNumber: true,
          abroadMasters: true,
          serviceCharge: true,
          status: true,
        },
      },
    },
  });
  if (!payments) throw new ApiError(404, "No payments found");

  return NextResponse.json(
    new ApiResponse(200, payments, "payment fetched successfully")
  );
});
