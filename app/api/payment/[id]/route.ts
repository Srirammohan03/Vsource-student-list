import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const GET = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "payment student id is required");

  const payment = await prisma.payment.findUnique({
    where: { studentId: id },
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

  if (!id) throw new ApiError(400, "payment ID is required");

  const body = await req.json();

  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;
  delete body.invoiceNumber;

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(
    new ApiResponse(200, updatedPayment, "payment updated successfully")
  );
});

export const DELETE = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "payment ID is required");

  await prisma.payment.delete({
    where: { id },
  });

  return NextResponse.json(
    new ApiResponse(200, null, "payment deleted successfully")
  );
});
