import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";

export async function POST(request: Request) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl, 303);
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl, 303);
  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
