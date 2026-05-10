import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Obtener el token de las cookies
  const authToken = request.cookies.get("authToken");

  // Si es ruta protegida y no tiene token, redirigir a login
  if (pathname !== "/" && !authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If at login ('/') and has token, redirect to homepage
  if (pathname === "/" && authToken) {
    return NextResponse.redirect(new URL("/homepage", request.url));
  }

  return NextResponse.next();
}

// Configure on which routes to run the middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
