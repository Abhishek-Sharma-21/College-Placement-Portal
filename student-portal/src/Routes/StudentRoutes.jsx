import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { ROUTES } from "@/routes/routes";

const DashboardContent = lazy(() =>
  import("@/features/dashboard/DashboardContent")
);
const AllJobs = lazy(() => import("@/features/jobs/AllJobs"));
const TpoAnnouncements = lazy(() =>
  import("@/features/announcements/TpoAnnouncements")
);
const Login = lazy(() => import("@/features/auth/Login"));
const Register = lazy(() => import("@/features/auth/Register"));

export default function StudentRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-sm text-gray-600">
          Loading content...
        </div>
      }
    >
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={<Navigate to={ROUTES.DASHBOARD} replace />}
        />

        {/* Layout route keeps navbar/banner persistent */}
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardContent />} />
          <Route path={ROUTES.ALL_JOBS} element={<AllJobs />} />
          <Route path={ROUTES.ANNOUNCEMENTS} element={<TpoAnnouncements />} />
        </Route>

        {/* Auth routes (no persistent layout) */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
}
