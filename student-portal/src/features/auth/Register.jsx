import React, { useState } from "react";
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
import { TPO_ROUTES } from "@/Routes/tpoRout/TpoRoutes";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";
import { useRegisterMutation } from "@/store/api/authApiSlice";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const [activeTab, setActiveTab] = useState("student");
  const [error, setError] = useState(null);

  // === Student Form State ===
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // === TPO Form State ===
  const [tpoName, setTpoName] = useState("");
  const [tpoEmail, setTpoEmail] = useState("");
  const [tpoPassword, setTpoPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let data;

    if (activeTab === "student") {
      if (!studentName || !studentEmail || !studentPassword) {
        setError("Please fill out all required student fields.");
        return;
      }
      data = {
        fullName: studentName,
        email: studentEmail,
        password: studentPassword,
        role: "student",
      };
    } else {
      if (!tpoName || !tpoEmail || !tpoPassword) {
        setError("Please fill out all required TPO fields.");
        return;
      }
      data = {
        fullName: tpoName,
        email: tpoEmail,
        password: tpoPassword,
        role: "tpo",
      };
    }

    try {
      const response = await registerUser(data).unwrap();

      // Dispatch successful login to store
      dispatch(
        loginSuccess({
          user: {
            _id: response.id,
            id: response.id,
            fullName: response.fullName,
            email: response.email,
            role: response.role,
          },
          token: "cookie",
        })
      );

      // Redirect directly to dashboard by role
      if (response.role === "tpo") {
        navigate(TPO_ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (apiError) {
      // Map validation errors if returned by Zod
      if (apiError.data?.errors && Array.isArray(apiError.data.errors)) {
        const errorDetails = apiError.data.errors.map(err => err.message).join(" ");
        setError(errorDetails);
      } else {
        setError(apiError.data?.message || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">AI-Powered Placement Portal</h1>
          <p className="text-sm text-muted-foreground">
            Create an account to get started
          </p>
        </div>
        <Tabs
          defaultValue="student"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="tpo">TPO</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Student Registration</CardTitle>
                  <CardDescription>Create your student account</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input
                      id="student-name"
                      type="text"
                      placeholder="John Doe"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="student-email-reg">Email</Label>
                    <Input
                      id="student-email-reg"
                      type="email"
                      placeholder="your.email@example.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="student-password-reg">Password</Label>
                    <Input
                      id="student-password-reg"
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
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
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to={ROUTES.LOGIN} className="underline">
                      Sign In
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="tpo">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>TPO Registration</CardTitle>
                  <CardDescription>
                    Fill out the form to create a Placement Officer account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="tpo-name">Full Name</Label>
                    <Input
                      id="tpo-name"
                      type="text"
                      placeholder="Jane Smith"
                      value={tpoName}
                      onChange={(e) => setTpoName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tpo-email-reg">Email</Label>
                    <Input
                      id="tpo-email-reg"
                      type="email"
                      placeholder="tpo.email@example.com"
                      value={tpoEmail}
                      onChange={(e) => setTpoEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="tpo-password-reg">Password</Label>
                    <Input
                      id="tpo-password-reg"
                      type="password"
                      value={tpoPassword}
                      onChange={(e) => setTpoPassword(e.target.value)}
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
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to={ROUTES.LOGIN} className="underline">
                      Sign In
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

export default Register;
