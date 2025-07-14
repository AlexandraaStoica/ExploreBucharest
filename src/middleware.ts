import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // Match all routes except static files and _next
  ],
};
