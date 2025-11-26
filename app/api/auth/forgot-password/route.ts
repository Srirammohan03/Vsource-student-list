import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const { employeeId } = await req.json();

  if (!employeeId) throw new ApiError(400, "Employee ID is required");

  const user = await prisma.user.findUnique({ where: { employeeId } });

  if (!user) throw new ApiError(404, "No user found with this Employee ID");

  const resetToken = jwt.sign(
    { id: user.id, employeeId: user.employeeId },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  return NextResponse.json(
    new ApiResponse(200, { resetToken }, "Reset token generated successfully")
  );
});
