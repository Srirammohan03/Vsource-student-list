export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getFinancialYearInfo(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // FY starts on April 1
  if (month >= 4) {
    return {
      startYear: year,
      endYear: year + 1,
      prefix: "B",
    };
  }

  return {
    startYear: year - 1,
    endYear: year,
    prefix: "B",
  };
}

function generateInvoiceNumber(lastInvoice?: string, date = new Date()) {
  const { startYear, endYear, prefix } = getFinancialYearInfo(date);

  const fy = `${startYear.toString().slice(2)}-${endYear
    .toString()
    .slice(2)}`;

  let nextNumber = 1;

  if (lastInvoice) {
    const match = lastInvoice.match(/([A-Z])(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[2], 10) + 1;
    }
  }

  return `VV/${fy}/${prefix}${nextNumber.toString().padStart(2, "0")}`;
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
  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded: any;
  let currentUser: { id: string; role: string | null } | null = null;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
    currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true },
    });
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  if (!currentUser) throw new ApiError(401, "User not found");
  if (body.amount <= 0) throw new ApiError(400, "Amount must be greater than zero");

  const student = await prisma.studentRegistration.findUnique({
    where: { id: body.studentId },
  });

  if (!student) throw new ApiError(404, "Student not found");
  if (student.status !== "CONFIRMED") {
    throw new ApiError(400, "Payment allowed only for confirmed students");
  }

  // 🔢 Already paid amount
  const aggregate = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      studentId: body.studentId,
      status: "APPROVED",
    },
  });

  const alreadyPaid = aggregate._sum.amount || 0;
  const totalFee = student.serviceCharge;
  const remaining = totalFee - alreadyPaid;

  if (remaining <= 0) {
    throw new ApiError(400, "Payment already exists for this student");
  }

  if (body.amount > remaining) {
    throw new ApiError(
      400,
      `Payment exceeds remaining amount. Remaining: ${remaining}`
    );
  }
  const { startYear, endYear, prefix } = getFinancialYearInfo();
  const fy = `${startYear.toString().slice(2)}-${endYear
    .toString()
    .slice(2)}`;

  const payment = await prisma.$transaction(async (tx) => {
    const lastPayment = await tx.payment.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `VV/${fy}/${prefix}`,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let nextInvoiceNumber = generateInvoiceNumber(
      lastPayment?.invoiceNumber
    );

    // Collision safety (rare but safe)
    let exists = await tx.payment.findUnique({
      where: { invoiceNumber: nextInvoiceNumber },
    });

    while (exists) {
      const match = nextInvoiceNumber.match(/([A-Z])(\d+)$/);
      const num = match ? parseInt(match[2], 10) + 1 : 1;

      nextInvoiceNumber = `VV/${fy}/${prefix}${num
        .toString()
        .padStart(2, "0")}`;

      exists = await tx.payment.findUnique({
        where: { invoiceNumber: nextInvoiceNumber },
      });
    }

    return tx.payment.create({
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
      userId: currentUser.id,
      role: currentUser.role,
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
  const status = searchParams.get("status") as PaymentStatus | null;

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
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  if (!currentUser) throw new ApiError(401, "User not found");

  const filters: any = {};
  if (status) filters.status = status;

  if (currentUser.role !== "Admin" && currentUser.role !== "Accounts") {
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
          abroadMasters: true,
          counselorName: true,
          processedBy: true,
          officeCity: true,
          createdBy: true,
        },
      },
    },
  });

  return NextResponse.json(
    new ApiResponse(
      200,
      payments,
      payments.length ? "payment fetched successfully" : "No payments found"
    )
  );
});
