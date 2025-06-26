import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  console.log(
    `🔍 Middleware: ${pathname} - Token: ${token ? "Present" : "Missing"}`
  );

  // Define auth routes (login/register)
  const authRoutes = ["/login", "/register"];

  // Define protected routes (require authentication)
  const protectedRoutes = [
    "/modulos",
    "/usuarios",
    "/roles",
    "/permissions",
    "/profile",
  ];

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // Check if current path is a protected route (exact match or starts with)
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/";

  console.log(
    `🔍 Middleware: isProtectedRoute: ${isProtectedRoute}, isAuthRoute: ${isAuthRoute}`
  );

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthRoute && token) {
    console.log(
      `🔍 Middleware: Authenticated user accessing auth route, redirecting to /`
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  // if (isProtectedRoute && !token) {
  //   console.log(
  //     `🔍 Middleware: Unauthenticated user accessing protected route, redirecting to /login`
  //   );
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  console.log(`🔍 Middleware: Allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/modulos/:path*",
    "/usuarios/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/profile/:path*",
  ],
};
