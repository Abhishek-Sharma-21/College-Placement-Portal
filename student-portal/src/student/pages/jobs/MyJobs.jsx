import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaEye,
  FaFileAlt,
} from "react-icons/fa";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800",
      icon: <FaHourglassHalf className="h-3 w-3" />,
    },
    reviewed: {
      label: "Under Review",
      className: "bg-blue-100 text-blue-800",
      icon: <FaEye className="h-3 w-3" />,
    },
    shortlisted: {
      label: "Shortlisted",
      className: "bg-purple-100 text-purple-800",
      icon: <FaFileAlt className="h-3 w-3" />,
    },
    accepted: {
      label: "Accepted",
      className: "bg-green-100 text-green-800",
      icon: <FaCheckCircle className="h-3 w-3" />,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800",
      icon: <FaTimesCircle className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge className={`${config.className} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const ApplicationCard = ({ application }) => {
  const job = application.job;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <p className="flex items-center gap-2 text-md text-gray-600">
              <FaBuilding /> {job.company}
            </p>
          </div>
          <StatusBadge status={application.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt /> {job.location || "Not specified"}
            </span>
            <span className="flex items-center gap-1.5">
              <FaMoneyBillWave /> {job.ctc ? `₹${job.ctc} LPA` : "Not Disclosed"}
            </span>
            <span className="flex items-center gap-1.5">
              <FaClock /> Deadline:{" "}
              {job.deadline
                ? new Date(job.deadline).toLocaleDateString()
                : "Not specified"}
            </span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">
                  Applied on:{" "}
                  <span className="font-medium">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                </p>
                {application.notes && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Notes:</span> {application.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {job.applicationLink && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(job.applicationLink, "_blank")}
              >
                <FaFileAlt className="h-4 w-4 mr-2" />
                View Application Link
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MyJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, reviewed, shortlisted, accepted, rejected

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:4000/api/applications/my", {
        withCredentials: true,
      });
      setApplications(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch applications.");
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    reviewed: applications.filter((app) => app.status === "reviewed").length,
    shortlisted: applications.filter((app) => app.status === "shortlisted")
      .length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">My Job Applications</h2>
        <p className="text-md text-gray-600 mt-1">
          Track and manage all your job applications
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b pb-4">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "reviewed", label: "Under Review" },
          { key: "shortlisted", label: "Shortlisted" },
          { key: "accepted", label: "Accepted" },
          { key: "rejected", label: "Rejected" },
        ].map((status) => (
          <button
            key={status.key}
            onClick={() => setFilter(status.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.label} ({statusCounts[status.key]})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-500">Loading applications...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 text-red-600">
          {error}
          <Button
            variant="outline"
            className="mt-4"
            onClick={fetchApplications}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Applications List */}
      {!loading && !error && (
        <>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600">
                {filter === "all"
                  ? "No applications yet"
                  : `No ${filter} applications`}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {filter === "all"
                  ? "Start applying to jobs to see them here"
                  : "Try selecting a different filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Summary Stats */}
      {!loading && !error && applications.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts.all}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts.pending}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">
              {statusCounts.shortlisted}
            </p>
            <p className="text-sm text-gray-600">Shortlisted</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {statusCounts.accepted}
            </p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {statusCounts.rejected}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;

