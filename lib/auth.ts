import { cookies } from "next/headers";

export type AdminRole = "admin" | "btc" | "editor" | "viewer";

export type PublicSession = {
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  tournamentId?: string;
  assignedTournament?: string;
};

export async function getPublicSession(): Promise<PublicSession | null> {
  const token = (await cookies()).get("ksport_admin_token")?.value;
  if (!token) return null;

  try {
    let payloadRaw = "";
    if (token.includes(".")) {
      payloadRaw = Buffer.from(token.split(".")[1], "base64url").toString("utf8");
    } else {
      payloadRaw = Buffer.from(token, "base64").toString("utf8");
    }
    const payload = JSON.parse(payloadRaw) as {
      u?: string;
      username?: string;
      name?: string;
      role?: AdminRole;
      email?: string;
      tournamentId?: string;
      assignedTournament?: string;
    };

    const username = payload.username || payload.u;
    if (!username) return null;

    const role: AdminRole = payload.role || (username.startsWith("btc") ? "btc" : "admin");
    const name = payload.name || (role === "btc" ? "Ban Tổ Chức Phú Thọ 2026" : "Quản trị viên Hệ thống");

    return {
      userId: username,
      name,
      email: payload.email || `${username}@k-sport.net`,
      role,
      tournamentId: payload.tournamentId || "giai-vo-dich-clb-karate-phu-tho-2026",
      assignedTournament: payload.assignedTournament || "Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026",
    };
  } catch {
    return null;
  }
}

export function isAuthConfigured() {
  return Boolean(process.env.KSPORT_ADMIN_API_URL || process.env.KSPORT_PUBLIC_API_URL);
}
