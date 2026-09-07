import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import API_URL from "@/lib/api";
import { logout } from "@/store/slices/authSlice";
import { clearProfile } from "@/store/slices/studentProfileSlice";
import { ROUTES } from "@/Routes/studentRout/routes.jsx";
import { Outlet } from "react-router-dom";
import { initiateSocketConnection, disconnectSocket } from "@/lib/socket";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  Calendar,
  Award,
  BookOpen,
  FileSpreadsheet,
  User,
  Settings,
  Bell,
  Headphones,
  LogOut,
  ChevronRight,
  Menu,
} from "lucide-react";

export default function AppLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.studentProfile);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Initialize socket and listen for real-time notifications
  useEffect(() => {
    if (!user) return;
    const socket = initiateSocketConnection(user.id || user._id);

    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);

      // Pop an instant user-facing browser alert
      let message = "";
      if (notif.type === "job_posted") {
        message = `📢 New Job Drive: ${notif.data.title} at ${notif.data.company}!`;
      } else if (notif.type === "status_updated") {
        message = `🔔 Application Alert: Your status for ${notif.data.title} at ${notif.data.company} has been updated to "${notif.data.status.toUpperCase()}".`;
      } else if (notif.type === "assessment_linked") {
        message = `📝 Pending Test: A required test "${notif.data.title}" has been assigned for your job drive.`;
      }

      if (message) {
        alert(message);
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [user]);

  async function handleLogout() {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {
      // ignore network errors; proceed to clear client state
    } finally {
      dispatch(logout());
      dispatch(clearProfile());
      navigate(ROUTES.LOGIN);
    }
  }

  const sidebarItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, to: ROUTES.DASHBOARD },
    { name: "All Jobs", icon: <Briefcase className="w-5 h-5" />, to: ROUTES.ALL_JOBS },
    { name: "My Applications", icon: <FileText className="w-5 h-5" />, to: ROUTES.MY_JOBS },
    { name: "Assessments", icon: <ClipboardList className="w-5 h-5" />, to: ROUTES.ASSESSMENTS },
    { name: "Interviews", icon: <Calendar className="w-5 h-5" />, to: ROUTES.INTERVIEWS },
    { name: "Offer Letters", icon: <Award className="w-5 h-5" />, to: "#", mock: true },
    { name: "Resources", icon: <BookOpen className="w-5 h-5" />, to: "#", mock: true },
    { name: "Resume Builder", icon: <FileSpreadsheet className="w-5 h-5" />, to: "#", mock: true },
    { name: "Profile", icon: <User className="w-5 h-5" />, to: ROUTES.PROFILE },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, to: "#", mock: true },
  ];

  const topNavItems = [
    { name: "Dashboard", to: ROUTES.DASHBOARD },
    { name: "All Jobs", to: ROUTES.ALL_JOBS },
    { name: "My Jobs", to: ROUTES.MY_JOBS },
    { name: "Assessments", to: ROUTES.ASSESSMENTS },
    { name: "Announcements", to: ROUTES.ANNOUNCEMENTS },
    { name: "Profile", to: ROUTES.PROFILE },
  ];

  const handleMockClick = (name) => {
    alert(`The ${name} feature is simulated for this placement portal demonstration.`);
  };

  const branchName = profile?.branch || "Computer Science";
  const gradYear = profile?.gradYear || "2026";

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col justify-between h-screen sticky top-0 z-40`}>
        <div>
          {/* Logo Brand */}
          <div className="flex items-center px-6 py-5 border-b border-gray-50">
            <div className="bg-blue-600 p-2 rounded-lg text-white mr-3">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight text-sm">College Placement</h1>
              <p className="text-xs text-gray-400 font-medium">Student Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            {sidebarItems.map((item) => {
              if (item.mock) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleMockClick(item.name)}
                    className="w-full flex items-center px-4 py-2.5 rounded-xl font-medium text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all text-left"
                  >
                    <span className="mr-3 text-gray-400">{item.icon}</span>
                    {item.name}
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  <span className="mr-3 text-gray-400 group-[.active]:text-blue-600 group-hover:text-gray-600 transition-colors">
                    {item.icon}
                  </span>
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Need Help Box */}
        <div className="p-4 border-t border-gray-50">
          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-50 text-center relative overflow-hidden">
            <div className="bg-blue-600 text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center mx-auto mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-xs">Need Help?</h4>
            <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] mx-auto leading-relaxed">Contact your Training & Placement Officer</p>
            <button 
              onClick={() => navigate(ROUTES.ANNOUNCEMENTS)} 
              className="mt-3 w-full bg-white hover:bg-gray-50 text-blue-600 text-xs font-bold py-2 px-4 rounded-xl border border-gray-100 flex items-center justify-center transition-all"
            >
              Contact TPO <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header Navbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 transition-all md:block"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Top Menu navigation bar */}
            <div className="hidden lg:flex items-center space-x-1">
              {topNavItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 relative hover:text-gray-900 transition-all"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl w-80 z-50 overflow-hidden py-1">
                  <div className="px-4 py-2.5 border-b border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])} 
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 font-medium">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div key={idx} className="p-3 border-b border-slate-50 text-xs hover:bg-slate-50 transition-colors last:border-b-0">
                          <p className="font-bold text-gray-900 leading-snug">
                            {n.type === "job_posted" && "📢 New Job Post"}
                            {n.type === "status_updated" && "🔔 Status Update"}
                            {n.type === "assessment_linked" && "📝 Test Assigned"}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                            {n.type === "job_posted" && `${n.data.title} at ${n.data.company}`}
                            {n.type === "status_updated" && `Application for ${n.data.title} is now ${n.data.status.toUpperCase()}`}
                            {n.type === "assessment_linked" && `Required test "${n.data.title}" is pending.`}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown / Pill */}
            <div className="flex items-center pl-3 border-l border-gray-100 space-x-3">
              <div className="hidden md:block text-right">
                <h3 className="text-xs font-bold text-gray-900">{user?.fullName || "Govind Naag"}</h3>
                <p className="text-[10px] text-gray-400 font-medium">{branchName.split(" ")[0]} • {gradYear}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
                {profile?.profilePicUrl ? (
                  <img src={profile.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase() : "GN"
                )}
              </div>
              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Root Wrapper */}
        <main className="p-6 flex-1 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {/* Render direct child routes */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
