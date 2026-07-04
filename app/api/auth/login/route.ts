import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  timingSafeEqual,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const password = process.env.DASHBOARD_PASSWORD;
  if (!secret || !password) {
    return NextResponse.json(
      { error: "AUTH_SECRET / DASHBOARD_PASSWORD are not configured" },
      { status: 500 },
    );
  }

  let attempt: unknown;
  try {
    attempt = (await request.json())?.password;
  } catch {
    attempt = undefined;
  }
  if (typeof attempt !== "string" || !timingSafeEqual(attempt, password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
