/**
 * Core types for RTO tracking
 */

export type WorkLocation = "office" | "home" | "vacation" | "sick";

export interface DayEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  location: WorkLocation;
  notes?: string;
}

export interface WeekSummary {
  weekNumber: number; // ISO week number
  year: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  officeDays: number;
  isCompliant: boolean;
  days: DayEntry[];
}

export type ComplianceStatus = "compliant" | "warning" | "danger";

export interface QuarterSummary {
  quarter: 1 | 2 | 3 | 4;
  year: number;
  compliantWeeks: number;
  totalWeeks: number;
  status: ComplianceStatus;
  weeks: WeekSummary[];
}

export interface ComplianceConfig {
  requiredOfficeDaysPerWeek: number;
  requiredCompliantWeeksPerQuarter: number; // Minimum weeks needed
  warningThresholdWeeks: number; // Warning if below this
}

export interface YearData {
  year: number;
  quarters: QuarterSummary[];
  config: ComplianceConfig;
}
