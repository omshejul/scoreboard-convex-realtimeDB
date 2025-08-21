import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
  session: {
    totalDurationMs: 1000 * 60 * 60 * 24 * 60, // 60 days
    inactiveDurationMs: 1000 * 60 * 60 * 24 * 60, // 60 days
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
