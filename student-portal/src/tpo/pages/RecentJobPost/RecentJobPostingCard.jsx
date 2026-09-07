import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API_URL from "@/lib/api";
import {
  fetchJobsStart,
  fetchJobsSuccess,
  fetchJobsFailure,
  deleteJobStart,
  deleteJobSuccess,
  deleteJobFailure,
  updateJobStart,
  updateJobSuccess,
  updateJobFailure,
} from "@/store/slices/jobSlice";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreVertical,
  Banknote,
  Users,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  Eye,
  UserX,
  UserCheck2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  MapPin,
  Briefcase,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentJobPostingCard = ({ job }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showJobModal, setShowJobModal] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "funnel"
  const itemsPerPage = 10;

  const handleDelete = async () => {
    if (!confirm("Delete this job? This action cannot be undone.")) return;
    try {
      dispatch(deleteJobStart());
      await axios.delete(`${API_URL}/jobs/${job._id}`, {
        withCredentials: true,
      });
      dispatch(deleteJobSuccess(job._id));
      setMenuOpen(false);
    } catch (e) {
      dispatch(
        deleteJobFailure(e.response?.data?.message || "Failed to delete job."),
      );
    }
  };

  const handleUpdate = () => {
    navigate(`/tpo/jobs/edit/${job._id}`);
  };

  const toggleStatus = async (nextStatus) => {
    try {
      dispatch(updateJobStart());
      const res = await axios.put(
        `${API_URL}/jobs/${job._id}`,
        { status: nextStatus },
        { withCredentials: true },
      );
      dispatch(updateJobSuccess(res.data.job));
      setMenuOpen(false);
    } catch (e) {
      dispatch(
        updateJobFailure(
          e.response?.data?.message || "Failed to update status.",
        ),
      );
    }
  };

  const fetchApplicationCount = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/applications/job/${job._id}/count`,
        { withCredentials: true },
      );
      setApplicationCount(res.data.count);
    } catch (error) {
      console.error("Error fetching application count:", error);
    }
  };

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const res = await axios.get(`${API_URL}/applications/job/${job._id}`, {
        withCredentials: true,
      });
      setApplications(res.data);

      setShowJobModal(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setOpenMenuId(null); // Close menu immediately
      setUpdatingStatus(applicationId); // Show loading state

      await axios.put(
        `${API_URL}/applications/${applicationId}`,
        { status },
        { withCredentials: true },
      );

      // Refresh applications list
      const res = await axios.get(`${API_URL}/applications/job/${job._id}`, {
        withCredentials: true,
      });
      setApplications(res.data);

      // Update count
      await fetchApplicationCount();

      setUpdatingStatus(null);
    } catch (error) {
      console.error("Error updating application status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update application status";
      alert(errorMessage);
      setUpdatingStatus(null);
    }
  };

  // Fetch application count on mount
  useEffect(() => {
    fetchApplicationCount();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job._id]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId) {
        const menuElement = document.querySelector(
          `[data-menu-id="${openMenuId}"]`,
        );
        if (menuElement && !menuElement.contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId) {
      // Use setTimeout to avoid immediate closure
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openMenuId]);

  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">{job.company}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Banknote className="h-3 w-3" />
            {job.ctc ? `₹${job.ctc} LPA` : "CTC not specified"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Deadline:{" "}
            {job.deadline ? new Date(job.deadline).toLocaleDateString() : "-"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Poster: {job.postedBy?.fullName || "TPO"}
          </span>
          <span className="flex items-center gap-1">
            <UserCheck className="h-3 w-3" />
            Applications: {applicationCount}
          </span>
          <span className="flex items-center gap-1">
            {/* location not using icon here to keep compact */}
            Location: {job.location || "-"}
          </span>
        </div>
        <div className="mt-2 text-xs">
          <span className="font-semibold">Skills:</span>{" "}
          {job.skills ? job.skills.join(", ") : "-"}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant={job.status === "completed" ? "secondary" : "default"}>
          {job.status === "completed" ? "Completed" : "Active"}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchApplications}
          disabled={loadingApplications}
        >
          <Eye className="h-4 w-4 mr-1" />
          View Applicants ({applicationCount})
        </Button>
        <button
          className="p-2 rounded hover:bg-gray-100"
          aria-label="More actions"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-2 top-12 bg-white border shadow-md rounded w-48 z-10">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
              onClick={handleUpdate}
            >
              <Pencil className="h-4 w-4" /> Edit Job
            </button>
            {job.status !== "completed" ? (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                onClick={() => toggleStatus("completed")}
              >
                <CheckCircle2 className="h-4 w-4" /> Mark as Completed
              </button>
            ) : (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                onClick={() => toggleStatus("active")}
              >
                <RotateCcw className="h-4 w-4" /> Mark as Active
              </button>
            )}
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Job Details and Applicants Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex items-center justify-between border-b sticky top-0 bg-white z-10">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.ctc && (
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>₹{job.ctc} LPA</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowJobModal(false);
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-6">
              {/* Job Description */}
              {job.description && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-lg mb-3">
                    Job Description
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-lg mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicants Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4 border-b pb-3 border-slate-100">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Applicants ({applications.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 rounded-xl p-1 mr-2 border border-slate-200/40">
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Table
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("funnel")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          viewMode === "funnel" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Funnel
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-8 w-64 h-9 text-sm"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-36 h-9 text-sm">
                        <Filter className="h-3 w-3 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No applications yet.
                    </p>
                  </div>
                ) : viewMode === "funnel" ? (
                  <div className="flex gap-4 overflow-x-auto pb-4 pt-2 min-h-[480px]">
                    {[
                      { key: "pending", label: "Applied", color: "bg-yellow-500/10 text-yellow-700 border-yellow-200/50" },
                      { key: "reviewed", label: "Under Review", color: "bg-blue-500/10 text-blue-700 border-blue-200/50" },
                      { key: "shortlisted", label: "Shortlisted", color: "bg-purple-500/10 text-purple-700 border-purple-200/50" },
                      { key: "accepted", label: "Accepted", color: "bg-green-500/10 text-green-700 border-green-200/50" },
                      { key: "rejected", label: "Rejected", color: "bg-red-500/10 text-red-700 border-red-200/50" },
                    ].map((col) => {
                      const colApps = applications.filter((app) => {
                        const matchesSearch =
                          searchQuery === "" ||
                          app.student?.fullName
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          app.student?.email
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        return app.status === col.key && matchesSearch;
                      });
                      
                      return (
                        <div
                          key={col.key}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const id = e.dataTransfer.getData("applicationId");
                            if (id) updateApplicationStatus(id, col.key);
                          }}
                          className="flex-1 min-w-[210px] max-w-[260px] bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex flex-col space-y-3"
                        >
                          <div className={`flex items-center justify-between p-2 rounded-xl border ${col.color}`}>
                            <span className="text-xs font-bold">{col.label}</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/80 shadow-sm">{colApps.length}</span>
                          </div>

                          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pb-2">
                            {colApps.map((app) => (
                              <div
                                key={app._id || app.id}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData("applicationId", app._id || app.id)}
                                className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all space-y-2"
                              >
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{app.student?.fullName || "Student"}</h4>
                                  <p className="text-[9px] text-gray-400 font-semibold truncate">{app.student?.email}</p>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[9px] text-gray-400">
                                  <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                                  {/* Quick move buttons */}
                                  <div className="flex space-x-1">
                                    {col.key !== "pending" && (
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const prevStatuses = ["pending", "reviewed", "shortlisted", "accepted", "rejected"];
                                          const idx = prevStatuses.indexOf(col.key);
                                          if (idx > 0) updateApplicationStatus(app._id || app.id, prevStatuses[idx - 1]);
                                        }}
                                        className="p-1 hover:bg-slate-100 rounded text-gray-600 font-bold"
                                        title="Move Left"
                                      >
                                        ‹
                                      </button>
                                    )}
                                    {col.key !== "rejected" && col.key !== "accepted" && (
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const nextStatuses = ["pending", "reviewed", "shortlisted", "accepted", "rejected"];
                                          const idx = nextStatuses.indexOf(col.key);
                                          if (idx >= 0 && idx < nextStatuses.length - 1) updateApplicationStatus(app._id || app.id, nextStatuses[idx + 1]);
                                        }}
                                        className="p-1 hover:bg-slate-100 rounded text-gray-600 font-bold"
                                        title="Move Right"
                                      >
                                        ›
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {colApps.length === 0 && (
                              <div className="text-center py-8 text-[10px] text-gray-400 border border-dashed border-slate-200 rounded-xl">
                                Drag applicants here
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {/* Filtered and paginated applications */}
                    {(() => {
                      let filtered = applications.filter((app) => {
                        const matchesSearch =
                          searchQuery === "" ||
                          app.student?.fullName
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          app.student?.email
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase());
                        const matchesStatus =
                          statusFilter === "all" || app.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      // Pagination
                      const totalPages = Math.ceil(
                        filtered.length / itemsPerPage,
                      );
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const paginatedApps = filtered.slice(
                        startIndex,
                        startIndex + itemsPerPage,
                      );

                      return (
                        <>
                          {filtered.length === 0 ? (
                            <div className="text-center py-12">
                              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">
                                No applicants match your filters.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b bg-gray-50">
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Student
                                      </th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Email
                                      </th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Applied Date
                                      </th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginatedApps.map((application, index) => (
                                      <tr
                                        key={application._id}
                                        className={`border-b transition-colors ${
                                          index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50/50"
                                        } hover:bg-blue-50/50`}
                                      >
                                        <td className="py-3 px-4">
                                          <p className="font-medium text-sm text-gray-900">
                                            {application.student?.fullName ||
                                              "Unknown Student"}
                                          </p>
                                        </td>
                                        <td className="py-3 px-4">
                                          <p className="text-xs text-gray-600 break-all">
                                            {application.student?.email || "-"}
                                          </p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <Badge
                                            variant={
                                              application.status === "accepted"
                                                ? "default"
                                                : application.status ===
                                                    "rejected"
                                                  ? "destructive"
                                                  : application.status ===
                                                      "shortlisted"
                                                    ? "secondary"
                                                    : "secondary"
                                            }
                                            className={
                                              application.status ===
                                              "shortlisted"
                                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                : ""
                                            }
                                          >
                                            {application.status
                                              .charAt(0)
                                              .toUpperCase() +
                                              application.status.slice(1)}
                                          </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(
                                              application.appliedAt,
                                            ).toLocaleDateString()}
                                          </p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="flex items-center justify-center gap-1.5 min-h-[32px]">
                                            {updatingStatus === application._id ? (
                                              <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                            ) : (
                                              <>
                                                {/* If Applied or Under Review, show Shortlist button */}
                                                {(application.status === "pending" || application.status === "reviewed") && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateApplicationStatus(application._id, "shortlisted")}
                                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-100 flex items-center gap-1"
                                                  >
                                                    <UserCheck className="h-3.5 w-3.5" /> Shortlist
                                                  </button>
                                                )}

                                                {/* If Shortlisted, show Accept button */}
                                                {application.status === "shortlisted" && (
                                                  <>
                                                    <button
                                                      type="button"
                                                      onClick={() => navigate("/tpo/interviews", {
                                                        state: {
                                                          jobId: job._id || job.id,
                                                          studentId: application.studentId
                                                        }
                                                      })}
                                                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors border border-blue-100 flex items-center gap-1"
                                                    >
                                                      <Calendar className="h-3.5 w-3.5" /> Schedule Int
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => updateApplicationStatus(application._id, "accepted")}
                                                      className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-green-100 flex items-center gap-1"
                                                    >
                                                      <UserCheck2 className="h-3.5 w-3.5" /> Accept
                                                    </button>
                                                  </>
                                                )}

                                                {/* Show Reject button unless already rejected or accepted */}
                                                {application.status !== "rejected" && application.status !== "accepted" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateApplicationStatus(application._id, "rejected")}
                                                    className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                                                  >
                                                    <UserX className="h-3.5 w-3.5" /> Reject
                                                  </button>
                                                )}

                                                {/* Show Re-consider button if rejected */}
                                                {application.status === "rejected" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateApplicationStatus(application._id, "reviewed")}
                                                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                                                  >
                                                    <RotateCcw className="h-3.5 w-3.5" /> Re-consider
                                                  </button>
                                                )}

                                                {/* If accepted, show Placed status */}
                                                {application.status === "accepted" && (
                                                  <span className="text-xs font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1 select-none animate-pulse">
                                                    🎉 Placed
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    Showing {startIndex + 1}-
                                    {Math.min(
                                      startIndex + itemsPerPage,
                                      filtered.length,
                                    )}{" "}
                                    of {filtered.length} applicants
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setCurrentPage((prev) =>
                                          Math.max(1, prev - 1),
                                        )
                                      }
                                      disabled={currentPage === 1}
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                      Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setCurrentPage((prev) =>
                                          Math.min(totalPages, prev + 1),
                                        )
                                      }
                                      disabled={currentPage === totalPages}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

function RecentJobPostings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, loading, error } = useSelector((state) => state.jobs);

  const [activeJobs, setActiveJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [completedStats, setCompletedStats] = useState(null);

  // Modal state for completed jobs
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [currentCompletedJob, setCurrentCompletedJob] = useState(null);
  const [completedApplications, setCompletedApplications] = useState([]);
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");
  const [completedStatusFilter, setCompletedStatusFilter] = useState("all");
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [completedUpdatingStatus, setCompletedUpdatingStatus] = useState(null);
  const [completedOpenMenuId, setCompletedOpenMenuId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      dispatch(fetchJobsStart());
      try {
        const res = await axios.get(`${API_URL}/jobs`, {
          withCredentials: true,
        });
        dispatch(fetchJobsSuccess(res.data));
      } catch (e) {
        dispatch(
          fetchJobsFailure(
            e.response?.data?.message || "Failed to fetch jobs from API",
          ),
        );
      }
    };
    fetchJobs();
  }, [dispatch]);

  // Modal functions for completed jobs
  const openCompletedApplicationsModal = async (job) => {
    setCurrentCompletedJob(job);
    setCompletedSearchQuery("");
    setCompletedStatusFilter("all");
    setCompletedCurrentPage(1);
    try {
      const res = await axios.get(`${API_URL}/applications/job/${job._id}`, {
        withCredentials: true,
      });
      setCompletedApplications(res.data);
      setShowCompletedModal(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Failed to load applications");
    }
  };

  const updateCompletedApplicationStatus = async (applicationId, status) => {
    try {
      setCompletedOpenMenuId(null);
      setCompletedUpdatingStatus(applicationId);

      await axios.put(
        `${API_URL}/applications/${applicationId}`,
        { status },
        { withCredentials: true },
      );

      // Refresh applications list
      const res = await axios.get(
        `${API_URL}/applications/job/${currentCompletedJob._id}`,
        { withCredentials: true },
      );
      setCompletedApplications(res.data);

      // Update completed stats
      if (completedStats) {
        const updatedStats = completedStats.map((stat) => {
          if (stat.jobId === currentCompletedJob._id) {
            return {
              ...stat,
              accepted: res.data.filter((app) => app.status === "accepted")
                .length,
              shortlisted: res.data.filter(
                (app) => app.status === "shortlisted",
              ).length,
              rejected: res.data.filter((app) => app.status === "rejected")
                .length,
              pending: res.data.filter((app) => app.status === "pending")
                .length,
            };
          }
          return stat;
        });
        setCompletedStats(updatedStats);
      }

      setCompletedUpdatingStatus(null);
    } catch (error) {
      console.error("Error updating application status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update application status";
      alert(errorMessage);
      setCompletedUpdatingStatus(null);
    }
  };

  const closeCompletedModal = () => {
    setShowCompletedModal(false);
    setCompletedSearchQuery("");
    setCompletedStatusFilter("all");
    setCompletedCurrentPage(1);
    setCurrentCompletedJob(null);
    setCompletedApplications([]);
  };

  // Close menu when clicking outside for completed modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (completedOpenMenuId) {
        const menuElement = document.querySelector(
          `[data-menu-id="${completedOpenMenuId}"]`,
        );
        if (menuElement && !menuElement.contains(event.target)) {
          setCompletedOpenMenuId(null);
        }
      }
    };

    if (completedOpenMenuId) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [completedOpenMenuId]);

  // Separate active and completed jobs
  useEffect(() => {
    if (jobs) {
      const active = jobs.filter((job) => job.status !== "completed");
      const completed = jobs.filter((job) => job.status === "completed");
      setActiveJobs(active);
      setCompletedJobs(completed);

      // Calculate stats for completed jobs
      if (completed.length > 0) {
        const fetchCompletedStats = async () => {
          try {
            const statsPromises = completed.map(async (job) => {
              try {
                const res = await axios.get(
                  `${API_URL}/applications/job/${job._id}`,
                  { withCredentials: true },
                );
                const applications = res.data;
                return {
                  jobId: job._id,
                  jobTitle: job.title,
                  total: applications.length,
                  accepted: applications.filter(
                    (app) => app.status === "accepted",
                  ).length,
                  shortlisted: applications.filter(
                    (app) => app.status === "shortlisted",
                  ).length,
                  rejected: applications.filter(
                    (app) => app.status === "rejected",
                  ).length,
                  pending: applications.filter(
                    (app) => app.status === "pending",
                  ).length,
                };
              } catch {
                return {
                  jobId: job._id,
                  jobTitle: job.title,
                  total: 0,
                  accepted: 0,
                  shortlisted: 0,
                  rejected: 0,
                  pending: 0,
                };
              }
            });
            const stats = await Promise.all(statsPromises);
            setCompletedStats(stats);
          } catch (err) {
            console.error("Error fetching completed job stats:", err);
          }
        };
        fetchCompletedStats();
      }
    }
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Active Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Job Postings</CardTitle>
            <CardDescription>
              Latest opportunities from partner companies
            </CardDescription>
          </div>
          <Button onClick={() => navigate("/tpo/jobs/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div>Loading jobs...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {activeJobs && activeJobs.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No active jobs found.
            </div>
          )}
          {activeJobs.map((job) => (
            <RecentJobPostingCard key={job._id} job={job} />
          ))}
        </CardContent>
      </Card>

      {/* Completed Jobs Summary */}
      {completedJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Completed Jobs Summary
            </CardTitle>
            <CardDescription>
              Overview of completed job postings and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !completedStats ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading statistics...
              </div>
            ) : (
              <div className="space-y-4">
                {completedStats.map((stat) => {
                  const job = completedJobs.find((j) => j._id === stat.jobId);
                  return (
                    <div
                      key={stat.jobId}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {stat.jobTitle}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {job?.company || "Company"}
                          </p>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {stat.total}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Total Applicants
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">
                            {stat.accepted}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Accepted</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            {stat.shortlisted}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Shortlisted
                          </p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">
                            {stat.rejected}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Rejected</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-600">
                            {stat.pending}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Pending</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/tpo/jobs/edit/${stat.jobId}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openCompletedApplicationsModal(
                              completedJobs.find((j) => j._id === stat.jobId),
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Applications
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Jobs Applications Modal */}
      {showCompletedModal && currentCompletedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex items-center justify-between border-b sticky top-0 bg-white z-10">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">
                  {currentCompletedJob.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">
                      {currentCompletedJob.company}
                    </span>
                  </div>
                  {currentCompletedJob.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{currentCompletedJob.location}</span>
                    </div>
                  )}
                  {currentCompletedJob.ctc && (
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>₹{currentCompletedJob.ctc} LPA</span>
                    </div>
                  )}
                  {currentCompletedJob.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Deadline:{" "}
                        {new Date(
                          currentCompletedJob.deadline,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCompletedModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-6">
              {/* Job Description */}
              {currentCompletedJob.description && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-lg mb-3">
                    Job Description
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {currentCompletedJob.description}
                  </p>
                </div>
              )}

              {/* Skills */}
              {currentCompletedJob.skills &&
                currentCompletedJob.skills.length > 0 && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="font-semibold text-lg mb-3">
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCompletedJob.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Applicants Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Applicants ({completedApplications.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={completedSearchQuery}
                        onChange={(e) => {
                          setCompletedSearchQuery(e.target.value);
                          setCompletedCurrentPage(1);
                        }}
                        className="pl-8 w-64 h-9 text-sm"
                      />
                    </div>
                    <Select
                      value={completedStatusFilter}
                      onValueChange={(value) => {
                        setCompletedStatusFilter(value);
                        setCompletedCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-36 h-9 text-sm">
                        <Filter className="h-3 w-3 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {completedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No applications yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Filtered and paginated applications */}
                    {(() => {
                      // Filter applications
                      let filtered = completedApplications.filter((app) => {
                        const matchesSearch =
                          completedSearchQuery === "" ||
                          app.student?.fullName
                            ?.toLowerCase()
                            .includes(completedSearchQuery.toLowerCase()) ||
                          app.student?.email
                            ?.toLowerCase()
                            .includes(completedSearchQuery.toLowerCase());
                        const matchesStatus =
                          completedStatusFilter === "all" ||
                          app.status === completedStatusFilter;
                        return matchesSearch && matchesStatus;
                      });

                      // Pagination
                      const totalPages = Math.ceil(filtered.length / 10);
                      const startIndex = (completedCurrentPage - 1) * 10;
                      const paginatedApps = filtered.slice(
                        startIndex,
                        startIndex + 10,
                      );

                      return (
                        <>
                          {filtered.length === 0 ? (
                            <div className="text-center py-12">
                              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">
                                No applicants match your filters.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b bg-gray-50">
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Student
                                      </th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Email
                                      </th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Applied Date
                                      </th>
                                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginatedApps.map((application, index) => (
                                      <tr
                                        key={application._id}
                                        className={`border-b transition-colors ${
                                          index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50/50"
                                        } hover:bg-blue-50/50`}
                                      >
                                        <td className="py-3 px-4">
                                          <p className="font-medium text-sm text-gray-900">
                                            {application.student?.fullName ||
                                              "Unknown Student"}
                                          </p>
                                        </td>
                                        <td className="py-3 px-4">
                                          <p className="text-xs text-gray-600 break-all">
                                            {application.student?.email || "-"}
                                          </p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <Badge
                                            variant={
                                              application.status === "accepted"
                                                ? "default"
                                                : application.status ===
                                                    "rejected"
                                                  ? "destructive"
                                                  : application.status ===
                                                      "shortlisted"
                                                    ? "secondary"
                                                    : "secondary"
                                            }
                                            className={
                                              application.status ===
                                              "shortlisted"
                                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                : ""
                                            }
                                          >
                                            {application.status
                                              .charAt(0)
                                              .toUpperCase() +
                                              application.status.slice(1)}
                                          </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(
                                              application.appliedAt,
                                            ).toLocaleDateString()}
                                          </p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="flex items-center justify-center gap-1.5 min-h-[32px]">
                                            {completedUpdatingStatus === application._id ? (
                                              <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                            ) : (
                                              <>
                                                {/* If Applied or Under Review, show Shortlist button */}
                                                {(application.status === "pending" || application.status === "reviewed") && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateCompletedApplicationStatus(application._id, "shortlisted")}
                                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-100 flex items-center gap-1"
                                                  >
                                                    <UserCheck className="h-3.5 w-3.5" /> Shortlist
                                                  </button>
                                                )}

                                                {/* If Shortlisted, show Accept button */}
                                                {application.status === "shortlisted" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateCompletedApplicationStatus(application._id, "accepted")}
                                                    className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-green-100 flex items-center gap-1"
                                                  >
                                                    <UserCheck2 className="h-3.5 w-3.5" /> Accept
                                                  </button>
                                                )}

                                                {/* Show Reject button unless already rejected or accepted */}
                                                {application.status !== "rejected" && application.status !== "accepted" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateCompletedApplicationStatus(application._id, "rejected")}
                                                    className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                                                  >
                                                    <UserX className="h-3.5 w-3.5" /> Reject
                                                  </button>
                                                )}

                                                {/* Show Re-consider button if rejected */}
                                                {application.status === "rejected" && (
                                                  <button
                                                    type="button"
                                                    onClick={() => updateCompletedApplicationStatus(application._id, "reviewed")}
                                                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                                                  >
                                                    <RotateCcw className="h-3.5 w-3.5" /> Re-consider
                                                  </button>
                                                )}

                                                {/* If accepted, show Placed status */}
                                                {application.status === "accepted" && (
                                                  <span className="text-xs font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1 select-none animate-pulse">
                                                    🎉 Placed
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    Showing {startIndex + 1}-
                                    {Math.min(startIndex + 10, filtered.length)}{" "}
                                    of {filtered.length} applicants
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setCompletedCurrentPage((prev) =>
                                          Math.max(1, prev - 1),
                                        )
                                      }
                                      disabled={completedCurrentPage === 1}
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                      Page {completedCurrentPage} of{" "}
                                      {totalPages}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setCompletedCurrentPage((prev) =>
                                          Math.min(totalPages, prev + 1),
                                        )
                                      }
                                      disabled={
                                        completedCurrentPage === totalPages
                                      }
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default RecentJobPostings;
