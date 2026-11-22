import crypto from "node:crypto";
import type { AdminUserItem } from "@/lib/admin-store";

const DEFAULT_SUPABASE_URL = "https://qjipcijesxlwnqdrsljl.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_xbGNC6A3fRVrtr7YEmV8tA_EwyB2t39";

function getSupabaseConfig() {
  const url = (
    process.env.REGISTRATION_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_REGISTRATION_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).replace(/\/$/, "");
  const key =
    process.env.REGISTRATION_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_REGISTRATION_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;
  return { url, key };
}

function supabaseHeaders(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

type SupabaseAccountRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  assigned_tournament?: string | null;
  status?: string | null;
  password_hash?: string | null;
  password_salt?: string | null;
  last_active?: string | null;
  created_at?: string | null;
};

function normalizeRole(raw: string | undefined): AdminUserItem["role"] {
  const r = String(raw || "").trim().toLowerCase();
  if (r === "admin" || r === "btc" || r === "editor" || r === "user") return r;
  return "user";
}

function toAdminUserItem(row: SupabaseAccountRow): AdminUserItem {
  return {
    id: row.id,
    username: row.username || row.email,
    name: row.name,
    email: row.email,
    role: normalizeRole(row.role),
    assignedTournament: row.assigned_tournament || undefined,
    lastActive: row.last_active || row.created_at || new Date().toISOString(),
    status: row.status === "Tạm khóa" ? "Tạm khóa" : "Hoạt động",
  };
}

export async function listSupabaseUsers(): Promise<AdminUserItem[]> {
  try {
    const { url, key } = getSupabaseConfig();
    const res = await fetch(
      `${url}/rest/v1/admin_accounts?select=id,username,name,email,role,assigned_tournament,status,last_active,created_at&order=created_at.desc&limit=500`,
      {
        headers: supabaseHeaders(key),
        cache: "no-store",
        signal: AbortSignal.timeout(4_000),
      },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as SupabaseAccountRow[];
    if (!Array.isArray(rows)) return [];
    return rows.map(toAdminUserItem);
  } catch {
    return [];
  }
}

export async function createSupabaseUser(input: {
  username: string;
  name: string;
  email: string;
  role: AdminUserItem["role"];
  assignedTournament?: string;
  status?: AdminUserItem["status"];
  password?: string;
}): Promise<{ item: AdminUserItem | null; error?: string }> {
  try {
    const { url, key } = getSupabaseConfig();
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();
    const id = `sb-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
    const rawPwd = (input.password || "").trim();
    const salt = rawPwd ? generateSalt() : null;
    const hash = rawPwd && salt ? hashPassword(rawPwd, salt) : null;

    const payload = {
      id,
      username,
      name: input.name.trim(),
      email,
      role: input.role,
      assigned_tournament: input.assignedTournament?.trim() || null,
      status: input.status || "Hoạt động",
      password_hash: hash,
      password_salt: salt,
      last_active: new Date().toISOString(),
    };

    const res = await fetch(`${url}/rest/v1/admin_accounts`, {
      method: "POST",
      headers: supabaseHeaders(key, { Prefer: "return=representation" }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { item: null, error: errText || `HTTP ${res.status}` };
    }

    const rows = (await res.json()) as SupabaseAccountRow[];
    return { item: rows[0] ? toAdminUserItem(rows[0]) : toAdminUserItem(payload) };
  } catch (err) {
    return { item: null, error: err instanceof Error ? err.message : "Supabase error" };
  }
}

async function findSupabaseUserByIdOrEmail(
  idOrEmail: string,
): Promise<SupabaseAccountRow | null> {
  try {
    const { url, key } = getSupabaseConfig();
    const clean = idOrEmail.trim();
    const encoded = encodeURIComponent(clean);
    const byId = await fetch(
      `${url}/rest/v1/admin_accounts?id=eq.${encoded}&select=*&limit=1`,
      { headers: supabaseHeaders(key), cache: "no-store", signal: AbortSignal.timeout(4_000) },
    );
    if (byId.ok) {
      const rows = (await byId.json()) as SupabaseAccountRow[];
      if (rows[0]) return rows[0];
    }

    const byEmail = await fetch(
      `${url}/rest/v1/admin_accounts?email=ilike.${encodeURIComponent(clean.toLowerCase())}&select=*&limit=1`,
      { headers: supabaseHeaders(key), cache: "no-store", signal: AbortSignal.timeout(4_000) },
    );
    if (byEmail.ok) {
      const rows = (await byEmail.json()) as SupabaseAccountRow[];
      if (rows[0]) return rows[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateSupabaseUser(
  idOrEmail: string,
  updates: Partial<AdminUserItem> & { password?: string },
): Promise<AdminUserItem | null> {
  try {
    const { url, key } = getSupabaseConfig();
    const existing = await findSupabaseUserByIdOrEmail(idOrEmail);

    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name.trim();
    if (updates.email !== undefined) patch.email = updates.email.trim().toLowerCase();
    if (updates.username !== undefined) patch.username = updates.username.trim().toLowerCase();
    if (updates.role !== undefined) patch.role = updates.role;
    if ("assignedTournament" in updates) {
      patch.assigned_tournament = updates.assignedTournament?.trim() || null;
    }
    if (updates.status !== undefined) patch.status = updates.status;

    if (updates.password && updates.password.trim()) {
      const salt = generateSalt();
      patch.password_salt = salt;
      patch.password_hash = hashPassword(updates.password.trim(), salt);
    }

    if (existing) {
      const res = await fetch(
        `${url}/rest/v1/admin_accounts?id=eq.${encodeURIComponent(existing.id)}`,
        {
          method: "PATCH",
          headers: supabaseHeaders(key, { Prefer: "return=representation" }),
          body: JSON.stringify(patch),
          signal: AbortSignal.timeout(4_000),
        },
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as SupabaseAccountRow[];
      return rows[0] ? toAdminUserItem(rows[0]) : toAdminUserItem({ ...existing, ...patch } as SupabaseAccountRow);
    }

    // If not in Supabase yet (e.g. VPS or local user being edited for the first time), upsert a row
    const email = String(updates.email || (idOrEmail.includes("@") ? idOrEmail : `${idOrEmail}@k-sport.net`))
      .trim()
      .toLowerCase();
    const username = String(updates.username || email).trim().toLowerCase();
    const upsertPayload = {
      id: idOrEmail.startsWith("sb-") ? idOrEmail : `sb-${crypto.createHash("md5").update(email).digest("hex").slice(0, 12)}`,
      username,
      name: String(updates.name || username),
      email,
      role: updates.role || "user",
      assigned_tournament: updates.assignedTournament?.trim() || null,
      status: updates.status || "Hoạt động",
      password_salt: (patch.password_salt as string | undefined) || null,
      password_hash: (patch.password_hash as string | undefined) || null,
      last_active: new Date().toISOString(),
    };

    const res = await fetch(`${url}/rest/v1/admin_accounts?on_conflict=email`, {
      method: "POST",
      headers: supabaseHeaders(key, { Prefer: "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify(upsertPayload),
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as SupabaseAccountRow[];
    return rows[0] ? toAdminUserItem(rows[0]) : toAdminUserItem(upsertPayload);
  } catch {
    return null;
  }
}

export async function deleteSupabaseUser(idOrEmail: string): Promise<boolean> {
  try {
    const { url, key } = getSupabaseConfig();
    const existing = await findSupabaseUserByIdOrEmail(idOrEmail);
    if (!existing) return false;

    const res = await fetch(
      `${url}/rest/v1/admin_accounts?id=eq.${encodeURIComponent(existing.id)}`,
      {
        method: "DELETE",
        headers: supabaseHeaders(key),
        signal: AbortSignal.timeout(4_000),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function authenticateSupabaseUser(
  identifier: string,
  passwordInput: string,
): Promise<{
  user: {
    id: string;
    name: string;
    email: string;
    role: AdminUserItem["role"];
    authProvider: "email" | "admin";
    clubOrUnit?: string;
    assignedTournament?: string;
  } | null;
  suspended?: boolean;
}> {
  try {
    const { url, key } = getSupabaseConfig();
    const clean = identifier.trim().toLowerCase();
    if (!clean || !passwordInput) return { user: null };

    const encoded = encodeURIComponent(clean);
    const res = await fetch(
      `${url}/rest/v1/admin_accounts?or=(email.ilike.${encoded},username.ilike.${encoded})&select=*&limit=1`,
      {
        headers: supabaseHeaders(key),
        cache: "no-store",
        signal: AbortSignal.timeout(4_000),
      },
    );
    if (!res.ok) return { user: null };
    const rows = (await res.json()) as SupabaseAccountRow[];
    const row = rows[0];
    if (!row) return { user: null };

    if (row.status === "Tạm khóa") {
      return { user: null, suspended: true };
    }

    if (!row.password_salt || !row.password_hash) {
      return { user: null };
    }

    const computed = hashPassword(passwordInput.trim(), row.password_salt);
    if (computed !== row.password_hash) {
      return { user: null };
    }

    // Best-effort update last_active
    void fetch(`${url}/rest/v1/admin_accounts?id=eq.${encodeURIComponent(row.id)}`, {
      method: "PATCH",
      headers: supabaseHeaders(key, { Prefer: "return=minimal" }),
      body: JSON.stringify({ last_active: new Date().toISOString() }),
      signal: AbortSignal.timeout(2_500),
    }).catch(() => {});

    const role = normalizeRole(row.role);
    return {
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role,
        authProvider: role === "admin" || role === "btc" ? "admin" : "email",
        assignedTournament: row.assigned_tournament || undefined,
      },
    };
  } catch {
    return { user: null };
  }
}

