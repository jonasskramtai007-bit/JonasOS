import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, timingSafeEqual, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (!secret) {
    return isApi
      ? NextResponse.json({ error: "AUTH_SECRET is not configured" }, { status: 500 })
      : new NextResponse("AUTH_SECRET is not configured", { status: 500 });
  }

  // API routes also accept a shared-secret header for programmatic access.
  if (isApi) {
    const apiSecret = request.headers.get("x-api-secret");
    if (apiSecret && timingSafeEqual(apiSecret, secret)) {
      return NextResponse.next();
    }
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(secret, token)) {
    return NextResponse.next();
  }

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except /login, /api/auth/*, Next internals and static files.
  matcher: ["/((?!login|api/auth/|_next/|favicon.ico|.*\\..*).*)"],
};
