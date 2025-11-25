import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const PUT = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;
  const body = await req.json();

  if (!id) throw new ApiError(400, "User ID is required");

  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;
  delete body.employeeId;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: body,
  });

  if (!updatedUser) {
    throw new ApiError(404, `No user found with id ${id}`);
  }

  return NextResponse.json(
    new ApiResponse(200, updatedUser, "user updated successfully")
  );
});

export const DELETE = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;

  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const existingUser = await prisma.user.delete({
    where: { id },
  });
  if (!existingUser) throw new ApiError(404, `No user found with ID: ${id}`);
  return NextResponse.json(
    new ApiResponse(200, null, "user deleted successfully")
  );
});

export const GET = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(404, `No user found with this id ${id}`);
  }

  return NextResponse.json(
    new ApiResponse(200, user, "user fetched successfully")
  );
});
