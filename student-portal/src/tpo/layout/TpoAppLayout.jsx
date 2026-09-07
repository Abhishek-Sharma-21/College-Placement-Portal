import React, { useState } from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "@/store/slices/authSlice";
import { clearProfile } from "@/store/slices/studentProfileSlice";
import { TPO_ROUTES } from "@/Routes/tpoRout/TpoRoutes";
import API_URL from "@/lib/api";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  Users,
  FileText,
  Calendar,
  Award,
  Building2,
  Bell,
  Settings,
  Headphones,
  LogOut,
  ChevronRight,
  Menu,
  TrendingUp,
} from "lucide-react";

export default function TpoAppLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleLogout() {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      dispatch(clearProfile());
      navigate("/login");
    }
  }

  const sidebarItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, to: TPO_ROUTES.DASHBOARD },
    { name: "Manage Jobs", icon: <Briefcase className="w-5 h-5" />, to: TPO_ROUTES.MANAGE_JOBS },
    { name: "Manage Assessments", icon: <ClipboardList className="w-5 h-5" />, to: TPO_ROUTES.MANAGE_ASSESSMENTS },
    { name: "Question Bank", icon: <ClipboardList className="w-5 h-5" />, to: TPO_ROUTES.QUESTION_BANK },
    { name: "Manage Students", icon: <Users className="w-5 h-5" />, to: TPO_ROUTES.MANAGE_STUDENTS },
    { name: "Applications", icon: <FileText className="w-5 h-5" />, to: "#", mock: true },
    { name: "Interviews", icon: <Calendar className="w-5 h-5" />, to: TPO_ROUTES.MANAGE_INTERVIEWS },
    { name: "Offer Letters", icon: <Award className="w-5 h-5" />, to: "#", mock: true },
    { name: "Companies", icon: <Building2 className="w-5 h-5" />, to: "#", mock: true },
    { name: "Announcements", icon: <Bell className="w-5 h-5" />, to: TPO_ROUTES.ANNOUNCEMENTS },
    { name: "Reports", icon: <TrendingUp className="w-5 h-5" />, to: "#", mock: true },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, to: "#", mock: true },
  ];

  const topNavItems = [
    { name: "Dashboard", to: TPO_ROUTES.DASHBOARD },
    { name: "Manage Jobs", to: TPO_ROUTES.MANAGE_JOBS },
    { name: "Manage Assessments", to: TPO_ROUTES.MANAGE_ASSESSMENTS },
    { name: "Manage Students", to: TPO_ROUTES.MANAGE_STUDENTS },
    { name: "Announcements", to: TPO_ROUTES.ANNOUNCEMENTS },
    { name: "Reports", to: "#", mock: true },
  ];

  const handleMockClick = (name) => {
    alert(`The TPO ${name} feature is simulated for this placement portal demonstration.`);
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-gray-800 font-sans">
      {/* TPO Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white border-r border-gray-100 flex flex-col justify-between h-screen sticky top-0 z-40`}>
        <div>
          {/* Logo Brand */}
          <div className="flex items-center px-6 py-5 border-b border-gray-50">
            <div className="bg-blue-600 p-2 rounded-lg text-white mr-3">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight text-sm">College Placement</h1>
              <p className="text-xs text-gray-400 font-medium">TPO Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-5 space-y-0.5 overflow-y-auto max-h-[70vh]">
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
            <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] mx-auto leading-relaxed">Get quick support or contact support cell</p>
            <button 
              onClick={() => alert("Support ticket system is coming soon.")} 
              className="mt-3 w-full bg-white hover:bg-gray-50 text-blue-600 text-xs font-bold py-2 px-4 rounded-xl border border-gray-100 flex items-center justify-center transition-all"
            >
              Contact Support <ChevronRight className="w-3 h-3 ml-1" />
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
              {topNavItems.map((item) => {
                if (item.mock) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleMockClick(item.name)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
                    >
                      {item.name}
                    </button>
                  );
                }

                return (
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
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 relative hover:text-gray-900 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">5</span>
            </button>

            {/* Profile Dropdown / Pill */}
            <div className="flex items-center pl-3 border-l border-gray-100 space-x-3">
              <div className="hidden md:block text-right">
                <h3 className="text-xs font-bold text-gray-900">{user?.fullName || "TPO Administrator"}</h3>
                <p className="text-[10px] text-gray-400 font-medium">Training & Placement Officer</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
                TP
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
