import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "@/store/slices/authSlice";
import { clearProfile } from "@/store/slices/studentProfileSlice";
import {
  FaGraduationCap,
  FaThLarge,
  FaBriefcase,
  FaTasks,
  FaUser,
  FaSignOutAlt,
  FaFolderOpen,
  FaClipboardList,
} from "react-icons/fa";
import { ROUTES } from "@/Routes/studentRout/routes";

const navItems = [
  { name: "Dashboard", icon: <FaThLarge />, to: ROUTES.DASHBOARD },
  { name: "All Jobs", icon: <FaBriefcase />, to: ROUTES.ALL_JOBS },
  { name: "My Jobs", icon: <FaFolderOpen />, to: ROUTES.MY_JOBS },
  { name: "Assessments", icon: <FaClipboardList />, to: ROUTES.ASSESSMENTS },
  { name: "Announcements", icon: <FaTasks />, to: ROUTES.ANNOUNCEMENTS },
  { name: "Profile", icon: <FaUser />, to: ROUTES.PROFILE },
];

const linkBase =
  "flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm";

export default function StudentNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { user } = useSelector((state) => state.auth);

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      // ignore network errors; proceed to clear client state
    } finally {
      // Clear both auth and profile state
      dispatch(logout());
      dispatch(clearProfile());
      navigate(ROUTES.LOGIN);
    }
  }

  return (
    <nav className="flex justify-between items-center w-full p-4 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <div className="text-blue-600 text-3xl mr-3">
          <FaGraduationCap />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">
            AI Placement Portal
          </h1>
          <p className="text-xs text-gray-500">Student Portal</p>
        </div>
      </div>

      <ul className="flex space-x-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="mr-2 text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors"
          aria-label="Logout"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
}
