import React, { useState } from "react";
import { useDispatch } from "react-redux";
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
import { ROUTES } from "@/Routes/studentRout/routes.jsx";
import TPO_ROUTES from "../../Routes/tpoRout/TpoRoutes";
import axios from "axios";
import API_URL from "@/lib/api";
import { loginSuccess } from "@/store/slices/authSlice";
import { useLoginMutation } from "@/store/api/authApiSlice";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
} from "@/store/slices/studentProfileSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { isLoading }] = useLoginMutation();

  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [tpoEmail, setTpoEmail] = useState("");
  const [tpoPassword, setTpoPassword] = useState("");

  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    dispatch(fetchProfileStart());
    try {
      const response = await axios.get(`${API_URL}/profile/profile`, {
        withCredentials: true,
      });
      dispatch(fetchProfileSuccess(response.data.profile));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch profile";
      dispatch(fetchProfileFailure(message));
    }
  };

  const handleLogin = async (e, role) => {
    e.preventDefault();
    setError(null);

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
      const response = await loginUser(data).unwrap();

      // Update Redux auth state
      dispatch(
        loginSuccess({
          user: response,
          token: "cookie",
        })
      );

      // Fetch student profile fresh
      if (response.role === "student") {
        await fetchProfile();
      }

      if (response.role === "tpo") {
        navigate(TPO_ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD || "/");
      }
    } catch (apiError) {
      // Map validation errors if returned by Zod
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        const errorDetails = apiError.data.errors.map(err => err.message).join(" ");
        setError(errorDetails);
      } else {
        setError(apiError.data?.message || "Login failed. Please check your credentials.");
      }
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
                        setError(null);
                        setStudentEmail(e.target.value);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentPassword}
                      onChange={(e) => {
                        setError(null);
                        setStudentPassword(e.target.value);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                  )}
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Login"}
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
                        setError(null);
                        setTpoEmail(e.target.value);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tpo-password">Password</Label>
                    <Input
                      id="tpo-password"
                      type="password"
                      value={tpoPassword}
                      onChange={(e) => {
                        setError(null);
                        setTpoPassword(e.target.value);
                      }}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                  )}
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Login"}
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
