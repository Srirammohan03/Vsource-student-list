import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = apiHandler(async () => {
  const users = await prisma.user.findMany();
  return NextResponse.json(
    new ApiResponse(200, users, "User added successfully")
  );
});

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

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

  if (!body.name || !body.email || !body.password || !body.loginType) {
    throw new ApiError(400, "Name, Email,loginType and password are required");
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const lastEmployee = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { employeeId: true },
  });

  let newEmployeeId = "VSH001";
  if (lastEmployee?.employeeId) {
    const lastNumber = parseInt(lastEmployee?.employeeId.replace("VSH", ""));
    const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
    newEmployeeId = `VSH${nextNumber}`;
  }

  const newUser = await prisma.user.create({
    data: {
      employeeId: newEmployeeId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: hashedPassword,
      branch: body.branch,
      role: body.role || null,
      loginType: body.loginType,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "CREATE",
      module: "User",
      recordId: newUser.id,
      oldValues: undefined,
      newValues: newUser,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(201, newUser, "User created successfully")
  );
});
