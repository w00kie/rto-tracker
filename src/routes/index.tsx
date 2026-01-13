import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { QuarterView } from "@/components/features/QuarterView";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { loadConfig } from "@/lib/storage";
import { calculateYearSummary } from "@/lib/compliance";
import {
  getCurrentYear,
  getCurrentQuarter,
  getCurrentWeek,
} from "@/lib/date-utils";
import type { QuarterSummary } from "@/lib/types";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const [year, setYear] = useState(getCurrentYear());
  const [quarters, setQuarters] = useState<QuarterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuarters, setExpandedQuarters] = useState<Set<number>>(
    new Set()
  );

  const currentWeekInfo = getCurrentWeek();
  const currentQuarterInfo = getCurrentQuarter();

  const loadData = () => {
    setIsLoading(true);
    const config = loadConfig();
    const quarterSummaries = calculateYearSummary(year, config);
    setQuarters(quarterSummaries);

    // Only expand current quarter by default on initial load or when viewing current year
    if (year === currentQuarterInfo.year) {
      setExpandedQuarters(new Set([currentQuarterInfo.quarter]));
    } else {
      setExpandedQuarters(new Set());
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [year]);

  const handleYearChange = (delta: number) => {
    setYear(year + delta);
  };

  const toggleQuarter = (quarter: number) => {
    setExpandedQuarters((prev) => {
      const next = new Set(prev);
      if (next.has(quarter)) {
        next.delete(quarter);
      } else {
        next.add(quarter);
      }
      return next;
    });
  };

  const scrollToCurrentWeek = useCallback(() => {
    // First expand the current quarter if not already
    if (year === currentQuarterInfo.year) {
      setExpandedQuarters((prev) =>
        new Set(prev).add(currentQuarterInfo.quarter)
      );

      // Wait for the expansion animation to complete
      setTimeout(() => {
        const weekElement = document.getElementById(
          `week-${currentWeekInfo.year}-${currentWeekInfo.weekNumber}`
        );
        weekElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [year, currentQuarterInfo, currentWeekInfo]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const config = loadConfig();
  const totalCompliantWeeks = quarters.reduce(
    (sum, q) => sum + q.compliantWeeks,
    0
  );
  const totalWeeks = quarters.reduce((sum, q) => sum + q.totalWeeks, 0);
  const overallCompliance =
    totalWeeks > 0 ? Math.round((totalCompliantWeeks / totalWeeks) * 100) : 0;

  const isCurrentYear = year === currentQuarterInfo.year;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">RTO Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Track your office attendance and compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(-1)}
          >
            ← {year - 1}
          </Button>
          <div className="px-4 py-2 font-semibold text-lg">{year}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(1)}
          >
            {year + 1} →
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Annual Summary</CardTitle>
              <CardDescription>
                Your compliance status for {year}
              </CardDescription>
            </div>
            {isCurrentYear && (
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToCurrentWeek}
                className="gap-2"
              >
                <ArrowDown className="h-4 w-4" />
                Jump to Current Week
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground">
                Overall Compliance
              </div>
              <div className="text-3xl font-bold mt-1">
                {overallCompliance}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalCompliantWeeks} of {totalWeeks} weeks compliant
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Required Office Days
              </div>
              <div className="text-3xl font-bold mt-1">
                {config.requiredOfficeDaysPerWeek}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                days per week
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Target Per Quarter
              </div>
              <div className="text-3xl font-bold mt-1">
                {config.requiredCompliantWeeksPerQuarter}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                compliant weeks
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Warning Threshold
              </div>
              <div className="text-3xl font-bold mt-1">
                {config.warningThresholdWeeks}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                weeks minimum
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarters */}
      <div className="space-y-8">
        {quarters.map((quarter) => {
          const isCurrentWeekInQuarter =
            isCurrentYear &&
            quarter.quarter === currentQuarterInfo.quarter &&
            quarter.weeks.some(
              (w) => w.weekNumber === currentWeekInfo.weekNumber
            );

          return (
            <QuarterView
              key={`${quarter.year}-Q${quarter.quarter}`}
              quarter={quarter}
              onUpdate={loadData}
              isExpanded={expandedQuarters.has(quarter.quarter)}
              onToggle={() => toggleQuarter(quarter.quarter)}
              currentWeek={
                isCurrentWeekInQuarter ? currentWeekInfo.weekNumber : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
