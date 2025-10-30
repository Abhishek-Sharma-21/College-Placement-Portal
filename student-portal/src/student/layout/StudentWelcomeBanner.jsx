import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { ROUTES } from "@/Routes/studentRout/routes";
import axios from "axios";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} from "@/store/slices/studentProfileSlice";

const StudentWelcomeBanner = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, isProfileComplete } = useSelector(
    (state) => state.studentProfile
  );

  useEffect(() => {
    // Only fetch if we don't have profile data
    if (!profile && user) {
      const fetchProfile = async () => {
        dispatch(fetchProfileStart());
        try {
          const response = await axios.get(
            "http://localhost:4000/api/profile/profile",
            {
              withCredentials: true,
            }
          );
          dispatch(fetchProfileSuccess(response.data.profile));
        } catch (err) {
          if (err.response?.status !== 404) {
            dispatch(fetchProfileFailure(err.response?.data?.message));
          } else {
            // Profile doesn't exist yet - that's okay
            dispatch(fetchProfileSuccess(null));
          }
        }
      };
      fetchProfile();
    }
  }, [dispatch, profile, user]);

  // Show profile completion prompt if profile is not complete
  if (!isProfileComplete) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 w-full py-6 px-6 flex items-center justify-between rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mr-6">
            <UserCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Welcome, {user?.fullName || "Student"}!
            </h2>
            <p className="text-gray-600 text-base">
              Complete your profile to unlock all features
            </p>
          </div>
        </div>
        <Link to={ROUTES.PROFILE}>
          <Button className="bg-yellow-600 hover:bg-yellow-700">
            Complete Profile
          </Button>
        </Link>
      </div>
    );
  }

  // Show full profile information when complete
  return (
    <div className="bg-blue-50 w-full py-8 px-6 flex items-center rounded-lg shadow-sm">
      {profile?.profilePicUrl ? (
        <img
          src={profile.profilePicUrl}
          alt={`${user?.fullName}'s profile`}
          className="w-16 h-16 rounded-full object-cover mr-6 border-2 border-blue-200"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center mr-6">
          <UserCircle className="w-12 h-12 text-blue-600" />
        </div>
      )}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">
          Welcome back, {user?.fullName || "Student"}!
        </h2>
        <p className="text-gray-600 text-lg">
          {profile?.branch ? `${profile.branch}` : "Student"} •{" "}
          {profile?.cgpa ? `CGPA: ${profile.cgpa}` : "CGPA: N/A"} •{" "}
          {profile?.gradYear ? `Graduate in ${profile.gradYear}` : ""}
        </p>
      </div>
    </div>
  );
};

export default StudentWelcomeBanner;
