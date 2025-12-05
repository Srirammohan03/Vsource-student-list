export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

  const audit = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    new ApiResponse(200, audit, "audit fetched successfully")
  );
});
