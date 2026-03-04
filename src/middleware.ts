import { NextRequest, NextResponse } from "next/server";

// Rutas protegidas (todas excepto '/')
const protectedRoutes = [
  "/homepage",
  "/profile",
  "/friends",
  "/community",
  "/new-letter",
  "/correct-letter",
  "/edit-letter",
  "/view-correction",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener el token de las cookies
  const authToken = request.cookies.get("authToken")?.value;

  // Si es ruta protegida y no tiene token, redirigir a login
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !authToken
  ) {
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
