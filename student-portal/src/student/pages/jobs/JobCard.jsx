import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/Routes/studentRout/routes";
import {
  FaChartLine,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";

const jobs = [
  {
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    location: "Bangalore",
    salary: "₹8-12 LPA",
    posted: "Posted 2 days ago",
    required: "Aptitude Test (75%+)",
    status: "Eligible",
  },
  {
    title: "Software Engineer",
    company: "InnovateTech",
    location: "Hyderabad",
    salary: "₹10-15 LPA",
    posted: "Posted 1 days ago",
    required: "Java Test (80%+)",
    status: "Assessment Required",
  },
];

const JobCard = ({ job }) => {
  const isEligible = job.status === "Eligible";
  const requirementColor = isEligible ? "text-green-600" : "text-orange-600";

  const statusBadge = isEligible ? (
    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
      {job.status}
    </span>
  ) : (
    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
      {job.status}
    </span>
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
          <p className="text-sm text-gray-600">{job.company}</p>
        </div>
        {statusBadge}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 my-3">
        <span className="flex items-center gap-1.5">
          <FaMapMarkerAlt /> {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <FaMoneyBillWave /> {job.salary}
        </span>
        <span className="flex items-center gap-1.5">
          <FaClock /> {job.posted}
        </span>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-700">
          Required:{" "}
          <span className={`font-medium ${requirementColor}`}>
            {job.required}
          </span>
        </p>
        <Link
          to={ROUTES.ALL_JOBS}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const RecommendedJobs = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FaChartLine className="text-xl text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Recommended Jobs For You
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Jobs matched based on your skills and assessment scores
      </p>
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.title} job={job} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedJobs;
