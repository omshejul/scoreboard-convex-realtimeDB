import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", user.email ?? ""))
      .unique();

    return doc ?? { left: 0, right: 0 };
  },
});

export const increment = mutation({
  args: {
    side: v.union(v.literal("left"), v.literal("right")),
  },
  handler: async (ctx, { side }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const slug = user.email ?? "";
    const existing = await ctx.db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!existing) {
      const left = side === "left" ? 1 : 0;
      const right = side === "right" ? 1 : 0;
      await ctx.db.insert("scoreboard", {
        slug,
        left,
        right,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }
    const next = {
      left: existing.left + (side === "left" ? 1 : 0),
      right: existing.right + (side === "right" ? 1 : 0),
      updatedAt: Date.now(),
    };
    await ctx.db.patch(existing._id, next);
  },
});

export const decrement = mutation({
  args: {
    side: v.union(v.literal("left"), v.literal("right")),
  },
  handler: async (ctx, { side }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const slug = user.email ?? "";
    const existing = await ctx.db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!existing) {
      return; // Can't decrement if doesn't exist
    }
    const next = {
      left: Math.max(0, existing.left - (side === "left" ? 1 : 0)),
      right: Math.max(0, existing.right - (side === "right" ? 1 : 0)),
      updatedAt: Date.now(),
    };
    await ctx.db.patch(existing._id, next);
  },
});

export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Not authenticated");
    }

    const slug = user.email ?? "";
    const existing = await ctx.db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        left: 0,
        right: 0,
        updatedAt: Date.now(),
      });
    }
    return existing;
  },
});
