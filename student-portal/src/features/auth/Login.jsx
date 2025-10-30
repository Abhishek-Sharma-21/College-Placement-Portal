import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/Routes/studentRout/routes";
import TPO_ROUTES from "../../Routes/tpoRout/TpoRoutes";
import axios from "axios";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "@/store/slices/authSlice";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} from "@/store/slices/studentProfileSlice";

// Redux imports are removed

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // --- State for Forms ---
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [tpoEmail, setTpoEmail] = useState("");
  const [tpoPassword, setTpoPassword] = useState("");

  // --- Local UI-only state ---

  // Make sure this port matches your backend server.js
  const API_URL = "http://localhost:4000/api/auth/login";

  // Add this function
  const fetchProfile = async (dispatch) => {
    dispatch(fetchProfileStart());
    try {
      const response = await axios.get(
        "http://localhost:4000/api/profile/profile",
        {
          withCredentials: true,
        }
      );
      dispatch(fetchProfileSuccess(response.data.profile));
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch profile";
      dispatch(fetchProfileFailure(message));
    }
  };

  // --- Generic Submit Handler ---
  const handleLogin = async (e, role) => {
    e.preventDefault();
    dispatch(loginStart());
    if (error) dispatch(clearError());

    let data;
    if (role === "student") {
      data = {
        email: studentEmail,
        password: studentPassword,
        role: "student",
      };
    } else {
      data = { email: tpoEmail, password: tpoPassword, role: "tpo" };
    }

    try {
      // 1. Make the API call
      // 'withCredentials: true' is CRITICAL for httpOnly cookies
      const response = await axios.post(API_URL, data, {
        withCredentials: true,
      });

      const loggedUser = response.data?.user || response.data;
      // 2. On success, update redux auth state
      dispatch(
        loginSuccess({
          user: response.data, // {_id, fullName, email, role}
          token: null, // httpOnly cookie set by backend
        })
      );

      // 3. Fetch the profile right after login!
      if (loggedUser?.role === "student") {
        await fetchProfile(dispatch);
      }

      if (loggedUser?.role === "tpo") {
        navigate(TPO_ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD || "/");
      }
    } catch (apiError) {
      // 4. Handle errors (like "Invalid credentials")
      const message =
        apiError?.response?.data?.message || "Login failed. Please try again.";
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Placement Portal</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="tpo">TPO</TabsTrigger>
          </TabsList>

          {/* ==========================
                STUDENT LOGIN FORM
          ========================== */}
          <TabsContent value="student">
            <form onSubmit={(e) => handleLogin(e, "student")}>
              <Card>
                <CardHeader>
                  <CardTitle>Student Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the student portal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={studentEmail}
                      onChange={(e) => {
                        if (error) dispatch(clearError());
                        setStudentEmail(e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentPassword}
                      onChange={(e) => {
                        if (error) dispatch(clearError());
                        setStudentPassword(e.target.value);
                      }}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? "Signing In..." : "Login"}
                  </Button>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to={ROUTES.REGISTER} className="underline">
                      Register
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* ==========================
                TPO LOGIN FORM
          ========================== */}
          <TabsContent value="tpo">
            <form onSubmit={(e) => handleLogin(e, "tpo")}>
              <Card>
                <CardHeader>
                  <CardTitle>TPO Login</CardTitle>
                  <CardDescription>
                    Access the Placement Officer dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="tpo-email">Email</Label>
                    <Input
                      id="tpo-email"
                      type="email"
                      placeholder="tpo.email@example.com"
                      value={tpoEmail}
                      onChange={(e) => {
                        if (error) dispatch(clearError());
                        setTpoEmail(e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tpo-password">Password</Label>
                    <Input
                      id="tpo-password"
                      type="password"
                      value={tpoPassword}
                      onChange={(e) => {
                        if (error) dispatch(clearError());
                        setTpoPassword(e.target.value);
                      }}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? "Signing In..." : "Login"}
                  </Button>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to={ROUTES.REGISTER} className="underline">
                      Register
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Login;
