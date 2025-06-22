"use client";

import React, { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import Footer from "./Footer";
import MainContent from "./MainContent";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TabBar from "./TabBar";

// Auth pages that don't need the full layout
const AUTH_PAGES = ["/login", "/register"];

export function LayoutWrapper({ children }) {
  const { status, user } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirects
  useEffect(() => {
    if (!isClient) return;

    const isAuthPage = AUTH_PAGES.includes(pathname);

    if (status === "unauthenticated" && !isAuthPage) {
      router.replace("/login");
    } else if (status === "authenticated" && isAuthPage) {
      router.replace("/");
    }
  }, [status, pathname, isClient, router]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <ClientLoadingFallback />;
  }

  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Handle authentication states
  switch (status) {
    case "checking":
    case "authenticating":
      return isAuthPage ? children : <AuthLoadingFallback />;

    case "unauthenticated":
      return isAuthPage ? children : <RedirectingFallback />;

    case "authenticated":
      return isAuthPage ? (
        <RedirectingFallback />
      ) : (
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      );

    default:
      return <ErrorFallback />;
  }
}

// Authenticated layout with sidebar, topbar, and footer
function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col">
        <TabBar />
        <MainContent>{children}</MainContent>
      </div>
      <Footer />
    </div>
  );
}

// Loading fallbacks
function ClientLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Inicializando...</p>
      </div>
    </div>
  );
}

function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Verificando autenticación...</p>
      </div>
    </div>
  );
}

function RedirectingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Redirigiendo...</p>
      </div>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xl">⚠️</span>
        </div>
        <p className="text-gray-600 text-sm">Error en la aplicación</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Recargar
        </button>
      </div>
    </div>
  );
}
