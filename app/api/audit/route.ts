import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const GET = apiHandler(async () => {
  const audit = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return NextResponse.json(
    new ApiResponse(200, audit, "audit added successfully")
  );
});
