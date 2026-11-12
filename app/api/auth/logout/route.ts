import { NextResponse } from "next/server";
import { ADMIN_TOKEN_COOKIE, USER_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Đã đăng xuất thành công.",
  });

  response.cookies.set({
    name: USER_SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}

