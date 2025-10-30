import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye } from "lucide-react";

const students = [
  {
    name: "Rahul Sharma",
    branch: "Computer Science",
    cgpa: 8.7,
    assessments: 5,
    registered: "1 days ago",
  },
  {
    name: "Priya Patel",
    branch: "Electronics & Communication",
    cgpa: 9.1,
    assessments: 3,
    registered: "2 days ago",
  },
  {
    name: "Amit Kumar",
    branch: "Mechanical Engineering",
    cgpa: 8.2,
    assessments: 4,
    registered: "3 days ago",
  },
];

const StudentCard = ({ student }) => (
  <div className="border rounded-lg p-4 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">{student.name}</h3>
      <p className="text-sm text-muted-foreground">{student.branch}</p>
      <div className="flex flex-wrap items-center gap-x-4 text-xs text-muted-foreground mt-2">
        <span>CGPA: {student.cgpa}</span>
        <span>{student.assessments} assessments</span>
        <span>{student.registered}</span>
      </div>
    </div>
    <Button variant="ghost" size="icon">
      <Eye className="h-4 w-4" />
    </Button>
  </div>
);

function RecentlyRegisteredStudents() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recently Registered Students</CardTitle>
          <CardDescription>New student registrations</CardDescription>
        </div>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.map((student) => (
          <StudentCard key={student.name} student={student} />
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentlyRegisteredStudents;
