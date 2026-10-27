export type PublicSession = {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
};

const authUrl = process.env.KSPORT_AUTH_URL?.replace(/\/$/, "");

/**
 * Server-only boundary for the future Identity service.
 * It intentionally returns no session until the auth contract is configured.
 */
export async function getPublicSession(): Promise<PublicSession | null> {
  if (!authUrl) return null;
  return null;
}

export function isAuthConfigured() {
  return Boolean(authUrl);
}
