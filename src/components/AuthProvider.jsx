"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/lib/cookies";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isClient) return;

    const checkAuth = async () => {
      try {
        const token = getToken();

        if (token) {
          // You can add token validation here if needed
          setUser({ token }); // For now, just set the token
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    checkAuth();
  }, [isClient]);

  // Handle session refresh on route changes
  useEffect(() => {
    if (!isClient || status !== "authenticated") return;

    const handleRouteChange = () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        setStatus("unauthenticated");
        router.push("/login");
      }
    };

    // Check auth on route changes
    handleRouteChange();

    // Listen for storage changes (token updates from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        handleRouteChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isClient, status, router]);

  const login = (userData) => {
    setUser(userData);
    setStatus("authenticated");
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setStatus("unauthenticated");
    router.push("/login");
  };

  const value = {
    user,
    status,
    login,
    logout,
    isClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
