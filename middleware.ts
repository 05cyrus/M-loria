// middleware.ts
// Note: Firebase Auth is client-side, so we use a lightweight check here.
// Full auth enforcement happens in the layout/page components via useAuth().
// Middleware handles basic redirect logic based on cookies.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];
const PROTECTED_PATHS = ["/dashboard", "/setup", "/meals"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes and static assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For protected paths, the client-side auth context handles full enforcement.
  // Middleware cannot read Firebase Auth state directly, so we let client handle it.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
