export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/utils/ApiResponse";

export const PATCH = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "User ID is required");

  const token = cookies().get("token")?.value;
  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      failedAttempts: 0,
      isLocked: false,
    },
  });

  return NextResponse.json(
    new ApiResponse(200, updatedUser, "User unlocked successfully")
  );
});
