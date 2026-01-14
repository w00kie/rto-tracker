import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

/**
 * Get a single day entry for the authenticated user
 */
export const getDay = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const entry = await ctx.db
      .query("dayEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .first();

    return entry;
  },
});

/**
 * Get all day entries in a date range for the authenticated user
 */
export const getDaysInRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const entries = await ctx.db
      .query("dayEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by date range
    return entries.filter(
      (entry) => entry.date >= args.startDate && entry.date <= args.endDate
    );
  },
});

/**
 * Get all day entries for the authenticated user
 */
export const getAllDays = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const entries = await ctx.db
      .query("dayEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return entries;
  },
});

/**
 * Set/update a day entry for the authenticated user
 */
export const setDay = mutation({
  args: {
    date: v.string(),
    location: v.union(
      v.literal("office"),
      v.literal("home"),
      v.literal("vacation"),
      v.literal("sick")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if entry exists
    const existing = await ctx.db
      .query("dayEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        location: args.location,
        notes: args.notes,
      });
      return existing._id;
    } else {
      // Create new entry
      const id = await ctx.db.insert("dayEntries", {
        userId,
        date: args.date,
        location: args.location,
        notes: args.notes,
      });
      return id;
    }
  },
});

/**
 * Remove a day entry for the authenticated user
 */
export const removeDay = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const entry = await ctx.db
      .query("dayEntries")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", args.date)
      )
      .first();

    if (entry) {
      await ctx.db.delete(entry._id);
    }
  },
});
