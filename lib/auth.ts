import { cookies } from "next/headers";

export type PublicSession = {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

export async function getPublicSession(): Promise<PublicSession | null> {
  const token = (await cookies()).get("ksport_admin_token")?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as { username?: string; name?: string };
    if (!payload.username) return null;
    return { userId: payload.username, name: payload.name || payload.username, email: "", role: "admin" };
  } catch { return null; }
}

export function isAuthConfigured() {
  return Boolean(process.env.KSPORT_ADMIN_API_URL || process.env.KSPORT_PUBLIC_API_URL);
}
