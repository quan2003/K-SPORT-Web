import { cookies } from "next/headers";

export const ADMIN_TOKEN_COOKIE = "ksport_admin_token";

function resolveAdminApiBase() {
  const explicit = process.env.KSPORT_ADMIN_API_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const publicApi = process.env.KSPORT_PUBLIC_API_URL?.replace(/\/$/, "");
  return publicApi?.replace(/\/api\/public$/, "") ?? "";
}

export async function adminApiFetch(path: string, init: RequestInit = {}) {
  const baseUrl = resolveAdminApiBase();
  if (!baseUrl) throw new Error("KSPORT_ADMIN_API_URL chưa được cấu hình");
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${baseUrl}${path}`, { ...init, headers, cache: "no-store" });
}

export function getAdminApiBase() {
  return resolveAdminApiBase();
}
