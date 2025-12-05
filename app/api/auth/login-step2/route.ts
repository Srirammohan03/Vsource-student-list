export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import {
  checkLockOut,
  handleFailedAttempt,
  resetAttempts,
} from "@/utils/checkLockout";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const { employeeId, tempToken } = await req.json();

  if (!employeeId || !tempToken) {
    throw new ApiError(400, "Employee ID and tempToken are required");
  }

  let decoded: any;

  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET!);
  } catch (error) {
    throw new ApiError(401, "Session expired, please login again");
  }

  const user = await prisma.user.findFirst({
    where: { employeeId, email: decoded.email },
  });

  if (!user) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (userByEmail) {
      const { locked, message } = await handleFailedAttempt(userByEmail);

      if (locked)
        return NextResponse.json(new ApiResponse(403, { locked }, message), {
          status: 403,
        });
      throw new ApiError(401, `Employee ID does not match.`);
    }

    throw new ApiError(401, "Invalid credentials");
  }

  const { locked, message } = await checkLockOut(user);

  if (locked)
    return NextResponse.json(new ApiResponse(403, { locked }, message), {
      status: 403,
    });

  await resetAttempts(user.id);

  const finalToken = jwt.sign(
    { id: user.id, employeeId: user.employeeId, role: user?.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  cookies().set("token", finalToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  await prisma.employeeLoginDetail.create({
    data: {
      userId: user.id,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(200, { finalToken }, "Login successful")
  );
});
