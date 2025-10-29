import React from "react";
import TpoAnnouncements from "@/features/announcements/TpoAnnouncements";
import RecommendedJobs from "@/features/jobs/JobCard";

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


