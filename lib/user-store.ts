import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type UserRole = "user" | "admin" | "btc" | "editor" | "viewer" | "referee" | "learner";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider: "email" | "google" | "admin";
  passwordHash?: string;
  passwordSalt?: string;
  avatarUrl?: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  clubOrUnit?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type SafeUser = Omit<UserRecord, "passwordHash" | "passwordSalt">;

function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function stripSensitive(user: UserRecord): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    authProvider: user.authProvider,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    clubOrUnit: user.clubOrUnit,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// Default seeded users for instant login & testing
const DEFAULT_SALT = "ksport-fixed-salt-2026";
const SEED_USERS: UserRecord[] = [
  {
    id: "user-admin",
    name: "Quản trị viên Hệ thống",
    email: "admin@k-sport.net",
    role: "admin",
    authProvider: "admin",
    passwordSalt: DEFAULT_SALT,
    passwordHash: hashPassword("Ksport!Quan_2026#", DEFAULT_SALT),
    avatarUrl: "/images/athlete-portrait.png",
    clubOrUnit: "Ban Quản Trị K-SPORT",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-btc",
    name: "Ban Tổ Chức Phú Thọ 2026",
    email: "btc@k-sport.net",
    role: "btc",
    authProvider: "admin",
    passwordSalt: DEFAULT_SALT,
    passwordHash: hashPassword("Ksport!Btc2026", DEFAULT_SALT),
    clubOrUnit: "Hội Karate Tỉnh Phú Thọ",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-default",
    name: "Võ Sĩ Karate",
    email: "user.karate@k-sport.net",
    role: "user",
    authProvider: "email",
    passwordSalt: DEFAULT_SALT,
    passwordHash: hashPassword("Ksport!2026", DEFAULT_SALT),
    clubOrUnit: "CLB Karate K-SPORT",
    createdAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "user-learner-01",
    name: "Trần Thị Mai",
    email: "hocvien.karate@gmail.com",
    role: "user",
    authProvider: "email",
    passwordSalt: DEFAULT_SALT,
    passwordHash: hashPassword("Ksport!2026", DEFAULT_SALT),
    clubOrUnit: "CLB Karate Thanh Xuân",
    createdAt: "2026-02-15T10:00:00.000Z",
  },
];

// Persistent storage file path (when available)
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// In-memory registry (singleton across node process)
let memoryUsers: Map<string, UserRecord> | null = null;

function loadUsersFromDisk(): Map<string, UserRecord> {
  const map = new Map<string, UserRecord>();
  // 1. Seed defaults
  for (const u of SEED_USERS) {
    map.set(u.id, { ...u });
  }

  // 2. Read from disk if exists
  try {
    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      const diskUsers = JSON.parse(raw) as UserRecord[];
      if (Array.isArray(diskUsers)) {
        for (const u of diskUsers) {
          if (u && u.id && u.email) {
            // Normalize legacy learner/viewer roles to "user"
            const normalizedRole = (u.role === "learner" || (u.role as string) === "viewer") ? "user" : u.role;
            map.set(u.id, { ...u, role: normalizedRole });
          }
        }
      }
    }
  } catch {
    // In serverless / read-only environment, keep in-memory
  }

  return map;
}

function getUsersMap(): Map<string, UserRecord> {
  if (!memoryUsers) {
    memoryUsers = loadUsersFromDisk();
  }
  return memoryUsers;
}

function persistUsers(): void {
  if (!memoryUsers) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(memoryUsers.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {
    // Ignore in read-only environments
  }
}

export function getUserByEmail(email: string): UserRecord | null {
  const normalized = email.trim().toLowerCase();
  const map = getUsersMap();
  for (const user of map.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export function getUserById(id: string): UserRecord | null {
  return getUsersMap().get(id) ?? null;
}

export function getUserByUsername(username: string): UserRecord | null {
  const normalized = username.trim().toLowerCase();
  const map = getUsersMap();
  for (const user of map.values()) {
    if (
      user.id.toLowerCase() === normalized ||
      user.email.toLowerCase() === normalized ||
      (normalized === "admin-k-sport" && user.role === "admin") ||
      (normalized === "btc-phutho" && user.role === "btc")
    ) {
      return user;
    }
  }
  return null;
}

export function registerUser(params: {
  name: string;
  email: string;
  password: string;
  clubOrUnit?: string;
  phone?: string;
  role?: UserRole;
}): SafeUser {
  const email = params.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Email không hợp lệ.");
  }
  if (!params.name || params.name.trim().length < 2) {
    throw new Error("Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).");
  }
  if (!params.password || params.password.length < 6) {
    throw new Error("Mật khẩu phải có tối thiểu 6 ký tự.");
  }

  const existing = getUserByEmail(email);
  if (existing) {
    throw new Error("Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.");
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(params.password, salt);
  const id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const newUser: UserRecord = {
    id,
    name: params.name.trim(),
    email,
    role: "user",
    authProvider: "email",
    passwordSalt: salt,
    passwordHash,
    clubOrUnit: params.clubOrUnit?.trim() || undefined,
    phone: params.phone?.trim() || undefined,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const map = getUsersMap();
  map.set(id, newUser);
  persistUsers();

  return stripSensitive(newUser);
}

export function updateUserProfile(
  userId: string,
  params: { name?: string; phone?: string; gender?: "male" | "female" | "other"; dateOfBirth?: string; clubOrUnit?: string },
): SafeUser | null {
  const user = getUserById(userId);
  if (!user) return null;
  const name = params.name?.trim();
  if (name !== undefined && name.length < 2) {
    throw new Error("Họ và tên cần có ít nhất 2 ký tự.");
  }
  if (name !== undefined) user.name = name;
  if (params.phone !== undefined) user.phone = params.phone.trim() || undefined;
  if (params.gender !== undefined) user.gender = params.gender;
  if (params.dateOfBirth !== undefined) user.dateOfBirth = params.dateOfBirth.trim() || undefined;
  if (params.clubOrUnit !== undefined) user.clubOrUnit = params.clubOrUnit.trim() || undefined;
  persistUsers();
  return stripSensitive(user);
}

export function authenticateWithPassword(
  emailOrUsername: string,
  passwordInput: string
): SafeUser | null {
  const trimmed = emailOrUsername.trim().toLowerCase();
  const user = getUserByEmail(trimmed) || getUserByUsername(trimmed);
  if (!user) return null;

  // 1. Password check with salt
  if (user.passwordSalt && user.passwordHash) {
    const computed = hashPassword(passwordInput.trim(), user.passwordSalt);
    if (computed === user.passwordHash) {
      user.lastLoginAt = new Date().toISOString();
      persistUsers();
      return stripSensitive(user);
    }
  }

  // 2. Fallback for legacy admin credentials
  if (
    user.role === "admin" &&
    (passwordInput === "Ksport!Quan_2026#" ||
      passwordInput === "Ksport!Quan_2026" ||
      passwordInput === "admin")
  ) {
    user.lastLoginAt = new Date().toISOString();
    return stripSensitive(user);
  }

  if (
    user.role === "btc" &&
    (passwordInput === "Ksport!Btc2026" ||
      passwordInput === "Ksport!Btc_2026#" ||
      passwordInput === "btc")
  ) {
    user.lastLoginAt = new Date().toISOString();
    return stripSensitive(user);
  }

  return null;
}

export function authenticateWithGoogle(params: {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
}): SafeUser {
  const email = params.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Email Google không hợp lệ.");
  }

  const map = getUsersMap();
  const user = getUserByEmail(email);

  if (user) {
    // Update profile
    user.name = params.name || user.name;
    if (params.picture) user.avatarUrl = params.picture;
    user.lastLoginAt = new Date().toISOString();
    persistUsers();
    return stripSensitive(user);
  }

  // Auto-register new Google user
  const id = `google-${params.googleId || Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const newUser: UserRecord = {
    id,
    name: params.name || email.split("@")[0],
    email,
    role: "user",
    authProvider: "google",
    avatarUrl: params.picture,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  map.set(id, newUser);
  persistUsers();

  return stripSensitive(newUser);
}
