import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/Routes/studentRout/routes";
import {
  FaChartLine,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import axios from "axios";

const JobCard = ({ job }) => {
  const isActive = job.status === "active";
  const statusBadge = isActive ? (
    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
      Active
    </span>
  ) : (
    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
      Completed
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
        <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
      )}
      <div className="flex justify-end items-center mt-4">
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
        // Show only active jobs and limit to 3 for recommendations
        setJobs(all.filter((j) => j.status === "active").slice(0, 3));
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <FaChartLine className="text-xl text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Recommended Jobs For You
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Latest openings from your TPO
      </p>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
          {jobs.length === 0 && <div>No active jobs right now.</div>}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
