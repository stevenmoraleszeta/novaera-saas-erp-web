import React from "react";
import Header from "@/components/layout/Header";
import TabBar from "@/components/tabs/TabBar";
import Footer from "@/components/layout/Footer";
import MainContent from "@/components/MainContent";

export default function AppLayout({ children }) {
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
