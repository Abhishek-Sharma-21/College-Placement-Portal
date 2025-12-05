import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TPO_ROUTES } from "@/Routes/tpoRout/TpoRoutes";
import TpoAppLayout from "@/tpo/layout/TpoAppLayout";

const RecentJobPostingCard = lazy(() =>
  import("@/tpo/pages/RecentJobPost/RecentJobPostingCard")
);
const RecentlyRegisteredStudents = lazy(() =>
  import("@/tpo/pages/RecentRegisteredStudent/RecentlyRegisteredStudents")
);
const AddJob = lazy(() => import("@/tpo/pages/AddJob"));
const EditJob = lazy(() => import("@/tpo/pages/EditJob"));
const TpoAnnouncementsManage = lazy(() => import("@/tpo/pages/Announcements"));
const CreateAssessment = lazy(() => import("@/tpo/pages/CreateAssessment"));

// Minimal dashboard that composes existing widgets
const TpoDashboard = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
    <RecentJobPostingCard />
    <RecentlyRegisteredStudents />
  </div>
);

export default function TpoNavigateRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-sm text-gray-600">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route
          path="/tpo"
          element={<Navigate to={TPO_ROUTES.DASHBOARD} replace />}
        />

        <Route element={<TpoAppLayout />}>
          <Route path={TPO_ROUTES.DASHBOARD} element={<TpoDashboard />} />
          <Route
            path={TPO_ROUTES.MANAGE_JOBS}
            element={<RecentJobPostingCard />}
          />
          <Route path="/tpo/jobs/add" element={<AddJob />} />
          <Route path="/tpo/jobs/edit/:id" element={<EditJob />} />
          <Route
            path={TPO_ROUTES.MANAGE_STUDENTS}
            element={<RecentlyRegisteredStudents />}
          />
          <Route
            path={TPO_ROUTES.ANNOUNCEMENTS}
            element={<TpoAnnouncementsManage />}
          />
          <Route
            path={TPO_ROUTES.MANAGE_ASSESSMENTS}
            element={<CreateAssessment />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to={TPO_ROUTES.DASHBOARD} replace />}
        />
      </Routes>
    </Suspense>
  );
}
