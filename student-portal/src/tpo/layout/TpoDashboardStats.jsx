import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Building, TrendingUp } from "lucide-react";
import axios from "axios";

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
  <Card className="shadow-sm">
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </CardContent>
  </Card>
);

function TPODashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [placementsThisYear, setPlacementsThisYear] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [studentsRes, jobsRes] = await Promise.all([
          axios.get("http://localhost:4000/api/students", {
            withCredentials: true,
          }),
          axios.get("http://localhost:4000/api/jobs", {
            withCredentials: true,
          }),
        ]);
        const profiles = studentsRes.data?.profiles || [];
        const jobs = jobsRes.data || [];
        setTotalStudents(profiles.length);
        setActiveJobs(jobs.filter((j) => j.status === "active").length);
        setCompletedJobs(jobs.filter((j) => j.status === "completed").length);
        setPlacementsThisYear(
          jobs.filter((j) => j.status === "completed").length
        );
      } catch (e) {
        setError(
          e.response?.data?.message || "Failed to load dashboard stats."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">TPO Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage placements, students, and company partnerships from your
          central hub.
        </p>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Loading stats...</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Active Jobs"
            value={activeJobs}
            icon={Briefcase}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Completed Jobs"
            value={completedJobs}
            icon={Briefcase}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            title="Placements This Year"
            value={placementsThisYear}
            icon={TrendingUp}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
        </div>
      )}
    </div>
  );
}

export default TPODashboardStats;
