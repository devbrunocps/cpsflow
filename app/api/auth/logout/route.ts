import { NextResponse } from "next/server";
import { getSessionCookieName, getRefreshCookieName } from "@/lib/supabase";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  const expiredCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(0),
  };

  response.cookies.set(getSessionCookieName(), "", expiredCookie);
  response.cookies.set(getRefreshCookieName(), "", expiredCookie);

  return response;
}
