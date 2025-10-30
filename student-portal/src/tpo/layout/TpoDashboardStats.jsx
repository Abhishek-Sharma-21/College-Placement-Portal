import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Building, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "1,247",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Jobs",
    value: "28",
    icon: Briefcase,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Companies Onboard",
    value: "45",
    icon: Building,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Placements This Year",
    value: "356",
    icon: TrendingUp,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

const StatCard = ({ item }) => {
  const Icon = item.icon;
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{item.value}</h3>
          <p className="text-sm text-muted-foreground">{item.title}</p>
        </div>
        <div className={`p-3 rounded-lg ${item.bgColor}`}>
          <Icon className={`h-6 w-6 ${item.color}`} />
        </div>
      </CardContent>
    </Card>
  );
};

function TPODashboardStats() {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">TPO Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage placements, students, and company partnerships from your
          central hub.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <StatCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}

export default TPODashboardStats;
