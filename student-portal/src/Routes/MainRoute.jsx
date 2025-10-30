import React from "react";
import { useSelector } from "react-redux";
import StudentRoutes from "@/Routes/studentRout/StudentRoutes";
import TpoNavigateRoutes from "@/Routes/tpoRout/TpoNavigateRoutes";

export default function MainRoute() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (!isAuthenticated) {
    // unauthenticated users see student router which contains login/register
    return <StudentRoutes />;
  }

  // choose routes by role
  if (user?.role === "tpo") {
    return <TpoNavigateRoutes />;
  }

  return <StudentRoutes />;
}
