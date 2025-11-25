import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const GET = apiHandler(async () => {
  const users = await prisma.user.findMany();
  return NextResponse.json(
    new ApiResponse(200, users, "User added successfully")
  );
});

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

  if (!body.name || !body.email || !body.password || !body.loginType) {
    throw new ApiError(400, "Name, Email,loginType and password are required");
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const lastEmployee = await prisma.user.findFirst({
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(
    new ApiResponse(201, newUser, "User created successfully")
  );
});
