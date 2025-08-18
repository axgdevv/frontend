"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  CheckCircle,
  MapPin,
  AlertTriangle,
  Calendar,
  Activity,
  TrendingUp,
  Loader2Icon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDashboardData } from "@/api/dashboard/index";

import { DashboardStats } from "@/types/dashboard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { globalCache } from "@/lib/cache";

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardDataHandler(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = globalCache.subscribe(`user:${user.uid}`, () => {
      // Refetch dashboard data when user cache is invalidated
      fetchDashboardDataHandler(user.uid);
    });

    return unsubscribe;
  }, [user?.uid]);

  const fetchDashboardDataHandler = async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    // Check cache first
    const cached = globalCache.getDashboard(userId);
    if (cached) {
      setDashboardStats(cached);
      setLoading(false);
      return;
    }

    try {
      const response = await fetchDashboardData(userId);
      setDashboardStats(response);

      // Cache the response
      globalCache.setDashboard(userId, response);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (axios.isAxiosError(err)) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "An unknown error occurred";
        setError(errorMessage);
      } else {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardStats) {
    return (
      <div className="h-screen w-full flex items-center justify-center flex-col space-y-4">
        <Loader2Icon className="animate-spin h-8 w-8" />
        <p className="text-black font-medium">
          Fetching your dashboard, please wait...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-h-full h-full w-full bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => fetchDashboardDataHandler(user?.uid || "")}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const CATEGORY_COLORS: string[] = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];

  // Custom tooltip formatter for location chart
  const locationTooltipFormatter = (city: string): string => {
    const location = dashboardStats.projects_by_location.find(
      (l) => l.city === city
    );
    return location ? location.location : city;
  };

  return (
    <div className="max-h-full h-full w-full overflow-y-auto bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Projects This Month"
            value={dashboardStats.total_projects_this_month}
            icon={<Calendar className="w-5 h-5" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            description="New projects created"
          />
          <StatsCard
            title="Active Projects"
            value={dashboardStats.active_projects_this_month}
            icon={<Activity className="w-5 h-5" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            description="Currently in progress"
          />
          <StatsCard
            title="Completed Projects"
            value={dashboardStats.completed_projects}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            description="All time total"
          />
          <StatsCard
            title="Locations"
            value={dashboardStats.projects_by_location.length}
            icon={<MapPin className="w-5 h-5" />}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            description="Cities with projects"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Projects by Location */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Projects by Location
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    Distribution across cities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardStats.projects_by_location.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={dashboardStats.projects_by_location}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    maxBarSize={25}
                  >
                    <defs>
                      <linearGradient
                        id="locationHistogramGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#F59E0B"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#F59E0B"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      strokeOpacity={0.6}
                    />
                    <XAxis
                      dataKey="city"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fill: "#374151", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                      tickLine={{ stroke: "#d1d5db" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      labelFormatter={locationTooltipFormatter}
                      formatter={(value: number) => [value, "Projects"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#locationHistogramGradient)"
                      radius={[2, 2, 0, 0]}
                      stroke="#F59E0B"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                      No location data available
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Monthly Completed Projects Chart */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Monthly Completions
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    Projects completed this year
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardStats.monthly_completed_projects &&
              dashboardStats.monthly_completed_projects.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={dashboardStats.monthly_completed_projects}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="completedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8B5CF6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#8B5CF6"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      strokeOpacity={0.6}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
                      axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fill: "#374151", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Completed"]}
                      labelFormatter={(label) => `${label} 2025`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "13px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      fill="url(#completedGradient)"
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                      activeDot={{
                        r: 6,
                        fill: "#8B5CF6",
                        strokeWidth: 2,
                        stroke: "white",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                      No completion data available
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Issue Categories Table */}
        {dashboardStats.top_issue_categories.length > 0 && (
          <Card className="mt-6 border border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Issue Categories Breakdown
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mt-1">
                    Detailed analysis of categories and priorities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Issues
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        High Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {dashboardStats.top_issue_categories.map(
                      (category, index) => (
                        <tr
                          key={category.category}
                          className="hover:bg-gray-25 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[
                                      index % CATEGORY_COLORS.length
                                    ],
                                }}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {category.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">
                              {category.count}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium bg-red-50 text-red-700 border-red-200"
                            >
                              {category.high_priority_count}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-900 min-w-[40px]">
                                {category.percentage}%
                              </span>
                              <div className="flex-1 max-w-[80px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${category.percentage}%`,
                                    backgroundColor:
                                      CATEGORY_COLORS[
                                        index % CATEGORY_COLORS.length
                                      ],
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
