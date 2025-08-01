// src/components/layout/root-layout.tsx
"use client";

import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";

export default function RootLayout() {
  return (
    <div
      className="dark"
      style={{
        backgroundImage: `radial-gradient(ellipse at center, oklch(0.2 0.05 260 / 20%), transparent 70%), url('/gothic-bg-pattern.svg')`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <Sidebar />
      <div className="flex flex-col md:ml-64">
        {" "}
        {/* ml-64 = sidebar width */}
        <Header />
        <main className="min-h-screen flex flex-col items-center gap-8 p-4 md:p-8">
          {/* The actual page content will be rendered here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
