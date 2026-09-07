import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "@/lib/api";
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
    applied: {
      label: "Applied",
      className: "bg-blue-100 text-blue-800",
      icon: <FaHourglassHalf className="h-3 w-3" />,
    },
    under_review: {
      label: "Under Review",
      className: "bg-indigo-100 text-indigo-800",
      icon: <FaEye className="h-3 w-3" />,
    },
    shortlisted: {
      label: "Shortlisted",
      className: "bg-purple-100 text-purple-800",
      icon: <FaFileAlt className="h-3 w-3" />,
    },
    assessment: {
      label: "Assessment Stage",
      className: "bg-orange-100 text-orange-800 border border-orange-200",
      icon: <FaFileAlt className="h-3 w-3" />,
    },
    interview: {
      label: "Interview Stage",
      className: "bg-pink-100 text-pink-800",
      icon: <FaFileAlt className="h-3 w-3" />,
    },
    selected: {
      label: "Selected 🎉",
      className: "bg-green-100 text-green-800",
      icon: <FaCheckCircle className="h-3 w-3" />,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800",
      icon: <FaTimesCircle className="h-3 w-3" />,
    },
    // Fallbacks for legacy/local mocks
    pending: {
      label: "Applied",
      className: "bg-blue-100 text-blue-800",
      icon: <FaHourglassHalf className="h-3 w-3" />,
    },
    reviewed: {
      label: "Under Review",
      className: "bg-indigo-100 text-indigo-800",
      icon: <FaEye className="h-3 w-3" />,
    },
    accepted: {
      label: "Selected 🎉",
      className: "bg-green-100 text-green-800",
      icon: <FaCheckCircle className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || statusConfig.applied;

  return (
    <Badge className={`${config.className} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

const ApplicationCard = ({ application, assessments }) => {
  const job = application.job;
  const navigate = useNavigate();
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Check if there is a live assessment linked to this job
  const linkedAssessment = assessments.find(
    (asm) => asm.jobId === job.id || asm.jobId === job._id
  );

  // Check if the student has already taken/submitted it
  const hasResult =
    linkedAssessment?.results && linkedAssessment.results.length > 0;

  // Pipeline constants
  const pipelineStages = ["applied", "under_review", "shortlisted", "assessment", "interview", "selected"];
  const stageLabels = ["Applied", "Review", "Shortlist", "Test", "Interview", "Selected"];
  const currentStage = application.status === "pending" ? "applied" : application.status === "reviewed" ? "under_review" : application.status === "accepted" ? "selected" : application.status;
  const isRejected = currentStage === "rejected";
  const activeIndex = pipelineStages.indexOf(currentStage);

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
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt /> {job.location || "Not specified"}
            </span>
            <span className="flex items-center gap-1.5">
              <FaMoneyBillWave />{" "}
              {job.ctc ? `₹${job.ctc} LPA` : "Not Disclosed"}
            </span>
            <span className="flex items-center gap-1.5">
              <FaClock /> Deadline:{" "}
              {job.deadline
                ? new Date(job.deadline).toLocaleDateString()
                : "Not specified"}
            </span>
          </div>

          {/* Interactive Visual Pipeline Progress */}
          <div className="py-3 border-t border-b border-slate-100 flex items-center justify-between gap-1 overflow-x-auto text-[10px] text-gray-400 font-bold uppercase">
            {pipelineStages.map((stage, idx) => {
              const isActive = !isRejected && idx <= activeIndex;
              const isCurrent = !isRejected && idx === activeIndex;
              return (
                <div key={stage} className="flex items-center gap-1">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] ${
                    isCurrent ? "bg-blue-600 text-white animate-pulse" : isActive ? "bg-emerald-500 text-white" : "bg-slate-100 text-gray-500"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={isCurrent ? "text-blue-600 font-extrabold" : isActive ? "text-emerald-600" : "text-gray-400"}>
                    {stageLabels[idx]}
                  </span>
                  {idx < pipelineStages.length - 1 && (
                    <span className="text-slate-200 font-normal">→</span>
                  )}
                </div>
              );
            })}
            {isRejected && (
              <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-extrabold text-[9px]">
                Rejected ✕
              </div>
            )}
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-650 text-xs">
                  Applied on:{" "}
                  <span className="font-semibold text-gray-800">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                </p>
                {application.notes && (
                  <p className="text-gray-650 text-xs mt-1">
                    <span className="font-semibold">Notes:</span>{" "}
                    {application.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Test Linkage Warning box */}
          {linkedAssessment && !hasResult && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-800">⚠️ Assessment Pending</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                  Please complete the required test "{linkedAssessment.title}".
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/assessments/${linkedAssessment._id}/take`)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Take Test
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {job.applicationLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(job.applicationLink, "_blank")}
                className="text-xs h-9"
              >
                <FaFileAlt className="h-3 w-3 mr-1.5" />
                Application Link
              </Button>
            )}

            {job.description && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDescriptionModal(true)}
                className="text-xs h-9"
              >
                <FaEye className="h-3 w-3 mr-1.5" />
                Job Info
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              className="text-xs h-9"
            >
              Timeline History
            </Button>
          </div>
        </div>
      </Card>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/45 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden relative flex flex-col">
            <h3 className="text-base font-extrabold text-slate-800 mb-4">Recruitment Stages History</h3>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="space-y-4 overflow-y-auto pl-2 pr-1 flex-1 py-2">
              {Array.isArray(application.statusHistory) && application.statusHistory.length > 0 ? (
                application.statusHistory.map((step, idx) => (
                  <div key={idx} className="flex gap-3 relative pb-4">
                    {idx < application.statusHistory.length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-slate-100" />
                    )}
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center z-10 border-4 border-white mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-850 capitalize">{step.status.replace("_", " ")}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{new Date(step.updatedAt || step.timestamp || application.appliedAt).toLocaleString()}</span>
                      </div>
                      {step.notes && (
                        <p className="text-[11px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100/50 mt-1">
                          <strong>TPO Notes:</strong> "{step.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-3 relative">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center z-10 border-4 border-white mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-850">Applied</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{new Date(application.appliedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 italic">No historical stages recorded.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <h3 className="text-xl font-semibold mb-4">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
            <button
              onClick={() => setShowDescriptionModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

const MyJobs = () => {
  const [applications, setApplications] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appRes, assessRes] = await Promise.all([
        axios.get(`${API_URL}/applications/my`, { withCredentials: true }),
        axios.get(`${API_URL}/assessments/live`, { withCredentials: true }),
      ]);
      setApplications(appRes.data || []);
      setAssessments(assessRes.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch applications.");
      console.error("Error fetching applications:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    if (filter === "applied") return app.status === "applied" || app.status === "pending";
    if (filter === "under_review") return app.status === "under_review" || app.status === "reviewed";
    if (filter === "selected") return app.status === "selected" || app.status === "accepted";
    return app.status === filter;
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter((app) => app.status === "applied" || app.status === "pending").length,
    under_review: applications.filter((app) => app.status === "under_review" || app.status === "reviewed").length,
    shortlisted: applications.filter((app) => app.status === "shortlisted").length,
    assessment: applications.filter((app) => app.status === "assessment").length,
    interview: applications.filter((app) => app.status === "interview").length,
    selected: applications.filter((app) => app.status === "selected" || app.status === "accepted").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          My Job Applications
        </h2>
        <p className="text-md text-gray-600 mt-1">
          Track and manage all your job applications
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b pb-4">
        {[
          { key: "all", label: "All" },
          { key: "applied", label: "Applied" },
          { key: "under_review", label: "Under Review" },
          { key: "shortlisted", label: "Shortlisted" },
          { key: "assessment", label: "Assessment" },
          { key: "interview", label: "Interview" },
          { key: "selected", label: "Selected" },
          { key: "rejected", label: "Rejected" },
        ].map((statusTab) => (
          <button
            key={statusTab.key}
            onClick={() => setFilter(statusTab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-xs ${
              filter === statusTab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {statusTab.label} ({statusCounts[statusTab.key] || 0})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading applications...
        </div>
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
                  : `No ${filter.replace("_", " ")} applications`}
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
                  key={application._id || application.id}
                  application={application}
                  assessments={assessments}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Summary Stats */}
      {!loading && !error && applications.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600 font-black">
              {statusCounts.all}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600 font-black">
              {statusCounts.shortlisted}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Shortlisted</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600 font-black">
              {statusCounts.selected}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Selected</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600 font-black">
              {statusCounts.rejected}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Rejected</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
