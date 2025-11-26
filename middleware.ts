import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = [
  "/auth/login",
  "/",
  "/api/auth/login-step1",
  "/api/auth/login-step2",
  "/api/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );

  if (isPublic) {
    if (token && pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/transactions");

  if (isProtectedRoute) {
    if (!token) {
      return redirectToLogin(req, pathname);
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (error) {
      const res = redirectToLogin(req, pathname);
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest, currentPath: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set("from", currentPath);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
