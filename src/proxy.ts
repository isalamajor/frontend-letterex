import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure on which routes to run the middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
