import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TPO_ROUTES } from "@/Routes/tpoRout/TpoRoutes";

const StudentCard = ({ student }) => (
  <div className="border rounded-lg p-4 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">{student.user?.fullName}</h3>
      <p className="text-sm text-muted-foreground">{student.user?.email}</p>
      <div className="flex flex-wrap items-center gap-x-4 text-xs text-muted-foreground mt-2">
        <span>Branch: {student.branch || "-"}</span>
        <span>CGPA: {student.cgpa ?? "-"}</span>
        <span>Year: {student.gradYear ?? "-"}</span>
      </div>
    </div>
    <Button variant="ghost" size="icon">
      <Eye className="h-4 w-4" />
    </Button>
  </div>
);

function RecentlyRegisteredStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:4000/api/students", {
          withCredentials: true,
        });
        setStudents(res.data.profiles || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to fetch students.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recently Registered Students</CardTitle>
          <CardDescription>New student registrations</CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(TPO_ROUTES.MANAGE_STUDENTS)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && students.length === 0 && (
          <div>No students found.</div>
        )}
        {students.map((student) => (
          <StudentCard key={student._id} student={student} />
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentlyRegisteredStudents;
