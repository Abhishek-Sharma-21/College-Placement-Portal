import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  X,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  Linkedin,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TPO_ROUTES } from "@/Routes/tpoRout/TpoRoutes";

const StudentCard = ({ student, onViewDetails }) => (
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
    <Button variant="ghost" size="icon" onClick={() => onViewDetails(student)}>
      <Eye className="h-4 w-4" />
    </Button>
  </div>
);

function RecentlyRegisteredStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
  };

  return (
    <>
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
            <StudentCard
              key={student._id}
              student={student}
              onViewDetails={handleViewDetails}
            />
          ))}
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between sticky top-0 bg-white z-10 border-b">
              <CardTitle className="text-2xl">
                {selectedStudent.user?.fullName || "Student Details"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">
                        {selectedStudent.user?.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="font-medium">
                        {selectedStudent.branch || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">CGPA</p>
                      <p className="font-medium">
                        {selectedStudent.cgpa !== undefined &&
                        selectedStudent.cgpa !== null
                          ? selectedStudent.cgpa.toFixed(2)
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Graduation Year</p>
                      <p className="font-medium">
                        {selectedStudent.gradYear || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(selectedStudent.bio ||
                selectedStudent.resumeLink ||
                selectedStudent.linkedIn) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Additional Information
                  </h3>
                  {selectedStudent.bio && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bio</p>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">
                        {selectedStudent.bio}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStudent.resumeLink && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Resume</p>
                        <a
                          href={selectedStudent.resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Resume
                        </a>
                      </div>
                    )}
                    {selectedStudent.linkedIn && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">LinkedIn</p>
                        <a
                          href={selectedStudent.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                        >
                          <Linkedin className="h-4 w-4" />
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Registration Date */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Registered:{" "}
                  {selectedStudent.createdAt
                    ? new Date(selectedStudent.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default RecentlyRegisteredStudents;
