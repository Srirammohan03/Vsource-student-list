import { prisma } from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { checkLockOut, handleFailedAttempt } from "@/utils/checkLockout";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    throw new ApiError(400, "Email and Password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      new ApiResponse(401, null, "Invalid email or password"),
      { status: 401 }
    );
  }

  const { locked, message } = await checkLockOut(user);

  if (locked)
    return NextResponse.json(new ApiResponse(403, { locked }, message), {
      status: 403,
    });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const { locked, message } = await handleFailedAttempt(user);
    if (locked)
      return NextResponse.json(new ApiResponse(403, { locked }, message), {
        status: 403,
      });
    throw new ApiError(401, "Invalid email or password");
  }

  const tempToken = jwt.sign({ email }, process.env.JWT_SECRET!);

  return NextResponse.json(
    new ApiResponse(200, { tempToken }, "Step 1 success, proceed to step 2")
  );
});
