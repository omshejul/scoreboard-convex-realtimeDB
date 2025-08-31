import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Persist auth cookies for 60 days so sessions survive browser restarts
export default convexAuthNextjsMiddleware(undefined, {
  cookieConfig: {
    // maxAge is in seconds
    maxAge: 60 * 60 * 24 * 60,
  },
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

