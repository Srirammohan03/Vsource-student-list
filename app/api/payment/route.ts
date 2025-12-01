import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
  return `VV/${yearRange}/B${nextNumber.toString().padStart(2, "0")}`;
}

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

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

  const token = cookies().get("token")?.value;
  let currentUser: { id: string; role: string | null } | null = null;

  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded: any;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
    currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
      },
    });
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
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

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const shortYear = currentYear.toString().slice(2);
  const shortNext = nextYear.toString().slice(2);
  const yearRange = `${shortYear}-${shortNext}`;

  const payment = await prisma.$transaction(async (tx) => {
    const lastPayment = await tx.payment.findFirst({
      where: {
        invoiceNumber: { startsWith: `VV/${yearRange}/` },
      },
      orderBy: { invoiceNumber: "desc" },
    });

    let nextInvoiceNumber = generateInvoiceNumber(lastPayment?.invoiceNumber);

    let exists = await tx.payment.findUnique({
      where: { invoiceNumber: nextInvoiceNumber },
    });

    while (exists) {
      const match = nextInvoiceNumber.match(/B(\d+)$/);
      let num = match ? parseInt(match[1]) + 1 : 1;
      nextInvoiceNumber = `VV/${yearRange}/B${num.toString().padStart(2, "0")}`;
      exists = await tx.payment.findUnique({
        where: { invoiceNumber: nextInvoiceNumber },
      });
    }

    return await tx.payment.create({
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
        status: "APPROVED",
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "CREATE",
      module: "Payment",
      recordId: payment.id,
      oldValues: undefined,
      newValues: payment,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(201, payment, "Payment created successfully")
  );
});

export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams?.get("status") as PaymentStatus | null;

  const token = cookies().get("token")?.value;
  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded: any;
  let currentUser: any;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
    currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });

    if (!currentUser) throw new ApiError(401, "User not found");
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  // 🔍 Dynamic filters
  let filters: any = {};
  if (status) filters.status = status;

  // 🔐 Role-based visibility control
  if (currentUser.role !== "Admin" && currentUser.role !== "Accountant") {
    filters.student = { createdBy: currentUser.id };
  }

  const payments = await prisma.payment.findMany({
    where: filters,
    orderBy: { createdAt: "asc" },
    include: {
      student: {
        select: {
          id: true,
          stid: true,
          studentName: true,
          mobileNumber: true,
          email: true,
          assigneeName: true,
          counselorName: true,
          processedBy: true,
          officeCity: true,
          createdBy: true,
        },
      },
    },
  });
  let message;
  if (!payments.length) {
    message = "No payments found";
  } else {
    message = "payment fetched successfully";
  }

  return NextResponse.json(new ApiResponse(200, payments, message));
});
