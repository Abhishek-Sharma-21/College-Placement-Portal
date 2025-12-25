import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/student/layout/AppLayout";
import { ROUTES } from "@/Routes/studentRout/routes";

const DashboardContent = lazy(() =>
  import("@/student/pages/dashboard/DashboardContent")
);
const AllJobs = lazy(() => import("@/student/pages/jobs/AllJobs"));
const MyJobs = lazy(() => import("@/student/pages/jobs/MyJobs"));
const TpoAnnouncements = lazy(() =>
  import("@/student/pages/announcements/TpoAnnouncements")
);
const Assessments = lazy(() =>
  import("@/student/pages/assessments/Assessments")
);
const TakeAssessment = lazy(() =>
  import("@/student/pages/assessments/TakeAssessment")
);
const Login = lazy(() => import("@/features/auth/Login"));
const Register = lazy(() => import("@/features/auth/Register"));
const Profile = lazy(() => import("@/student/pages/profile/Profile"));

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
          <Route path={ROUTES.MY_JOBS} element={<MyJobs />} />
          <Route path={ROUTES.ASSESSMENTS} element={<Assessments />} />
          <Route path="/assessments/:id/take" element={<TakeAssessment />} />
          <Route path={ROUTES.ANNOUNCEMENTS} element={<TpoAnnouncements />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
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
