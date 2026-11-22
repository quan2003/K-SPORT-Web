export type DeviceKind = "mobile" | "desktop" | "tablet";

export type MonthlyTrafficPoint = {
  monthIndex: number; // 0-11
  label: string;
  views: number;
  users: number;
};

export type SiteAnalyticsSnapshot = {
  pageviews: number;
  uniqueVisitors: number;
  devices: Record<DeviceKind, number>;
  deviceDetails: { label: string; count: number }[];
  topPages: { path: string; views: number }[];
  monthlyByYear: Record<number, MonthlyTrafficPoint[]>;
  availableYears: number[];
  year: number;
  startedAt: string;
  persistent?: boolean;
};

type YearBucket = {
  monthlyViews: number[];
  monthlySessions: Set<string>[];
};

type AnalyticsState = {
  pageviews: number;
  sessions: Set<string>;
  devices: Record<DeviceKind, number>;
  deviceLabels: Map<string, number>;
  pageCounts: Map<string, number>;
  recentHits: Map<string, number>;
  byYear: Map<number, YearBucket>;
  startedAt: string;
};

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

const globalForAnalytics = globalThis as typeof globalThis & {
  __ksport_site_analytics?: AnalyticsState;
};

function createYearBucket(): YearBucket {
  return {
    monthlyViews: Array.from({ length: 12 }, () => 0),
    monthlySessions: Array.from({ length: 12 }, () => new Set<string>()),
  };
}

function getCurrentVietnamYearMonth(date = new Date()): { year: number; monthIndex: number } {
  const vn = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return { year: vn.getFullYear(), monthIndex: vn.getMonth() };
}

function getState(): AnalyticsState {
  if (!globalForAnalytics.__ksport_site_analytics || !globalForAnalytics.__ksport_site_analytics.byYear) {
    globalForAnalytics.__ksport_site_analytics = {
      pageviews: 0,
      sessions: new Set<string>(),
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      deviceLabels: new Map<string, number>(),
      pageCounts: new Map<string, number>(),
      recentHits: new Map<string, number>(),
      byYear: new Map<number, YearBucket>(),
      startedAt: new Date().toISOString(),
    };
  }
  return globalForAnalytics.__ksport_site_analytics;
}

export function detectDeviceKind(userAgent: string): DeviceKind {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

export function detectDeviceDetails(
  userAgent: string,
  platformHint = "",
): { kind: DeviceKind; label: string } {
  const ua = userAgent;
  const kind = detectDeviceKind(ua);

  let os = "Thiết bị khác";
  if (/iphone/i.test(ua)) os = "iPhone";
  else if (/ipad/i.test(ua)) os = "iPad";
  else if (/android/i.test(ua)) os = "Android";
  else if (/windows/i.test(ua) || /windows/i.test(platformHint)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua) || /mac/i.test(platformHint)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Trình duyệt";
  if (/zalo/i.test(ua)) browser = "Zalo";
  else if (/fban|fbav/i.test(ua)) browser = "Facebook";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/coc_coc_browser/i.test(ua)) browser = "Cốc Cốc";
  else if (/crios|chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/fxios|firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";

  return { kind, label: `${os} · ${browser}` };
}

function parseStoredDevice(raw: string): { kind: DeviceKind; label?: string } {
  const [rawKind, rawLabel] = String(raw || "desktop").split("|");
  const kind: DeviceKind =
    rawKind === "mobile" || rawKind === "tablet" ? rawKind : "desktop";
  return { kind, label: rawLabel?.trim() || undefined };
}

export async function recordSiteVisit(input: {
  path: string;
  sessionId: string;
  userAgent: string;
  platformHint?: string;
}) {
  const cleanPath = (input.path || "/").split("?")[0].slice(0, 120) || "/";
  if (cleanPath.startsWith("/admin") || cleanPath.startsWith("/api")) return;

  const state = getState();
  // Deduplicate rapid F5 refreshes on the same path within 20 seconds
  const hitKey = `${input.sessionId}:${cleanPath}`;
  const nowMs = Date.now();
  const lastHit = state.recentHits.get(hitKey) || 0;
  if (nowMs - lastHit < 20_000) return;
  if (state.recentHits.size >= 10_000) state.recentHits.clear();
  state.recentHits.set(hitKey, nowMs);

  const { kind, label } = detectDeviceDetails(input.userAgent, input.platformHint);
  const { year, monthIndex } = getCurrentVietnamYearMonth();

  let bucket = state.byYear.get(year);
  if (!bucket) {
    bucket = createYearBucket();
    state.byYear.set(year, bucket);
  }
  state.pageviews += 1;
  bucket.monthlyViews[monthIndex] = (bucket.monthlyViews[monthIndex] || 0) + 1;
  state.pageCounts.set(cleanPath, (state.pageCounts.get(cleanPath) || 0) + 1);
  if (input.sessionId) {
    if (!state.sessions.has(input.sessionId)) {
      if (state.sessions.size >= 50_000) state.sessions.clear();
      state.sessions.add(input.sessionId);
      state.devices[kind] += 1;
      state.deviceLabels.set(label, (state.deviceLabels.get(label) || 0) + 1);
    }
    const monthSet = bucket.monthlySessions[monthIndex];
    if (monthSet && !monthSet.has(input.sessionId)) {
      if (monthSet.size >= 50_000) monthSet.clear();
      monthSet.add(input.sessionId);
    }
  }

  try {
    const { url, key } = getSupabaseConfig();
    await fetch(`${url}/rest/v1/site_visits`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        path: cleanPath,
        session_id: input.sessionId || "anon",
        device: `${kind}|${label}`,
      }),
      signal: AbortSignal.timeout(3_000),
    });
  } catch {
    // Ignore if Supabase table is not created yet
  }
}

type SupabaseVisitRow = {
  path: string;
  session_id: string;
  device: string;
  created_at: string;
};

export async function getSiteAnalyticsSnapshot(): Promise<SiteAnalyticsSnapshot> {
  const { year: currentYear } = getCurrentVietnamYearMonth();

  try {
    const { url, key } = getSupabaseConfig();
    const res = await fetch(
      `${url}/rest/v1/site_visits?select=path,session_id,device,created_at&order=created_at.desc&limit=10000`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(4_000),
      },
    );

    if (res.ok) {
      const rows = (await res.json()) as SupabaseVisitRow[];
      const sessions = new Set<string>();
      const devices: Record<DeviceKind, number> = { mobile: 0, desktop: 0, tablet: 0 };
      const deviceLabels = new Map<string, number>();
      const pageCounts = new Map<string, number>();
      const byYear = new Map<number, YearBucket>();
      byYear.set(currentYear, createYearBucket());

      for (const r of rows) {
        const dt = r.created_at ? new Date(r.created_at) : new Date();
        const { year, monthIndex } = getCurrentVietnamYearMonth(
          Number.isNaN(dt.getTime()) ? new Date() : dt,
        );
        let bucket = byYear.get(year);
        if (!bucket) {
          bucket = createYearBucket();
          byYear.set(year, bucket);
        }

        bucket.monthlyViews[monthIndex] = (bucket.monthlyViews[monthIndex] || 0) + 1;
        const p = r.path || "/";
        pageCounts.set(p, (pageCounts.get(p) || 0) + 1);

        const sid = r.session_id || "";
        if (sid && sid !== "anon") {
          if (!sessions.has(sid)) {
            sessions.add(sid);
            const parsed = parseStoredDevice(r.device);
            devices[parsed.kind] += 1;
            const detailLabel =
              parsed.label ||
              (parsed.kind === "mobile"
                ? "Điện thoại"
                : parsed.kind === "tablet"
                  ? "Máy tính bảng"
                  : "Máy tính");
            deviceLabels.set(detailLabel, (deviceLabels.get(detailLabel) || 0) + 1);
          }
          bucket.monthlySessions[monthIndex]?.add(sid);
        }
      }

      const availableYears = [...byYear.keys()].sort((a, b) => b - a);
      const monthlyByYear: Record<number, MonthlyTrafficPoint[]> = {};
      for (const y of availableYears) {
        const b = byYear.get(y)!;
        monthlyByYear[y] = Array.from({ length: 12 }, (_, idx) => ({
          monthIndex: idx,
          label: `Thg ${idx + 1}`,
          views: b.monthlyViews[idx] || 0,
          users: b.monthlySessions[idx]?.size || 0,
        }));
      }

      const topPages = [...pageCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, views]) => ({ path, views }));

      const deviceDetails = [...deviceLabels.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, count]) => ({ label, count }));

      return {
        pageviews: rows.length,
        uniqueVisitors: sessions.size,
        devices,
        deviceDetails,
        topPages,
        monthlyByYear,
        availableYears,
        year: currentYear,
        startedAt: rows[rows.length - 1]?.created_at || new Date().toISOString(),
        persistent: true,
      };
    }
  } catch {
    // Fallback to in-memory snapshot below
  }

  const state = getState();
  if (!state.byYear.has(currentYear)) {
    state.byYear.set(currentYear, createYearBucket());
  }

  const availableYears = [...state.byYear.keys()].sort((a, b) => b - a);
  const monthlyByYear: Record<number, MonthlyTrafficPoint[]> = {};
  for (const y of availableYears) {
    const bucket = state.byYear.get(y)!;
    monthlyByYear[y] = Array.from({ length: 12 }, (_, idx) => ({
      monthIndex: idx,
      label: `Thg ${idx + 1}`,
      views: bucket.monthlyViews[idx] || 0,
      users: bucket.monthlySessions[idx]?.size || 0,
    }));
  }

  const topPages = [...state.pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));

  const deviceDetails = [...state.deviceLabels.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ label, count }));

  return {
    pageviews: state.pageviews,
    uniqueVisitors: state.sessions.size,
    devices: { ...state.devices },
    deviceDetails,
    topPages,
    monthlyByYear,
    availableYears,
    year: currentYear,
    startedAt: state.startedAt,
    persistent: false,
  };
}
