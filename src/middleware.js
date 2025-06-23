import { NextResponse } from "next/server";

// Auth pages that don't need authentication
const AUTH_PAGES = ["/login", "/register"];

// Pages that require authentication
const PROTECTED_PAGES = ["/modulos", "/usuarios", "/roles", "/permissions"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Check if it's an auth page
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  // Check if it's a protected page
  const isProtectedPage =
    PROTECTED_PAGES.some((page) => pathname.startsWith(page)) ||
    pathname.startsWith("/modulos/");

  // If accessing protected page without token, redirect to login
  if (isProtectedPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth page with token, redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
