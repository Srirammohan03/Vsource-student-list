export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

  const token = cookies().get("token")?.value;
  if (!token)
    return NextResponse.json(new ApiResponse(401, null, "Not authenticated"));

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return NextResponse.json(
      new ApiResponse(401, null, "Invalid or expired token")
    );
  }

  if (decoded?.role !== "Admin") {
    return NextResponse.json(new ApiResponse(403, null, "Access denied"), {
      status: 403,
    });
  }

  if (!body.userId) {
    throw new ApiError(400, "userId is required");
  }

  const user = await prisma.user.findUnique({
    where: { id: body.userId },
  });

  if (!user) {
    throw new ApiError(404, `No user found with id: ${body.userId}`);
  }

  const ipAddress =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown";

  const userAgent = req.headers.get("user-agent") || "Unknown";

  const loginRecord = await prisma.employeeLoginDetail.create({
    data: {
      userId: user.id,
      ipAddress,
      userAgent,
    },
    include: {
      user: {
        select: {
          employeeId: true,
          name: true,
          email: true,
          phone: true,
          branch: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json(
    new ApiResponse(201, loginRecord, "Login record added successfully")
  );
});

export const GET = apiHandler(async () => {
  const token = cookies().get("token")?.value;
  if (!token)
    return NextResponse.json(new ApiResponse(401, null, "Not authenticated"));

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return NextResponse.json(
      new ApiResponse(401, null, "Invalid or expired token")
    );
  }

  if (decoded?.role !== "Admin") {
    return NextResponse.json(new ApiResponse(403, null, "Access denied"), {
      status: 403,
    });
  }

  const users = await prisma.employeeLoginDetail.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          employeeId: true,
          loginType: true,
        },
      },
    },
  });
  if (!users) throw new ApiError(404, "No Users found");

  return NextResponse.json(
    new ApiResponse(200, users, "Users fetched successfully")
  );
});
