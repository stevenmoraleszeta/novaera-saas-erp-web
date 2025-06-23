import React from "react";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import Footer from "@/components/Footer";
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
