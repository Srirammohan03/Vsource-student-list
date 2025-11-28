import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getChangedFields, PAYMENT_ALLOWED_FIELDS } from "@/utils/auditFields";

export const GET = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "payment student id is required");

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      student: true,
    },
  });

  const message = payment
    ? "payment fetched successfully"
    : `No payment found with this id ${id}`;

  return NextResponse.json(new ApiResponse(200, payment, message));
});

export const PATCH = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;

  const body = await req.json();

  if (!id) throw new ApiError(400, "payment ID is required");

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

  const oldPayment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!oldPayment)
    throw new ApiError(400, `No payment found with this id ${id}`);

  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;
  // delete body.invoiceNumber;

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: body,
  });

  const newPayment = await prisma.payment.findUnique({
    where: { id },
  });

  const { oldValues, newValues } = getChangedFields(
    oldPayment,
    newPayment!,
    PAYMENT_ALLOWED_FIELDS
  );

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "UPDATE",
      module: "Payment",
      recordId: updatedPayment.id,
      oldValues,
      newValues,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(200, updatedPayment, "payment updated successfully")
  );
});

export const DELETE = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "payment ID is required");

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

  const deletedPayment = await prisma.payment.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "DELETE",
      module: "Payment",
      recordId: deletedPayment.id,
      oldValues: deletedPayment,
      newValues: undefined,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(200, null, "payment deleted successfully")
  );
});
