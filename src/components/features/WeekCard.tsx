/**
 * WeekCard component - displays a single week with day toggles
 */

import { forwardRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WeekSummary, WorkLocation } from "@/lib/types";
import { formatDate, fromISODate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface WeekCardProps {
  week: WeekSummary;
  isCurrentWeek?: boolean;
}

export const WeekCard = forwardRef<HTMLDivElement, WeekCardProps>(
  ({ week, isCurrentWeek = false }, ref) => {
    const setDayMutation = useMutation(api.dayEntries.setDay);

    const handleToggle = (date: string, currentLocation: WorkLocation) => {
      // Cycle through: home -> office -> vacation -> sick -> home
      const locationCycle: WorkLocation[] = [
        "home",
        "office",
        "vacation",
        "sick",
      ];
      const currentIndex = locationCycle.indexOf(currentLocation);
      const newLocation =
        locationCycle[(currentIndex + 1) % locationCycle.length];

      // Update via Convex mutation (optimistic updates handled by Convex)
      void setDayMutation({
        date,
        location: newLocation,
      });
    };

    return (
      <Card
        ref={ref}
        id={`week-${week.year}-${week.weekNumber}`}
        className={cn(
          "transition-colors",
          week.isCompliant ? "border-green-500/50" : "border-amber-500/50",
          isCurrentWeek && "bg-blue-50 dark:bg-blue-950/20"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Week {week.weekNumber}
              {isCurrentWeek && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                  (Current)
                </span>
              )}
            </CardTitle>
            <Badge variant={week.isCompliant ? "default" : "secondary"}>
              {week.officeDays} days
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDate(fromISODate(week.startDate))} -{" "}
            {formatDate(fromISODate(week.endDate))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {week.days.map((day) => {
              const locationConfig = {
                office: {
                  icon: "🏢",
                  label: "Office",
                  variant: "default" as const,
                },
                home: {
                  icon: "🏠",
                  label: "Home",
                  variant: "outline" as const,
                },
                vacation: {
                  icon: "🏖️",
                  label: "Vacation",
                  variant: "secondary" as const,
                },
                sick: {
                  icon: "🤒",
                  label: "Sick",
                  variant: "destructive" as const,
                },
              };
              const config = locationConfig[day.location];

              return (
                <Button
                  key={day.date}
                  variant={config.variant}
                  size="sm"
                  className="justify-between font-normal"
                  onClick={() => handleToggle(day.date, day.location)}
                >
                  <span>{formatDate(fromISODate(day.date))}</span>
                  <span className="text-xs">
                    {config.icon} {config.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }
);

WeekCard.displayName = "WeekCard";
