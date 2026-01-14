import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Convex schema for RTO Tracker
 *
 * All tables are user-scoped with userId index for efficient queries.
 */
export default defineSchema({
  ...authTables,

  /**
   * Day entries - tracks work location for each day
   */
  dayEntries: defineTable({
    userId: v.string(),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    location: v.union(
      v.literal("office"),
      v.literal("home"),
      v.literal("vacation"),
      v.literal("sick")
    ),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),

  /**
   * Compliance configuration - per-user RTO policy settings
   */
  complianceConfig: defineTable({
    userId: v.string(),
    requiredOfficeDaysPerWeek: v.number(),
    requiredCompliantWeeksPerQuarter: v.number(),
    warningThresholdWeeks: v.number(),
  }).index("by_user", ["userId"]),
});
