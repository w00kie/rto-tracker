/**
 * Browser storage layer for RTO data persistence
 * Uses localStorage for simple single-user data storage
 */

import type { DayEntry, ComplianceConfig } from "./types";

const STORAGE_KEY = "rto-tracker-data";
const CONFIG_KEY = "rto-tracker-config";

interface StorageData {
  days: Record<string, DayEntry>; // Keyed by ISO date string
}

/**
 * Default compliance configuration
 */
const DEFAULT_CONFIG: ComplianceConfig = {
  requiredOfficeDaysPerWeek: 2,
  requiredCompliantWeeksPerQuarter: 8,
  warningThresholdWeeks: 7,
};

/**
 * Load all day entries from storage
 */
export function loadDays(): Record<string, DayEntry> {
  if (typeof window === "undefined") return {};

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};

    const parsed: StorageData = JSON.parse(data);
    return parsed.days || {};
  } catch (error) {
    console.error("Failed to load days from storage:", error);
    return {};
  }
}

/**
 * Save all day entries to storage
 */
export function saveDays(days: Record<string, DayEntry>): void {
  if (typeof window === "undefined") return;

  try {
    const data: StorageData = { days };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save days to storage:", error);
  }
}

/**
 * Get a specific day entry
 */
export function getDay(date: string): DayEntry | undefined {
  const days = loadDays();
  return days[date];
}

/**
 * Set a day entry
 */
export function setDay(entry: DayEntry): void {
  const days = loadDays();
  days[entry.date] = entry;
  saveDays(days);
}

/**
 * Delete a day entry
 */
export function deleteDay(date: string): void {
  const days = loadDays();
  delete days[date];
  saveDays(days);
}

/**
 * Get days for a date range
 */
export function getDaysInRange(startDate: string, endDate: string): DayEntry[] {
  const days = loadDays();
  const entries: DayEntry[] = [];

  for (const [date, entry] of Object.entries(days)) {
    if (date >= startDate && date <= endDate) {
      entries.push(entry);
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Load compliance configuration
 */
export function loadConfig(): ComplianceConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;

  try {
    const data = localStorage.getItem(CONFIG_KEY);
    if (!data) return DEFAULT_CONFIG;

    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load config from storage:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save compliance configuration
 */
export function saveConfig(config: ComplianceConfig): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save config to storage:", error);
  }
}

/**
 * Clear all data (for testing or reset)
 */
export function clearAllData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error("Failed to clear storage:", error);
  }
}
