import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Default compliance configuration
 */
const DEFAULT_CONFIG = {
  requiredOfficeDaysPerWeek: 2,
  requiredCompliantWeeksPerQuarter: 8,
  warningThresholdWeeks: 7,
};

/**
 * Get compliance configuration for the authenticated user
 */
export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const config = await ctx.db
      .query("complianceConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return config || DEFAULT_CONFIG;
  },
});

/**
 * Set compliance configuration for the authenticated user
 */
export const setConfig = mutation({
  args: {
    requiredOfficeDaysPerWeek: v.number(),
    requiredCompliantWeeksPerQuarter: v.number(),
    warningThresholdWeeks: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("complianceConfig")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing config
      await ctx.db.patch(existing._id, {
        requiredOfficeDaysPerWeek: args.requiredOfficeDaysPerWeek,
        requiredCompliantWeeksPerQuarter: args.requiredCompliantWeeksPerQuarter,
        warningThresholdWeeks: args.warningThresholdWeeks,
      });
      return existing._id;
    } else {
      // Create new config
      const id = await ctx.db.insert("complianceConfig", {
        userId,
        requiredOfficeDaysPerWeek: args.requiredOfficeDaysPerWeek,
        requiredCompliantWeeksPerQuarter: args.requiredCompliantWeeksPerQuarter,
        warningThresholdWeeks: args.warningThresholdWeeks,
      });
      return id;
    }
  },
});
