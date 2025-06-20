// Middleware para proteger rutas (Next.js Middleware API)
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "secret"; // Usa tu secreto real en producción

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return NextResponse.next();
  } catch (e) {
    console.warn("Middleware: Token inválido, redirigiendo a login");
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/:path*", "/admin/:path*", "/usuarios/:path*", "/modulos/:path*"], // Rutas protegidas
};
