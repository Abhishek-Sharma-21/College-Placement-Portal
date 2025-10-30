import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  GraduationCap,
  ClipboardList,
  Award,
  Megaphone,
} from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TPO_ROUTES } from "@/Routes/TpoRout/TpoRoutes";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "@/store/slices/authSlice";

function TPONavbar() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      // ignore network errors; proceed to clear client state
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <Link to={TPO_ROUTES.DASHBOARD} className="flex items-center space-x-2">
          <Briefcase className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">AI Placement Portal</h1>
            <p className="text-xs text-muted-foreground -mt-1">TPO Portal</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link
            to={TPO_ROUTES.DASHBOARD}
            className="flex items-center space-x-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            to={TPO_ROUTES.MANAGE_JOBS}
            className="flex items-center space-x-2"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Manage Jobs</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            to={TPO_ROUTES.MANAGE_ASSESSMENTS}
            className="flex items-center space-x-2"
          >
            <Award className="h-4 w-4" />
            <span>Manage Assessments</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            to={TPO_ROUTES.MANAGE_STUDENTS}
            className="flex items-center space-x-2"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Manage Students</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            to={TPO_ROUTES.ANNOUNCEMENTS}
            className="flex items-center space-x-2"
          >
            <Megaphone className="h-4 w-4" />
            <span>Announcements</span>
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2">
            <Link
              to={TPO_ROUTES.PROFILE}
              className="flex items-center space-x-2"
            >
              {/* <Avatar>
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar> */}
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  {user.role}
                </p>
              </div>
            </Link>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
}

export default TPONavbar;
