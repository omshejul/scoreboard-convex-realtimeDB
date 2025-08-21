import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    slug: v.string(),
  },
  handler: async ({ db }, { slug }) => {
    const doc = await db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    return doc ?? { left: 0, right: 0 };
  },
});

export const increment = mutation({
  args: {
    slug: v.string(),
    side: v.union(v.literal("left"), v.literal("right")),
  },
  handler: async ({ db }, { slug, side }) => {
    const existing = await db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!existing) {
      const left = side === "left" ? 1 : 0;
      const right = side === "right" ? 1 : 0;
      await db.insert("scoreboard", {
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
    await db.patch(existing._id, next);
  },
});

export const decrement = mutation({
  args: {
    slug: v.string(),
    side: v.union(v.literal("left"), v.literal("right")),
  },
  handler: async ({ db }, { slug, side }) => {
    const existing = await db
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
    await db.patch(existing._id, next);
  },
});

export const reset = mutation({
  args: {
    slug: v.string(),
  },
  handler: async ({ db }, { slug }) => {
    const existing = await db
      .query("scoreboard")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      await db.patch(existing._id, {
        left: 0,
        right: 0,
        updatedAt: Date.now(),
      });
    }
    return existing;
  },
});
