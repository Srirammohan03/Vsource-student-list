export const dynamic = "force-dynamic";
export const runtime = "nodejs";


import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";

export const GET = apiHandler(async () => {
  const token = cookies().get("token")?.value;

  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      role: true,
      branch: true,
      createdAt: true,
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  return NextResponse.json(
    new ApiResponse(200, { user }, "User fetched successfully")
  );
});
