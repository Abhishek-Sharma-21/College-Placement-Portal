import React from "react";
import TpoAnnouncements from "@/student/pages/announcements/TpoAnnouncements";
import RecommendedJobs from "@/student/pages/jobs/JobCard";

const DashboardContent = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2">
        <RecommendedJobs />
      </div>
      <div className="lg:col-span-1">
        <TpoAnnouncements />
      </div>
    </div>
  );
};

export default DashboardContent;
