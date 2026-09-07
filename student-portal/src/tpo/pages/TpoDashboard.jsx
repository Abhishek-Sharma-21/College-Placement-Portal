import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "@/lib/api";
import { TPO_ROUTES } from "@/Routes/tpoRout/TpoRoutes";
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  Calendar,
  Building2,
  ChevronRight,
  MoreVertical,
  Bell,
  Clock,
} from "lucide-react";

export default function TpoDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Set current time dynamically
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
          ", " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, jobsRes, annRes] = await Promise.all([
          axios.get(`${API_URL}/students`, { withCredentials: true }),
          axios.get(`${API_URL}/jobs`, { withCredentials: true }),
          axios.get(`${API_URL}/announcements`, { withCredentials: true }),
        ]);

        setStudents(studentsRes.data.profiles || []);
        setJobs(jobsRes.data || []);
        setAnnouncements(annRes.data.announcements || []);
      } catch (error) {
        console.error("Error loading TPO dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to get company branding
  const getCompanyBrand = (company) => {
    const name = company.toLowerCase();
    if (name.includes("tcs") || name.includes("tata")) {
      return { initials: "TCS", color: "bg-red-50 text-red-600 border-red-100" };
    }
    if (name.includes("infosys")) {
      return { initials: "INF", color: "bg-blue-50 text-blue-600 border-blue-100" };
    }
    if (name.includes("wipro")) {
      return { initials: "WIP", color: "bg-purple-50 text-purple-600 border-purple-100" };
    }
    if (name.includes("accenture")) {
      return { initials: "AC", color: "bg-purple-950 text-purple-300 border-purple-900" };
    }
    return {
      initials: company.substring(0, 3).toUpperCase(),
      color: "bg-slate-50 text-slate-600 border-slate-100",
    };
  };

  const activeJobs = jobs.filter((job) => job.status === "active");
  const completedJobsCount = jobs.filter((job) => job.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">TPO Dashboard</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Manage placements, students, and company partnerships from your central hub.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-xs text-gray-500 font-semibold self-start md:self-auto">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* 2. Stats row with SVG Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{students.length > 0 ? students.length : "248"}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ 12% vs last year
            </span>
            {/* Sparkline Line Chart SVG */}
            <svg className="w-16 h-8 text-emerald-500 stroke-current fill-none" viewBox="0 0 100 30" strokeWidth="2.5">
              <path d="M 0,25 Q 15,10 30,22 T 60,12 T 90,8 T 100,5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Active Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900">{activeJobs.length > 0 ? activeJobs.length : "32"}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ {activeJobs.length > 0 ? "+8" : "8"} new this week
            </span>
            <svg className="w-16 h-8 text-emerald-500 stroke-current fill-none" viewBox="0 0 100 30" strokeWidth="2.5">
              <path d="M 0,22 Q 20,5 40,25 T 80,10 T 100,2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Completed Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Completed Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900">{completedJobsCount > 0 ? completedJobsCount : "18"}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-purple-600 font-bold flex items-center bg-purple-50 px-2 py-0.5 rounded-lg">
              ↑ 5 this month
            </span>
            <svg className="w-16 h-8 text-purple-500 stroke-current fill-none" viewBox="0 0 100 30" strokeWidth="2.5">
              <path d="M 0,25 L 20,20 L 40,15 L 60,25 L 80,10 L 100,8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Placements This Year */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Placements This Year</p>
              <h3 className="text-2xl font-bold text-gray-900">64</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-lg">
              ↑ 18% vs last year
            </span>
            <svg className="w-16 h-8 text-amber-500 stroke-current fill-none" viewBox="0 0 100 30" strokeWidth="2.5">
              <path d="M 0,25 Q 15,20 30,12 T 60,8 T 90,4 T 100,1" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Double Column Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Jobs & Placements Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Job Postings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Active Job Postings</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Latest opportunities from partner companies
                </p>
              </div>
              <button
                onClick={() => navigate("/tpo/jobs/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center shadow-md shadow-blue-100 transition-all"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Job
              </button>
            </div>

            {/* Jobs list table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Job Title</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Posted On</th>
                    <th className="pb-3 text-center">Applications</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-gray-400">
                        No jobs posted yet. Click "Add Job" to create one.
                      </td>
                    </tr>
                  ) : (
                    jobs.slice(0, 4).map((job) => {
                      const brand = getCompanyBrand(job.company);
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3 font-extrabold text-gray-900">{job.title}</td>
                          <td className="py-3 flex items-center space-x-2">
                            <span
                              className={`w-6 h-6 border rounded-md flex items-center justify-center text-[9px] font-bold ${brand.color}`}
                            >
                              {brand.initials}
                            </span>
                            <span className="font-semibold text-gray-800">{job.company}</span>
                          </td>
                          <td className="py-3 text-gray-500 font-medium">{job.location}</td>
                          <td className="py-3 text-gray-500 font-medium">{formatDate(job.createdAt)}</td>
                          <td className="py-3 text-center font-bold text-gray-900">
                            {job.applications ? job.applications.length : "12"}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${
                                job.status === "active"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => navigate(`/tpo/jobs/edit/${job.id}`)}
                              className="text-gray-400 hover:text-gray-900 p-1"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => navigate(TPO_ROUTES.MANAGE_JOBS)}
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center"
              >
                View All Jobs <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Placement Overview Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Placement Overview</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Monthly recruitment metric analytics
              </p>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="relative pt-4 flex flex-col items-center">
              {/* Legends */}
              <div className="flex items-center space-x-6 text-[10px] font-bold text-gray-500 mb-6">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm mr-2"></span>
                  <span>Offers Made</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm mr-2"></span>
                  <span>Students Placed</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-sm mr-2"></span>
                  <span>In Process</span>
                </div>
              </div>

              {/* Bar charts container SVG */}
              <svg className="w-full max-w-xl h-52 text-gray-400" viewBox="0 0 500 200">
                {/* Horizontal grid lines */}
                <line x1="40" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="160" x2="480" y2="160" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Y-axis Labels */}
                <text x="15" y="44" className="text-[10px] font-bold fill-current">80</text>
                <text x="15" y="84" className="text-[10px] font-bold fill-current">60</text>
                <text x="15" y="124" className="text-[10px] font-bold fill-current">40</text>
                <text x="15" y="164" className="text-[10px] font-bold fill-current">20</text>

                {/* Month 1: Jan */}
                <g>
                  {/* Offers Made */}
                  <rect x="70" y="120" width="10" height="50" rx="1.5" className="fill-blue-600" />
                  {/* Students Placed */}
                  <rect x="83" y="130" width="10" height="40" rx="1.5" className="fill-emerald-500" />
                  {/* In Process */}
                  <rect x="96" y="145" width="10" height="25" rx="1.5" className="fill-purple-400" />
                  <text x="81" y="185" className="text-[10px] font-bold fill-slate-500">Jan</text>
                </g>

                {/* Month 2: Feb */}
                <g>
                  <rect x="150" y="110" width="10" height="60" rx="1.5" className="fill-blue-600" />
                  <rect x="163" y="125" width="10" height="45" rx="1.5" className="fill-emerald-500" />
                  <rect x="176" y="135" width="10" height="35" rx="1.5" className="fill-purple-400" />
                  <text x="161" y="185" className="text-[10px] font-bold fill-slate-500">Feb</text>
                </g>

                {/* Month 3: Mar */}
                <g>
                  <rect x="230" y="90" width="10" height="80" rx="1.5" className="fill-blue-600" />
                  <rect x="243" y="105" width="10" height="65" rx="1.5" className="fill-emerald-500" />
                  <rect x="256" y="140" width="10" height="30" rx="1.5" className="fill-purple-400" />
                  <text x="241" y="185" className="text-[10px] font-bold fill-slate-500">Mar</text>
                </g>

                {/* Month 4: Apr */}
                <g>
                  <rect x="310" y="60" width="10" height="110" rx="1.5" className="fill-blue-600" />
                  <rect x="323" y="80" width="10" height="90" rx="1.5" className="fill-emerald-500" />
                  <rect x="336" y="125" width="10" height="45" rx="1.5" className="fill-purple-400" />
                  <text x="321" y="185" className="text-[10px] font-bold fill-slate-500">Apr</text>
                </g>

                {/* Month 5: May */}
                <g>
                  <rect x="390" y="45" width="10" height="125" rx="1.5" className="fill-blue-600" />
                  <rect x="403" y="66" width="10" height="104" rx="1.5" className="fill-emerald-500" />
                  <rect x="416" y="115" width="10" height="55" rx="1.5" className="fill-purple-400" />
                  <text x="401" y="185" className="text-[10px] font-bold fill-slate-500">May</text>
                </g>
              </svg>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => alert("Report generation module is simulated for this portal.")}
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center"
              >
                View Full Report <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Recently Registered Students & Announcements */}
        <div className="space-y-6">
          {/* Recently Registered Students */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recently Registered</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">New student registrations</p>
              </div>
              <button
                onClick={() => navigate(TPO_ROUTES.MANAGE_STUDENTS)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Students list */}
            <div className="divide-y divide-gray-50 pt-2 space-y-3">
              {students.length === 0 ? (
                <div className="space-y-3 pt-1">
                  {/* Mock student items if API is empty */}
                  {[
                    { name: "Rohan Kumar", dept: "B.Tech CSE", year: "4th Year", time: "18 May 2026", color: "bg-blue-100 text-blue-600" },
                    { name: "Anjali Singh", dept: "B.Tech IT", year: "3rd Year", time: "18 May 2026", color: "bg-emerald-100 text-emerald-600" },
                    { name: "Dev Patel", dept: "B.Tech ECE", year: "4th Year", time: "18 May 2026", color: "bg-purple-100 text-purple-600" },
                    { name: "Neha Kumari", dept: "B.Tech CSE", year: "3rd Year", time: "17 May 2026", color: "bg-indigo-100 text-indigo-600" },
                    { name: "Mohit Sharma", dept: "B.Tech ME", year: "4th Year", time: "17 May 2026", color: "bg-amber-100 text-amber-600" },
                  ].map((std, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-3 first:pt-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${std.color}`}>
                          {std.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900">{std.name}</h4>
                          <p className="text-[9px] text-gray-400 font-bold">
                            {std.dept} • {std.year}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 font-semibold">{std.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                students.slice(0, 5).map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between pt-3 first:pt-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs uppercase text-blue-600 overflow-hidden">
                        {profile.profilePicUrl ? (
                          <img src={profile.profilePicUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          profile.user?.fullName ? profile.user.fullName.split(" ").map((n) => n[0]).join("") : "ST"
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">{profile.user?.fullName || "Student"}</h4>
                        <p className="text-[9px] text-gray-400 font-bold">
                          {profile.branch} • {profile.gradYear ? `${profile.gradYear} Grad` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 font-semibold">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest Announcements */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Latest Announcements</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Broadcasts for placement updates</p>
              </div>
              <button
                onClick={() => navigate(TPO_ROUTES.ANNOUNCEMENTS)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
              >
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-50 pt-2">
              {announcements.length === 0 ? (
                <div className="space-y-3.5 pt-1">
                  {/* Mock items */}
                  <div className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-800 leading-tight">TCS Hiring Drive</h4>
                      <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[8px] font-bold rounded-md">New</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">TCS is conducting an off-campus drive for 2026 batch.</p>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 18 May 2026
                    </p>
                  </div>
                  <div className="py-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">Aptitude Test Schedule</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Aptitude test for all registered students on 22nd May.</p>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 17 May 2026
                    </p>
                  </div>
                  <div className="py-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">Resume Building Workshop</h4>
                    <p className="text-[10px] text-gray-400 font-medium">Workshop on resume building on 24th May 2026 at 11:00 AM.</p>
                    <p className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 16 May 2026
                    </p>
                  </div>
                </div>
              ) : (
                announcements.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 leading-tight hover:text-blue-600 cursor-pointer" onClick={() => navigate(TPO_ROUTES.ANNOUNCEMENTS)}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{item.content}</p>
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
