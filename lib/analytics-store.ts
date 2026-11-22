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
  topPages: { path: string; views: number }[];
  monthlyByYear: Record<number, MonthlyTrafficPoint[]>;
  availableYears: number[];
  year: number;
  startedAt: string;
};

type YearBucket = {
  monthlyViews: number[];
  monthlySessions: Set<string>[];
};

type AnalyticsState = {
  pageviews: number;
  sessions: Set<string>;
  devices: Record<DeviceKind, number>;
  pageCounts: Map<string, number>;
  byYear: Map<number, YearBucket>;
  startedAt: string;
};

const globalForAnalytics = globalThis as typeof globalThis & {
  __ksport_site_analytics?: AnalyticsState;
};

function createYearBucket(): YearBucket {
  return {
    monthlyViews: Array.from({ length: 12 }, () => 0),
    monthlySessions: Array.from({ length: 12 }, () => new Set<string>()),
  };
}

function getCurrentVietnamYearMonth(): { year: number; monthIndex: number } {
  const vn = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  return { year: vn.getFullYear(), monthIndex: vn.getMonth() };
}

function getState(): AnalyticsState {
  if (!globalForAnalytics.__ksport_site_analytics || !globalForAnalytics.__ksport_site_analytics.byYear) {
    globalForAnalytics.__ksport_site_analytics = {
      pageviews: 0,
      sessions: new Set<string>(),
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      pageCounts: new Map<string, number>(),
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

export function recordSiteVisit(input: {
  path: string;
  sessionId: string;
  userAgent: string;
}) {
  const state = getState();
  const cleanPath = (input.path || "/").split("?")[0].slice(0, 120) || "/";
  if (cleanPath.startsWith("/admin") || cleanPath.startsWith("/api")) return;

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
      const kind = detectDeviceKind(input.userAgent);
      state.devices[kind] += 1;
    }
    const monthSet = bucket.monthlySessions[monthIndex];
    if (monthSet && !monthSet.has(input.sessionId)) {
      if (monthSet.size >= 50_000) monthSet.clear();
      monthSet.add(input.sessionId);
    }
  }
}

export function getSiteAnalyticsSnapshot(): SiteAnalyticsSnapshot {
  const state = getState();
  const { year: currentYear } = getCurrentVietnamYearMonth();

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

  return {
    pageviews: state.pageviews,
    uniqueVisitors: state.sessions.size,
    devices: { ...state.devices },
    topPages,
    monthlyByYear,
    availableYears,
    year: currentYear,
    startedAt: state.startedAt,
  };
}
