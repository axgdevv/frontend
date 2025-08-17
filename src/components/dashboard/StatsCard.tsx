import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { StatsCardProps } from "@/types/dashboard";

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  description,
  trend,
}) => (
  <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-lg ${iconBg}`}>
              <div className={iconColor}>{icon}</div>
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {title}
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {value.toLocaleString()}
            </p>
            {trend && (
              <div
                className={`flex items-center text-xs font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                <span className="ml-0.5">{trend.value}%</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {description}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);
