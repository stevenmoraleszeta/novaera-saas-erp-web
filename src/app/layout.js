'use client';

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
  const isLogin = typeof window !== 'undefined' && window.location.pathname === '/login';

  if (isLogin) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Sidebar />
          <Topbar onLogout={() => {/* lógica de logout */}} />
          <MainContent>{children}</MainContent>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
