import { RegistrationStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = apiHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as RegistrationStatus | null;

  const students = await prisma.studentRegistration.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "asc" },
    include: { payment: true },
  });

  return NextResponse.json(
    new ApiResponse(200, students, "Students fetched successfully")
  );
});

export const POST = apiHandler(async (req: Request, context: any) => {
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

  if (!body.studentName || !body.email || !body.mobileNumber) {
    throw new ApiError(
      400,
      "Student Name, Email, and Mobile Number are required"
    );
  }

  let lastStudent = await prisma.studentRegistration.findFirst({
    orderBy: { createdAt: "asc" },
    select: { stid: true },
  });

  let newStid = "ABMS001";

  if (lastStudent?.stid) {
    let lastNumber = parseInt(lastStudent.stid.replace("ABMS", ""));
    let nextNumber = (lastNumber + 1).toString().padStart(3, "0");
    newStid = `ABMS${nextNumber}`;
  }

  const newStudent = await prisma.studentRegistration.create({
    data: {
      stid: newStid,
      studentName: body.studentName,
      email: body.email,
      mobileNumber: body.mobileNumber,
      nationality: body.nationality || "",
      fathersName: body.fathersName || "",
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : new Date(),
      gender: body.gender || "",
      parentMobile: body.parentMobile || "",
      registrationDate: body.registrationDate
        ? new Date(body.registrationDate)
        : undefined,

      // Address
      addressLine1: body.addressLine1 || "",
      addressLine2: body.addressLine2 || null,
      country: body.country || "",
      state: body.state || "",
      city: body.city || "",
      district: body.district || "",
      pincode: body.pincode || "",

      // Course Data
      abroadMasters: body.abroadMasters || "",
      courseName: body.courseName || "",
      serviceCharge: body.serviceCharge ? parseFloat(body.serviceCharge) : 0,
      academicYear: body.academicYear || "",
      processedBy: body.processedBy || "",
      counselorName: body.counselorName || "",
      officeCity: body.officeCity || "",
      assigneeName: body.assigneeName || "",
      passportNumber: body.passportNumber || null,
      ...(body.status ? { status: body.status } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: currentUser?.id || null,
      role: currentUser?.role || null,
      action: "CREATE",
      module: "StudentRegistration",
      recordId: newStudent.id,
      oldValues: undefined,
      newValues: newStudent,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "Unknown",
      userAgent: req.headers.get("user-agent") || "Unknown",
    },
  });

  return NextResponse.json(
    new ApiResponse(201, newStudent, "Student registered successfully")
  );
});
