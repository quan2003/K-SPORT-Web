import { NextResponse } from "next/server";
import { createUserSessionToken, getUserSession, USER_SESSION_COOKIE } from "@/lib/auth";
import { updateUserProfile } from "@/lib/user-store";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  return NextResponse.json({ user: session });
}

export async function PATCH(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const user = updateUserProfile(session.userId, {
      name: typeof body.name === "string" ? body.name : undefined,
      phone: typeof body.phone === "string" ? body.phone : undefined,
      gender: body.gender === "male" || body.gender === "female" || body.gender === "other" ? body.gender : undefined,
      dateOfBirth: typeof body.dateOfBirth === "string" ? body.dateOfBirth : undefined,
      clubOrUnit: typeof body.clubOrUnit === "string" ? body.clubOrUnit : undefined,
    });
    if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set({
      name: USER_SESSION_COOKIE,
      value: createUserSessionToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatarUrl,
        authProvider: user.authProvider,
        clubOrUnit: user.clubOrUnit,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể lưu thông tin." },
      { status: 400 },
    );
  }
}
