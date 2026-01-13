/**
 * Date utility functions for RTO tracking
 */

/**
 * Get ISO week number for a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get the start and end dates of a week
 */
export function getWeekBounds(
  year: number,
  weekNumber: number
): { start: Date; end: Date } {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (weekNumber - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  return { start: weekStart, end: weekEnd };
}

/**
 * Get quarter number (1-4) for a date
 */
export function getQuarter(date: Date): 1 | 2 | 3 | 4 {
  const month = date.getMonth();
  return (Math.floor(month / 3) + 1) as 1 | 2 | 3 | 4;
}

/**
 * Get the Monday of a week (week starts on Monday)
 */
export function getMondayOfWeek(year: number, weekNumber: number): Date {
  const { start } = getWeekBounds(year, weekNumber);
  return start;
}

/**
 * Determine which quarter a week belongs to based on where Monday falls
 * Special case: If week contains Jan 1st, it belongs to Q1 of that year
 */
export function getQuarterForWeek(
  year: number,
  weekNumber: number
): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const { start, end } = getWeekBounds(year, weekNumber);

  // Special case: If week contains Jan 1st, it belongs to Q1 of that year
  const jan1 = new Date(year, 0, 1);
  if (start <= jan1 && jan1 <= end) {
    return { year, quarter: 1 };
  }

  // Otherwise, quarter is determined by where Monday falls
  const monday = start;
  const mondayYear = monday.getFullYear();
  const mondayQuarter = getQuarter(monday);

  return { year: mondayYear, quarter: mondayQuarter };
}

/**
 * Get all weeks in a quarter
 * Each week belongs to the quarter where its Monday falls
 * Exception: weeks containing Jan 1st always belong to Q1 of that year
 */
export function getWeeksInQuarter(
  year: number,
  quarter: 1 | 2 | 3 | 4
): number[] {
  const weeks: number[] = [];

  // Check all possible weeks in and around the year
  // ISO weeks can be 1-53
  for (let weekNumber = 1; weekNumber <= 53; weekNumber++) {
    const weekQuarter = getQuarterForWeek(year, weekNumber);

    // Include week if it belongs to this quarter of this year
    if (weekQuarter.year === year && weekQuarter.quarter === quarter) {
      weeks.push(weekNumber);
    }
  }

  // Also check week 53 of previous year (might spill into Q1)
  if (quarter === 1) {
    const prevYearWeek53 = getQuarterForWeek(year - 1, 53);
    if (prevYearWeek53.year === year && prevYearWeek53.quarter === 1) {
      weeks.unshift(53); // Add to beginning since it's from previous year
    }
  }

  return weeks.sort((a, b) => a - b);
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse ISO date string to Date
 */
export function fromISODate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}

/**
 * Check if a date is a weekday (Monday-Friday)
 */
export function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Get all weekdays in a week
 */
export function getWeekdays(year: number, weekNumber: number): Date[] {
  const { start, end } = getWeekBounds(year, weekNumber);
  const weekdays: Date[] = [];

  const current = new Date(start);
  while (current <= end) {
    if (isWeekday(current)) {
      weekdays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return weekdays;
}

/**
 * Get current year
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get current week number
 */
export function getCurrentWeek(): { year: number; weekNumber: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    weekNumber: getWeekNumber(now),
  };
}

/**
 * Get current quarter
 */
export function getCurrentQuarter(): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    quarter: getQuarter(now),
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
