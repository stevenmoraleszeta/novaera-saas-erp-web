'use client';

import React from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import MainContent from "../components/MainContent";
import { AuthProvider, AuthContext } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

function LayoutContent({ children }) {
  const [isClient, setIsClient] = React.useState(false);
  const auth = React.useContext(AuthContext);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const status = auth?.status;
  const isAuthPage = typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register');

  // Esperar a que la autenticación esté lista
  if (!isAuthPage && (status === 'checking' || status === 'authenticating')) {
    return null;
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthPage && status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  // Si está autenticado, mostrar layout completo
  if (!isAuthPage && status === 'authenticated') {
    return (
      <>
        <Sidebar />
        <Topbar />
        <MainContent>{children}</MainContent>
        <Footer />
      </>
    );
  }

  // Si es login/register, solo muestra el contenido
  return children;
}
