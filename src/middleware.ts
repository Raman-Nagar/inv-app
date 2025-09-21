import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("invoiceapp_token");

  // Public routes
  if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")) {
    if (token) {
      return NextResponse.redirect(new URL("/invoices", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/invoices/:path*", "/items/:path*", "/invoice/:path*", "/login", "/signup"],
};
