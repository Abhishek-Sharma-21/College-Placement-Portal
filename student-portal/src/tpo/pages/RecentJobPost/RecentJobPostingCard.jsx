import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, FilePenLine, Banknote, Users, Clock } from "lucide-react";

const jobs = [
  {
    title: "Software Engineer",
    company: "TechCorp Inc.",
    salary: "₹12-18 LPA",
    applicants: 45,
    posted: "2 days ago",
    status: "Active",
  },
  {
    title: "Data Analyst",
    company: "DataSys Solutions",
    salary: "₹8-12 LPA",
    applicants: 32,
    posted: "5 days ago",
    status: "Active",
  },
  {
    title: "Frontend Developer",
    company: "WebTech Labs",
    salary: "₹10-15 LPA",
    applicants: 67,
    posted: "14 days ago",
    status: "Closed",
  },
];

const RecentJobPostingCard = ({ job }) => (
  <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex-grow">
      <h3 className="text-lg font-semibold">{job.title}</h3>
      <p className="text-sm text-muted-foreground">{job.company}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <Banknote className="h-3 w-3" />
          {job.salary}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {job.applicants} applicants
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {job.posted}
        </span>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
      <Badge variant={job.status === "Active" ? "default" : "secondary"}>
        {job.status}
      </Badge>
      <Button variant="ghost" size="icon">
        <FilePenLine className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

function RecentJobPostings() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Job Postings</CardTitle>
          <CardDescription>
            Latest opportunities from partner companies
          </CardDescription>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <RecentJobPostingCard key={job.title} job={job} />
        ))}
      </CardContent>
    </Card>
  );
}

export default RecentJobPostings;
