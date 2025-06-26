import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TabInitializer from "@/components/tabs/TabInitializer";
import UserInitializer from "@/components/users/UserInitializer";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-erp-gradient`}
      >
        <TabInitializer />
        <UserInitializer />
        {children}
      </body>
    </html>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Cargando aplicación...</p>
      </div>
    </div>
  );
}
