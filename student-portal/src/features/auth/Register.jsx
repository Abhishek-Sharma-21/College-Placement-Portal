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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/studentRout/routes";
// You will need axios to make the API call
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  // State for which tab is active
  const [activeTab, setActiveTab] = useState("student");

  // State for error messages
  const [error, setError] = useState(null);

  // === Student Form State ===
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // === TPO Form State ===
  const [tpoName, setTpoName] = useState("");
  const [tpoEmail, setTpoEmail] = useState("");
  const [tpoPassword, setTpoPassword] = useState("");

  // This one function handles both forms
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    let data;
    let url = "http://localhost:4000/api/auth/register"; // Your backend URL

    if (activeTab === "student") {
      // --- Student Data ---
      // Here you would add validation
      if (!studentName || !studentEmail || !studentPassword) {
        setError("Please fill out all required student fields.");
        return;
      }

      data = {
        fullName: studentName,
        email: studentEmail,
        password: studentPassword,
        role: "student",
        // These fields are not in your basic schema,
        // so you might send them to a separate "onboarding" route
        // or add them to your schema

        // studentDetails: {
        //   branch: studentBranch,
        //   cgpa: studentCgpa,
        //   graduationYear: studentGradYear
        // }
      };
    } else {
      // --- TPO Data ---
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

    // --- API Call ---
    try {
      // Send the data to your single register endpoint
      const response = await axios.post(url, data);

      // On success:
      console.log(response.data.message); // "User registered successfully."

      // So, let's just redirect them to the login page.
      navigate(ROUTES.LOGIN);
    } catch (apiError) {
      // If API call fails (e.g., email already exists)
      if (apiError.response && apiError.response.data) {
        setError(apiError.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
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
          onValueChange={setActiveTab} // Update activeTab state on change
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="tpo">TPO</TabsTrigger>
          </TabsList>

          {/* ==========================
            STUDENT FORM
        ==========================
        */}
          <TabsContent value="student">
            <form onSubmit={handleSubmit}>
              {" "}
              {/* Use the onSubmit handler */}
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
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  <Button className="w-full" type="submit">
                    Register
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

          {/* ==========================
              TPO FORM
        ==========================
        */}
          <TabsContent value="tpo">
            <form onSubmit={handleSubmit}>
              {" "}
              {/* Use the SAME handler */}
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
                    />
                  </div>
                  {/* Removed confirm password for TPO */}
                </CardContent>
                <CardFooter className="flex-col">
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  <Button className="w-full" type="submit">
                    Register
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
