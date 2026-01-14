/**
 * Compliance calculation logic
 */

import type {
  DayEntry,
  WeekSummary,
  QuarterSummary,
  ComplianceConfig,
  ComplianceStatus,
} from "./types";
import {
  getWeekBounds,
  getWeekdays,
  toISODate,
  getWeeksInQuarter,
} from "./date-utils";

/**
 * Calculate week summary from day entries
 */
export function calculateWeekSummary(
  year: number,
  weekNumber: number,
  config: ComplianceConfig,
  allEntries: DayEntry[]
): WeekSummary {
  const { start, end } = getWeekBounds(year, weekNumber);
  const startDate = toISODate(start);
  const endDate = toISODate(end);

  // Get all weekdays in this week
  const weekdays = getWeekdays(year, weekNumber);

  // Filter entries for this week
  const loggedDays = allEntries.filter(
    (entry) => entry.date >= startDate && entry.date <= endDate
  );
  const loggedMap = new Map(loggedDays.map((d) => [d.date, d]));

  // Create entries for all weekdays (defaulting to 'home')
  const days: DayEntry[] = weekdays.map((date) => {
    const dateStr = toISODate(date);
    return (
      loggedMap.get(dateStr) || {
        date: dateStr,
        location: "home",
      }
    );
  });

  // Count office days
  const officeDays = days.filter((d) => d.location === "office").length;

  // Check compliance
  const isCompliant = officeDays >= config.requiredOfficeDaysPerWeek;

  return {
    weekNumber,
    year,
    startDate,
    endDate,
    officeDays,
    isCompliant,
    days,
  };
}

/**
 * Calculate quarter summary
 */
export function calculateQuarterSummary(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  config: ComplianceConfig,
  allEntries: DayEntry[]
): QuarterSummary {
  const weekNumbers = getWeeksInQuarter(year, quarter);

  const weeks = weekNumbers.map((weekNumber) =>
    calculateWeekSummary(year, weekNumber, config, allEntries)
  );

  const compliantWeeks = weeks.filter((w) => w.isCompliant).length;
  const totalWeeks = weeks.length;

  // Determine status based on absolute week counts
  let status: ComplianceStatus;
  if (compliantWeeks >= config.requiredCompliantWeeksPerQuarter) {
    status = "compliant";
  } else if (compliantWeeks >= config.warningThresholdWeeks) {
    status = "warning";
  } else {
    status = "danger";
  }

  return {
    quarter,
    year,
    compliantWeeks,
    totalWeeks,
    status,
    weeks,
  };
}

/**
 * Calculate all quarters for a year
 */
export function calculateYearSummary(
  year: number,
  config: ComplianceConfig,
  allEntries: DayEntry[] = []
): QuarterSummary[] {
  return [1, 2, 3, 4].map((q) =>
    calculateQuarterSummary(year, q as 1 | 2 | 3 | 4, config, allEntries)
  );
}
