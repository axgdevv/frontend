// Project location stats
export interface ProjectLocation {
  location: string;
  city: string;
  state: string;
  count: number;
}

// Issue category stats
export interface IssueCategory {
  category: string;
  count: number;
  high_priority_count: number;
  percentage: number;
}

// Monthly projects data
export interface MonthlyData {
  month: string;
  count: number;
}

// Overall dashboard stats
export interface DashboardStats {
  total_projects_this_month: number;
  active_projects_this_month: number;
  completed_projects: number;
  projects_by_location: ProjectLocation[];
  top_issue_categories: IssueCategory[];
  monthly_completed_projects: MonthlyData[];
}

// Props for the StatsCard component
export interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  description: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
