import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE } from "@/lib/admin-api";
import { getPublicSession } from "@/lib/auth";

export const LICENSE_ACCESS_COOKIE = "ksport_license_manager_access";

function getGateSecret() {
  return process.env.LICENSE_MANAGER_GATE_SECRET?.trim() || "";
}

export function hasLicenseGateSecret() { return Boolean(getGateSecret()); }

function signatureFor(token: string) {
  return createHmac("sha256", getGateSecret()).update(token).digest("base64url");
}

export async function mayManageLicenses() {
  const session = await getPublicSession();
  if (session?.role !== "admin") return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  const gate = cookieStore.get(LICENSE_ACCESS_COOKIE)?.value;
  if (!token || !gate || !getGateSecret()) return false;
  const expected = signatureFor(token);
  return gate.length === expected.length && timingSafeEqual(Buffer.from(gate), Buffer.from(expected));
}

export async function createLicenseAccessCookie() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  return token && getGateSecret() ? signatureFor(token) : null;
}
