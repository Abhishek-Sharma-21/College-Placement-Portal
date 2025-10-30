import React from "react";
import StudentNavbar from "@/student/layout/StudentNavbar";
import StudentWelcomeBanner from "@/student/layout/StudentWelcomeBanner";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <StudentNavbar />
      <div className="container mx-auto p-4 md:p-6">
        <StudentWelcomeBanner />
        <main className="mt-6" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
