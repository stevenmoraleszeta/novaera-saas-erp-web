
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

  // Define auth routes (login/register)
  const authRoutes = ["/login", "/register"];

  // Define protected routes (require authentication)
  const protectedRoutes = [
    "/modulos",
    "/usuarios",
    "/roles",
    "/permissions",
    "/profile",
    "/notifications",
  ];

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.includes(pathname);

  // Check if current path is a protected route (exact match or starts with)
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/";

  // Si el usuario accede a / y tiene token, redirige a /modules
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/modules", request.url));
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  // if (isProtectedRoute && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

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
    "/notifications/:path*", 
  ],
};
