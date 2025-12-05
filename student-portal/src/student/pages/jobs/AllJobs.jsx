import React, { useEffect, useState } from "react";
import { ROUTES } from "@/Routes/studentRout/routes";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";

const SkillTag = ({ skill }) => (
  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
    {skill}
  </span>
);

const JobCard = ({ job }) => {
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  // Check if student has already applied for this job
  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/applications/my",
          {
            withCredentials: true,
          }
        );
        const hasApplied = res.data.some(
          (application) => application.job._id === job._id
        );
        setApplied(hasApplied);
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };
    checkApplicationStatus();
  }, [job._id]);

  const handleApply = async () => {
    if (applied) return;

    setApplying(true);
    try {
      // Submit application to backend
      await axios.post(
        `http://localhost:4000/api/applications/job/${job._id}`,
        {},
        {
          withCredentials: true,
        }
      );

      setApplied(true);

      // If there's an external application link, open it
      if (job.applicationLink) {
        window.open(job.applicationLink, "_blank");
      } else {
        alert(
          "Application submitted successfully! TPO will review your application."
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to apply for job.";
      alert(errorMsg);
      console.error("Error applying for job:", error);
    } finally {
      setApplying(false);
    }
  };

  const statusBadge = (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full ${
        job.status === "active"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {job.status === "active" ? "Active" : "Completed"}
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
            <FaMapMarkerAlt /> {job.location || "Not specified"}
          </span>
          <span className="flex items-center gap-1.5">
            <FaMoneyBillWave /> {job.ctc ? `₹${job.ctc} LPA` : "Not Disclosed"}
          </span>
          <span className="flex items-center gap-1.5">
            <FaClock />{" "}
            {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "-"}
          </span>
        </div>

        {job.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {job.description}
          </p>
        )}

        {Array.isArray(job.skills) && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {job.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-700">Posted by TPO</p>
        <button
          onClick={handleApply}
          disabled={applied || applying || job.status !== "active"}
          className={`px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
            applied
              ? "bg-green-600 cursor-not-allowed"
              : applying
              ? "bg-blue-400 cursor-wait"
              : job.status === "active"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {applied ? "Applied" : applying ? "Applying..." : "Apply"}
        </button>
      </div>
    </div>
  );
};

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:4000/api/jobs", {
          withCredentials: true,
        });
        const all = res.data || [];
        setJobs(all.filter((j) => j.status === "active"));
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">All Jobs</h2>
        <p className="text-md text-gray-600 mt-1">
          Latest openings from your TPO
        </p>
      </div>
      {loading && <div>Loading jobs...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
          {jobs.length === 0 && <div>No active jobs right now.</div>}
        </div>
      )}
    </div>
  );
};

export default AllJobs;
