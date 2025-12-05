export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const { resetToken, newPassword } = await req.json();

  if (!resetToken || !newPassword)
    throw new ApiError(400, "Reset token and new password are required");

  let decoded: any;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET!);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: decoded.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json(
    new ApiResponse(200, null, "Password reset successful")
  );
});
