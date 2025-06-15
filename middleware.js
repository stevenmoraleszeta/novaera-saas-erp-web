// Middleware para proteger rutas (Next.js Middleware API)
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // Usa tu secreto real en producción

export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  // Para demo/testing - permitir acceso si no hay token pero es modo desarrollo
  if (!token) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isDemo = request.cookies.get('demo_mode')?.value === 'true';

    if (isDevelopment || isDemo) {
      console.warn('Middleware: Permitiendo acceso en modo demo/desarrollo');
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return NextResponse.next();
  } catch (e) {
    console.warn('Middleware: Token inválido, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/usuarios/:path*', '/modulos/:path*'], // Rutas protegidas
};
