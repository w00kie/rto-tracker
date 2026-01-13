/**
 * WeekCard component - displays a single week with day toggles
 */

import { useState, useEffect, forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WeekSummary, WorkLocation } from "@/lib/types";
import { setDay } from "@/lib/storage";
import { formatDate, fromISODate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface WeekCardProps {
  week: WeekSummary;
  onUpdate: () => void;
  isCurrentWeek?: boolean;
}

export const WeekCard = forwardRef<HTMLDivElement, WeekCardProps>(
  ({ week, onUpdate, isCurrentWeek = false }, ref) => {
    const [localWeek, setLocalWeek] = useState(week);

    useEffect(() => {
      setLocalWeek(week);
    }, [week]);

    const handleToggle = (date: string, currentLocation: WorkLocation) => {
      // Cycle through: home -> office -> vacation -> sick -> home
      const locationCycle: WorkLocation[] = ["home", "office", "vacation", "sick"];
      const currentIndex = locationCycle.indexOf(currentLocation);
      const newLocation = locationCycle[(currentIndex + 1) % locationCycle.length];

      setDay({
        date,
        location: newLocation,
      });

      // Update local state optimistically
      const updatedDays = localWeek.days.map((d) =>
        d.date === date ? { ...d, location: newLocation } : d
      );
      
      setLocalWeek({
        ...localWeek,
        days: updatedDays,
        officeDays: updatedDays.filter((d) => d.location === "office").length,
      });

      // Notify parent to refresh
      onUpdate();
    };

    return (
      <Card
        ref={ref}
        id={`week-${localWeek.year}-${localWeek.weekNumber}`}
        className={cn(
          "transition-colors",
          localWeek.isCompliant ? "border-green-500/50" : "border-amber-500/50",
          isCurrentWeek && "bg-blue-50 dark:bg-blue-950/20"
        )}
      >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Week {localWeek.weekNumber}
            {isCurrentWeek && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                (Current)
              </span>
            )}
          </CardTitle>
          <Badge variant={localWeek.isCompliant ? "default" : "secondary"}>
            {localWeek.officeDays} days
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(fromISODate(localWeek.startDate))} -{" "}
          {formatDate(fromISODate(localWeek.endDate))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {localWeek.days.map((day) => {
            const locationConfig = {
              office: { icon: "🏢", label: "Office", variant: "default" as const },
              home: { icon: "🏠", label: "Home", variant: "outline" as const },
              vacation: { icon: "🏖️", label: "Vacation", variant: "secondary" as const },
              sick: { icon: "🤒", label: "Sick", variant: "destructive" as const },
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
