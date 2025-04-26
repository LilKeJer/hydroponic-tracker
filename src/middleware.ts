import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Cek apakah user sudah login berdasarkan cookie user
  const user = request.cookies.get("user")?.value;
  const isAuthenticated = !!user;

  // Halaman login dan homepage tidak perlu authentication
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isHomePage = request.nextUrl.pathname === "/";

  // Jika mengakses halaman dashboard tapi belum login, redirect ke login
  if (!isAuthenticated && !isLoginPage && !isHomePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika sudah login dan mencoba akses login page, redirect ke dashboard
  if (isAuthenticated && (isLoginPage || isHomePage)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi middleware untuk berjalan pada path tertentu
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
