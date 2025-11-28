import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

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
