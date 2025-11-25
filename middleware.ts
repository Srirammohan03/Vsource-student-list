import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "./lib/auth";

const PUBLIC_PATHS = ["/auth/login", "/"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const loggedIn = isAuthenticated(req);

  const isPublic = PUBLIC_PATHS.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isPublic) {
    if (loggedIn && pathname.startsWith("/auth/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/employees");

  if (isProtected && !loggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
