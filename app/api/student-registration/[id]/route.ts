import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const PUT = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;
  const body = await req.json();

  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;

  const updatedStudent = await prisma.studentRegistration.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(
    new ApiResponse(200, updatedStudent, "Student updated successfully")
  );
});

export const DELETE = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;
  await prisma.studentRegistration.delete({ where: { id } });
  return NextResponse.json(
    new ApiResponse(200, null, "Student deleted successfully")
  );
});
