import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes that don't need auth
  const publicRoutes = ["/", "/login", "/register", "/unauthorized"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isStaticRoute =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images");

  if (isPublicRoute || isApiAuthRoute || isStaticRoute) {
    return NextResponse.next();
  }

  // Protected routes — require authentication
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const adminOnlyPaths = ["/admin"];
  const teacherPaths = ["/teacher"];

  if (
    adminOnlyPaths.some((p) => pathname.startsWith(p)) &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (
    teacherPaths.some((p) => pathname.startsWith(p)) &&
    session.user.role !== "TEACHER" &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
