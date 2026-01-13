/**
 * QuarterView component - displays all weeks in a quarter
 */

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { WeekCard } from "./WeekCard";
import type { QuarterSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuarterViewProps {
  quarter: QuarterSummary;
  onUpdate: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  currentWeek?: number;
}

export function QuarterView({
  quarter,
  onUpdate,
  isExpanded,
  onToggle,
  currentWeek,
}: QuarterViewProps) {
  const quarterNames = ["Q1", "Q2", "Q3", "Q4"];
  const quarterLabel = quarterNames[quarter.quarter - 1];

  // Determine styling based on status
  const statusConfig = {
    compliant: {
      border: "border-green-500",
      badge: "default" as const,
      text: "text-green-600 dark:text-green-400",
      icon: "✓",
      message: "Meeting compliance requirements",
    },
    warning: {
      border: "border-amber-500",
      badge: "secondary" as const,
      text: "text-amber-600 dark:text-amber-400",
      icon: "⚠",
      message: "Warning: Below target, but above minimum threshold",
    },
    danger: {
      border: "border-red-500",
      badge: "destructive" as const,
      text: "text-red-600 dark:text-red-400",
      icon: "✗",
      message: "Danger: Below minimum compliance threshold",
    },
  };

  const config = statusConfig[quarter.status];

  return (
    <div className="space-y-4">
      <Card className={cn("border-2", config.border)}>
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <CardTitle className="text-xl">
                {quarterLabel} {quarter.year}
              </CardTitle>
            </div>
            <Badge variant={config.badge} className="text-sm">
              {quarter.compliantWeeks}/{quarter.totalWeeks} weeks
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground ml-8">
            <span className={config.text}>
              {config.icon} {config.message}
            </span>
          </div>
        </CardHeader>
      </Card>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quarter.weeks.map((week) => (
            <WeekCard
              key={`${week.year}-W${week.weekNumber}`}
              week={week}
              onUpdate={onUpdate}
              isCurrentWeek={currentWeek === week.weekNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
}
