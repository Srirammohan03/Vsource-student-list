export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const DELETE = apiHandler(async (req: Request, context: any) => {
  const { id } = context.params;

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

  if (!id) {
    return NextResponse.json(
      new ApiResponse(400, null, "Audit Log ID is required"),
      { status: 400 }
    );
  }

  const deleted = await prisma.auditLog.delete({
    where: { id },
  });

  return NextResponse.json(
    new ApiResponse(200, deleted, "Audit log deleted successfully")
  );
});
