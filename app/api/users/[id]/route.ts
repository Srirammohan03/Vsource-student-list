import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getChangedFields, USER_ALLOWED_FIELDS } from "@/utils/auditFields";

export const PUT = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;
  const body = await req.json();

  if (!id) throw new ApiError(400, "User ID is required");

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

  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;
  delete body.employeeId;

  const oldUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!oldUser) {
    throw new ApiError(404, `No user found with id ${id}`);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: body,
  });

  if (!updatedUser) {
    throw new ApiError(404, `No user found with id ${id}`);
  }

  const newUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!newUser) {
    throw new ApiError(404, `No user found with id ${id}`);
  }

  const { oldValues, newValues } = getChangedFields(
    oldUser,
    newUser!,
    USER_ALLOWED_FIELDS
  );

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "UPDATE",
      module: "User",
      recordId: updatedUser.id,
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
    new ApiResponse(200, updatedUser, "user updated successfully")
  );
});

export const DELETE = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;

  if (!id) {
    throw new ApiError(400, "User ID is required");
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

  const existingUser = await prisma.user.delete({
    where: { id },
  });

  if (!existingUser) throw new ApiError(404, `No user found with ID: ${id}`);

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "DELETE",
      module: "User",
      recordId: existingUser.id,
      oldValues: existingUser,
      newValues: undefined,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

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
