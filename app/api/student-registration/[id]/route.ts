export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getChangedFields, STUDENT_ALLOWED_FIELDS } from "@/utils/auditFields";

export const PUT = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;
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

  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;
  delete body.stid;

  const oldStudent = await prisma.studentRegistration.findUnique({
    where: { id },
  });

  if (!oldStudent) throw new ApiError(404, `No student found with ID: ${id}`);

  const updatedStudent = await prisma.studentRegistration.update({
    where: { id },
    data: {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      registrationDate: body.registrationDate
        ? new Date(body.registrationDate)
        : undefined,
    },
  });

  if (!updatedStudent)
    throw new ApiError(404, `No student found with ID: ${id}`);

  const newStudent = await prisma.studentRegistration.findUnique({
    where: { id },
  });

  const { oldValues, newValues } = getChangedFields(
    oldStudent,
    newStudent!,
    STUDENT_ALLOWED_FIELDS
  );

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "UPDATE",
      module: "StudentRegistration",
      recordId: updatedStudent.id,
      oldValues: oldValues,
      newValues: newValues,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(200, updatedStudent, "Student updated successfully")
  );
});

export const DELETE = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;
  if (!id) throw new ApiError(400, "student ID is required");

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

  const existingStudent = await prisma.studentRegistration.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "DELETE",
      module: "StudentRegistration",
      recordId: existingStudent.id,
      oldValues: existingStudent,
      newValues: undefined,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(200, null, "Student deleted successfully")
  );
});

export const GET = apiHandler(async (_req: Request, context: any) => {
  const { id } = context.params;

  if (!id) throw new ApiError(400, "student ID is required");

  const student = await prisma.studentRegistration.findUnique({
    where: { id },
    select: {
      id: true,
      stid: true,

      // personal info
      studentName: true,
      dateOfBirth: true,
      mobileNumber: true,
      email: true,
      parentMobile: true,
      fathersName: true,
      nationality: true,
      gender: true,
      registrationDate: true,

      // address
      addressLine1: true,
      addressLine2: true,
      country: true,
      state: true,
      city: true,
      district: true,
      pincode: true,

      // course details
      abroadMasters: true,
      courseName: true,
      passportNumber: true,
      serviceCharge: true,
      academicYear: true,
      officeCity: true,
      processedBy: true,
      counselorName: true,
      assigneeName: true,

      // status / others
      status: true,
      createdAt: true,
      updatedAt: true,

      // ⬇️ payments as an ARRAY, ordered by date/createdAt
      payment: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!student) {
    throw new ApiError(404, `No student found with this id ${id}`);
  }

  // ⬇️ compute totals for UI convenience
  const totalPaid =
    student.payment?.reduce(
      (sum, p) =>
        p.status === "APPROVED" ? sum + Number(p.amount) : sum,
      0
    ) || 0;

  const remaining = (student.serviceCharge || 0) - totalPaid;

  return NextResponse.json(
    new ApiResponse(
      200,
      { ...student, totalPaid, remaining },
      "student fetched successfully"
    )
  );
});

