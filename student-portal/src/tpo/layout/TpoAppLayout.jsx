import React from "react";
import { Outlet } from "react-router-dom";
import TPONavbar from "./TpoNavbar";
import TPODashboardStats from "./TpoDashboardStats";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <TPONavbar />
      <div className="container mx-auto p-4 md:p-6">
        <TPODashboardStats />
        <main className="mt-6" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
