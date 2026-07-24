import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk guards the Studio and its admin APIs. Everything else is public.
 * The sign-in route itself must stay reachable while signed out.
 */
const isProtected = createRouteMatcher([
  "/studio(.*)",
  "/api/appwrite/(.*)",
  "/api/admin/(.*)",
]);
const isSignIn = createRouteMatcher(["/studio/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isSignIn(req)) return NextResponse.next();

  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/studio/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next internals and static files; run on everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
