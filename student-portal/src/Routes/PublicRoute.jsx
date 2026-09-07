import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/Routes/studentRout/routes.jsx";
import TPO_ROUTES from "@/Routes/tpoRout/TpoRoutes";

/**
 * PublicRoute — only accessible to unauthenticated users.
 * Logged-in users are redirected to their role-appropriate dashboard.
 */
export default function PublicRoute({ children }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (isAuthenticated) {
    const destination =
      user?.role === "tpo" ? TPO_ROUTES.DASHBOARD : ROUTES.DASHBOARD;
    return <Navigate to={destination} replace />;
  }

  return children;
}
