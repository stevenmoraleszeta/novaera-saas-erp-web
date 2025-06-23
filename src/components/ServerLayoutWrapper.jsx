import React from "react";
import { cookies } from "next/headers";
import Footer from "./Footer";
import MainContent from "./MainContent";
import Header from "./Header";
import TabBar from "./TabBar";

export function ServerLayoutWrapper({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // If no token, middleware should have redirected to login
  // So we can assume user is authenticated if we reach here
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
