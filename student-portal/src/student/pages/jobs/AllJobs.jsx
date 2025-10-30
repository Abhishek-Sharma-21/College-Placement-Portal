import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/Routes/studentRout/routes";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
} from "react-icons/fa";

const jobs = [
  {
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    status: "Eligible",
    location: "Bangalore",
    salary: "₹8-12 LPA",
    posted: "2 days ago",
    applicants: "45 applicants",
    description:
      "Join our dynamic frontend team to build cutting-edge web applications using React, TypeScript, and modern development practices. You will...",
    skills: ["React", "TypeScript", "CSS", "+3 more"],
    required: "Aptitude Test (75%+)",
    isEligible: true,
  },
  {
    title: "Software Engineer",
    company: "InnovateTech",
    status: "Assessment Required",
    location: "Hyderabad",
    salary: "₹10-15 LPA",
    posted: "1 days ago",
    applicants: "62 applicants",
    description:
      "Work on challenging backend systems and microservices architecture. Help build scalable solutions for enterprise clients.",
    skills: ["Java", "Spring Boot", "Microservices", "+3 more"],
    required: "Java Test (80%+)",
    isEligible: false,
  },
];

const SkillTag = ({ skill }) => (
  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
    {skill}
  </span>
);

const JobCard = ({ job }) => {
  const requirementColor = job.isEligible
    ? "text-green-600"
    : "text-orange-600";

  const statusBadge = job.isEligible ? (
    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
      {job.status}
    </span>
  ) : (
    <span className="text-xs font-medium bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
      {job.status}
    </span>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <p className="flex items-center gap-2 text-md text-gray-600 mt-1">
              <FaBuilding /> {job.company}
            </p>
          </div>
          {statusBadge}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 my-4 border-y border-gray-100 py-3">
          <span className="flex items-center gap-1.5">
            <FaMapMarkerAlt /> {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <FaMoneyBillWave /> {job.salary}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock /> {job.posted}
          </span>
          <span className="flex items-center gap-1.5">
            <FaUsers /> {job.applicants}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">{job.description}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {jobs.map((k) => k).length &&
            job.skills.map((skill) => <SkillTag key={skill} skill={skill} />)}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-700">
          Required:{" "}
          <span className={`font-medium ${requirementColor}`}>
            {job.required}
          </span>
        </p>
        <Link
          to={ROUTES.ALL_JOBS}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

const AllJobs = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">All Jobs</h2>
        <p className="text-md text-gray-600 mt-1">
          Jobs you're eligible for based on your CGPA and branch
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.title} job={job} />
        ))}
      </div>
    </div>
  );
};

export default AllJobs;
