import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentJobPostingCard = ({ job }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this job? This action cannot be undone.")) return;
    try {
      dispatch(deleteJobStart());
      await axios.delete(`http://localhost:4000/api/jobs/${job._id}`, {
        withCredentials: true,
      });
      dispatch(deleteJobSuccess(job._id));
      setMenuOpen(false);
    } catch (e) {
      dispatch(
        deleteJobFailure(e.response?.data?.message || "Failed to delete job.")
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
        `http://localhost:4000/api/jobs/${job._id}`,
        { status: nextStatus },
        { withCredentials: true }
      );
      dispatch(updateJobSuccess(res.data.job));
      setMenuOpen(false);
    } catch (e) {
      dispatch(
        updateJobFailure(
          e.response?.data?.message || "Failed to update status."
        )
      );
    }
  };

  const fetchApplicationCount = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/api/applications/job/${job._id}/count`,
        { withCredentials: true }
      );
      setApplicationCount(res.data.count);
    } catch (error) {
      console.error("Error fetching application count:", error);
    }
  };

  const fetchApplications = async () => {
    if (applicationsOpen) {
      setApplicationsOpen(false);
      return;
    }

    setLoadingApplications(true);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/applications/job/${job._id}`,
        { withCredentials: true }
      );
      setApplications(res.data);
      setApplicationsOpen(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
      alert("Failed to load applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  // Fetch application count on mount
  useEffect(() => {
    fetchApplicationCount();
  }, [job._id]);

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
          {applicationsOpen ? "Hide" : "View"} ({applicationCount})
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
      {applicationsOpen && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Applicants ({applications.length})
          </h4>
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications yet.
            </p>
          ) : (
            <div className="space-y-2">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {application.student?.fullName || "Unknown Student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.student?.email || ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Applied:{" "}
                      {new Date(application.appliedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      application.status === "accepted"
                        ? "default"
                        : application.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function RecentJobPostings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, loading, error } = useSelector((state) => state.jobs);

  useEffect(() => {
    const fetchJobs = async () => {
      dispatch(fetchJobsStart());
      try {
        const res = await axios.get("http://localhost:4000/api/jobs", {
          withCredentials: true,
        });
        dispatch(fetchJobsSuccess(res.data));
      } catch (e) {
        dispatch(
          fetchJobsFailure(
            e.response?.data?.message || "Failed to fetch jobs from API"
          )
        );
      }
    };
    fetchJobs();
  }, [dispatch]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Job Postings</CardTitle>
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
        {jobs && jobs.length === 0 && !loading && <div>No jobs found.</div>}
        {jobs.map((job) => (
          <RecentJobPostingCard key={job._id} job={job} />
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentJobPostings;
