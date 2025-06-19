'use client';

import React from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import MainContent from "../components/MainContent";
import { AuthProvider } from "../context/AuthContext";

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

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return children;
  }

  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
  // Redirigir automáticamente si no hay token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || document.cookie.includes('token=') : true;
  if (!isAuthPage && !token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  if (!isAuthPage && token) {
    return (
      <>
        <Sidebar />
        <Topbar onLogout={() => {/* lógica de logout */ }} />
        <MainContent>{children}</MainContent>
        <Footer />
      </>
    );
  }

  // Si es login/register, solo muestra el contenido
  return children;
}
