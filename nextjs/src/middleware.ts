import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only run on /readme/* paths
  if (!request.nextUrl.pathname.startsWith("/readme/")) {
    return NextResponse.next();
  }

  // Get the path after /readme/
  const repoPath = request.nextUrl.pathname.slice("/readme/".length);

  // If the path contains %2F, redirect to the decoded version
  if (repoPath.includes("%2F")) {
    const decodedPath = decodeURIComponent(repoPath);
    return NextResponse.redirect(
      new URL(`/readme/${decodedPath}`, request.url),
    );
  }

  return NextResponse.next();
}

// Configure middleware to match all /readme/* paths, including those with slashes
export const config = {
  matcher: [
    {
      source: "/readme/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}; 