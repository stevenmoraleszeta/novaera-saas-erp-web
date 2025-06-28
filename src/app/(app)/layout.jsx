import React from "react";
import Header from "@/components/layout/Header";
import TabBar from "@/components/tabs/TabBar";
import Footer from "@/components/layout/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col">
        <TabBar />
        <main className="flex-grow p-4 text-gray-900">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
