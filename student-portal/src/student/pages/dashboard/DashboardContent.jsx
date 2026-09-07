import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "@/lib/api";
import { ROUTES } from "@/Routes/studentRout/routes.jsx";
import {
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  Bookmark,
  Bell,
  Clock,
  ArrowRight,
  TrendingUp,
  FilePlus,
  BookOpen,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

export default function DashboardContent() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.studentProfile);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const upcomingInterviews = interviews.filter(int => new Date(int.scheduledAt).getTime() + (int.duration * 60 * 1000) > Date.now());
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes, annRes, intsRes] = await Promise.all([
          axios.get(`${API_URL}/jobs`, { withCredentials: true }),
          axios.get(`${API_URL}/applications/my`, { withCredentials: true }),
          axios.get(`${API_URL}/announcements`, { withCredentials: true }),
          axios.get(`${API_URL}/interviews`, { withCredentials: true }),
        ]);

        setJobs(jobsRes.data || []);
        setApplications(appsRes.data || []);
        setAnnouncements(annRes.data.announcements || []);
        setInterviews(intsRes.data || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (jobId, isExternal) => {
    try {
      await axios.post(
        `${API_URL}/applications/job/${jobId}`,
        {},
        { withCredentials: true },
      );

      // Refresh applications list
      const appsRes = await axios.get(`${API_URL}/applications/my`, {
        withCredentials: true,
      });
      setApplications(appsRes.data || []);

      alert("Application submitted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit application.");
    }
  };

  const isApplied = (jobId) => {
    return applications.some(
      (app) => (app.job && app.job.id === jobId) || app.jobId === jobId,
    );
  };

  const formatCTC = (ctc) => {
    if (!ctc) return "3.6 - 7 LPA";
    return `${ctc} LPA`;
  };

  // Helper to generate initials/colors for company logo
  const getCompanyBrand = (company) => {
    const name = company.toLowerCase();
    if (name.includes("tcs") || name.includes("tata")) {
      return {
        initials: "tcs",
        color: "bg-red-50 text-red-600 border-red-100",
        logoText: "tcs",
        fullName: "Tata Consultancy Services",
      };
    }
    if (name.includes("infosys")) {
      return {
        initials: "Inf",
        color: "bg-blue-50 text-blue-600 border-blue-100",
        logoText: "Infosys",
        fullName: "Infosys Limited",
      };
    }
    if (name.includes("wipro")) {
      return {
        initials: "wip",
        color: "bg-purple-50 text-purple-600 border-purple-100",
        logoText: "wipro",
        fullName: "Wipro Limited",
      };
    }
    if (name.includes("accenture")) {
      return {
        initials: "Ac",
        color: "bg-purple-950 text-purple-300 border-purple-900",
        logoText: "accenture",
        fullName: "Accenture plc",
      };
    }
    return {
      initials: company.substring(0, 3).toUpperCase(),
      color: "bg-slate-50 text-slate-600 border-slate-100",
      logoText: company.toLowerCase(),
      fullName: company,
    };
  };

  const shortlistedCount = applications.filter(
    (app) => app.status === "shortlisted" || app.status === "accepted",
  ).length;
  const recommendedJobs = jobs
    .filter((job) => job.status === "active")
    .slice(0, 3);

  const placementProgressPercent = 68;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        {/* Banner Left Info */}
        <div className="space-y-3 z-10 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 text-lg overflow-hidden">
              {profile?.profilePicUrl ? (
                <img
                  src={profile.profilePicUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : user?.fullName ? (
                user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              ) : (
                "GN"
              )}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 justify-center md:justify-start">
                Welcome back, {user?.fullName || "Student"}!{" "}
                <span className="animate-bounce">👋</span>
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                {profile?.branch || "Computer Science"} • CGPA:{" "}
                {profile?.cgpa || "7.2"} • Graduate in{" "}
                {profile?.gradYear || "2026"}
              </p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-gray-500 max-w-lg leading-relaxed mt-2">
            Stay consistent and keep applying. Your dream job is closer than you
            think!
          </p>
        </div>

        {/* Banner Right Stats Block */}
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 bg-[#fafafa] p-4 rounded-2xl border border-gray-100 sm:w-auto w-full justify-around">
          {/* Progress Circular visual */}
          <div className="flex items-center space-x-3">
            <div className="relative w-14 h-14">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-gray-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  strokeWidth="3.5"
                  strokeDasharray={`${placementProgressPercent}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                {placementProgressPercent}%
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Placement Progress
              </h4>
              <button
                onClick={() =>
                  alert("Detailed stats can be seen under My Applications.")
                }
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View Details <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          {/* Business suit illustration in background */}
          <div className="hidden lg:block w-36 h-20 relative">
            <svg
              viewBox="0 0 100 80"
              className="w-full h-full text-blue-100 fill-current opacity-80"
            >
              <rect
                x="15"
                y="25"
                width="50"
                height="35"
                rx="4"
                fill="#3b82f6"
                fillOpacity="0.2"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <path
                d="M30,25 L30,20 C30,18 32,16 35,16 L45,16 C48,16 50,18 50,20 L50,25"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <line
                x1="15"
                y1="40"
                x2="65"
                y2="40"
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
              <rect
                x="48"
                y="10"
                width="35"
                height="45"
                rx="3"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <circle cx="65" cy="22" r="4" fill="#3b82f6" />
              <rect x="56" y="32" width="18" height="2" rx="1" fill="#94a3b8" />
              <rect x="56" y="38" width="18" height="2" rx="1" fill="#94a3b8" />
              <rect x="56" y="44" width="12" height="2" rx="1" fill="#94a3b8" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {applications.length}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Jobs Applied
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {shortlistedCount}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Shortlisted
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{upcomingInterviews.length}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Interviews Scheduled
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">5</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Upcoming Tests
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Double Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Double Column (Recommended Jobs & Placement Progress) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommended Jobs */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Recommended Jobs
                for You
              </h3>
              <button
                onClick={() => navigate(ROUTES.ALL_JOBS)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All Jobs <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 font-semibold -mt-2">
              Top job openings matching your profile
            </p>

            <div className="divide-y divide-gray-50 pt-2 space-y-3">
              {recommendedJobs.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 font-medium">
                  No recommended active jobs found at the moment.
                </div>
              ) : (
                recommendedJobs.map((job) => {
                  const brand = getCompanyBrand(job.company);
                  const isJobApplied = isApplied(job.id);

                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between pt-3 first:pt-0"
                    >
                      {/* Logo and Job Info */}
                      <div className="flex items-center space-x-3.5 flex-1">
                        <div
                          className={`w-11 h-11 border rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm ${brand.color}`}
                        >
                          {brand.logoText}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-extrabold text-gray-900">
                            {job.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold">
                            {brand.fullName}
                          </p>
                          <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400 font-medium pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-300" />{" "}
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-gray-300" />{" "}
                              0-2 Yrs
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              ₹ {formatCTC(job.ctc)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Actions */}
                      <div className="flex items-center space-x-3 pl-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-[9px] font-bold text-red-500 uppercase">
                            Apply before
                          </p>
                          <p className="text-[10px] font-extrabold text-gray-800">
                            {new Date(job.deadline).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <button
                          disabled={isJobApplied}
                          onClick={() =>
                            handleApply(job.id, !!job.applicationLink)
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isJobApplied
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-50"
                          }`}
                        >
                          {isJobApplied ? "Applied" : "Apply Now"}
                        </button>
                        <button
                          onClick={() => alert("Job bookmarked!")}
                          className="p-2 hover:bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => navigate(ROUTES.ALL_JOBS)}
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center"
              >
                View All Jobs <ChevronRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          {/* Placement Progress Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Placement
                Progress
              </h3>
              <button
                onClick={() => navigate(ROUTES.MY_JOBS)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View Details
              </button>
            </div>

            {/* Timeline Steps wrapper */}
            <div className="relative pt-4 pb-2">
              {/* Timeline Connector Line */}
              <div className="absolute top-[28px] left-[5%] right-[5%] h-1 bg-gray-100 rounded-full z-0">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: applications.length > 0 ? "50%" : "30%" }}
                ></div>
              </div>

              {/* Step Circles */}
              <div className="flex justify-between relative z-10">
                {/* Step 1 */}
                <div className="flex flex-col items-center space-y-2 text-center w-16">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-50 flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">
                    Profile
                  </span>
                  <span className="text-[8px] text-gray-400 font-medium -mt-1.5 block">
                    Completed
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center space-y-2 text-center w-16">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-50 flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">
                    Eligible
                  </span>
                  <span className="text-[8px] text-gray-400 font-medium -mt-1.5 block">
                    Verified
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center space-y-2 text-center w-16">
                  <div
                    className={`w-6 h-6 rounded-full border-4 flex items-center justify-center text-white text-[10px] font-bold ${
                      applications.length > 0
                        ? "bg-emerald-500 border-emerald-50"
                        : "bg-gray-100 border-white text-gray-400"
                    }`}
                  >
                    {applications.length > 0 ? "✓" : "3"}
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">
                    Applied
                  </span>
                  <span className="text-[8px] text-gray-400 font-medium -mt-1.5 block">
                    {applications.length} Jobs
                  </span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center space-y-2 text-center w-16">
                  <div
                    className={`w-6 h-6 rounded-full border-4 flex items-center justify-center text-white text-[10px] font-bold ${
                      shortlistedCount > 0
                        ? "bg-emerald-500 border-emerald-50"
                        : "bg-gray-100 border-white text-gray-400"
                    }`}
                  >
                    {shortlistedCount > 0 ? "✓" : "4"}
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">
                    Shortlisted
                  </span>
                  <span className="text-[8px] text-gray-400 font-medium -mt-1.5 block">
                    {shortlistedCount} Jobs
                  </span>
                </div>

                {/* Step 5 */}
                <div className="flex flex-col items-center space-y-2 text-center w-16">
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-4 border-white text-gray-400 text-[10px] font-bold">
                    5
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">
                    Interview
                  </span>
                  <span className="text-[8px] text-gray-400 font-medium -mt-1.5 block">
                    {upcomingInterviews.length} Rounds
                  </span>
                </div>

                {/* Step 6 */}
                <div className="flex flex-col items-center space-y-2 text-center w-16">
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-4 border-white text-gray-400 text-[10px] font-bold">
                    6
                  </div>
                  <span className="text-[10px] font-bold text-gray-800">
                    Offered
                  </span>
                  <span className="text-[8px] text-gray-400 font-medium -mt-1.5 block">
                    —
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Single Column (Upcoming Events & TPO Announcements) */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Events
              </h3>
              <button
                onClick={() => navigate(ROUTES.INTERVIEWS)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto text-slate-200 mb-1" />
                  <p className="text-[10px] font-bold">No upcoming interviews scheduled</p>
                </div>
              ) : (
                upcomingInterviews.slice(0, 3).map((int) => (
                  <div
                    key={int.id}
                    onClick={() => navigate(ROUTES.INTERVIEWS)}
                    className="flex items-start space-x-3 p-3 bg-[#fdfdfd] rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-all cursor-pointer"
                  >
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-gray-900 truncate pr-2">
                          {int.job?.company}: {int.title}
                        </h4>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-bold rounded-md uppercase shrink-0">
                          {int.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(int.scheduledAt).toLocaleDateString()} • {new Date(int.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TPO Announcements */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" /> TPO Announcements
              </h3>
              <button
                onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-gray-50 pt-2">
              {announcements.length === 0 ? (
                <div className="space-y-3 pt-1">
                  {/* Mock announcements to match mockup if API is empty */}
                  <div className="py-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">
                      New Placement Drive by Deloitte. Register before 26 Aug.
                    </h4>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 18 Aug 2026
                    </p>
                  </div>
                  <div className="py-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">
                      Aptitude Test Schedule for this week.
                    </h4>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 17 Aug 2026
                    </p>
                  </div>
                  <div className="py-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">
                      Resume Workshop on 24th Aug. All are invited!
                    </h4>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 16 Aug 2026
                    </p>
                  </div>
                </div>
              ) : (
                announcements.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 first:pt-0 last:pb-0 space-y-1"
                  >
                    <h4
                      className="text-xs font-bold text-gray-800 leading-tight hover:text-blue-600 cursor-pointer"
                      onClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1">
                      {item.content}
                    </p>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
