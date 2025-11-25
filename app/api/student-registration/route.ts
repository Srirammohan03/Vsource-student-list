import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const GET = apiHandler(async () => {
  const students = await prisma.studentRegistration.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(new ApiResponse(200, students));
});

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();

  if (!body.studentName || !body.email || !body.mobileNumber) {
    throw new ApiError(
      400,
      "Student Name, Email, and Mobile Number are required"
    );
  }

  const newStudent = await prisma.studentRegistration.create({
    data: {
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

  return NextResponse.json(
    new ApiResponse(201, newStudent, "Student registered successfully")
  );
});
