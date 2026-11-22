export type DeviceKind = "mobile" | "desktop" | "tablet";

export type SiteAnalyticsSnapshot = {
  pageviews: number;
  uniqueVisitors: number;
  devices: Record<DeviceKind, number>;
  topPages: { path: string; views: number }[];
  startedAt: string;
};

type AnalyticsState = {
  pageviews: number;
  sessions: Set<string>;
  devices: Record<DeviceKind, number>;
  pageCounts: Map<string, number>;
  startedAt: string;
};

const globalForAnalytics = globalThis as typeof globalThis & {
  __ksport_site_analytics?: AnalyticsState;
};

function getState(): AnalyticsState {
  if (!globalForAnalytics.__ksport_site_analytics) {
    globalForAnalytics.__ksport_site_analytics = {
      pageviews: 0,
      sessions: new Set<string>(),
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      pageCounts: new Map<string, number>(),
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

  state.pageviews += 1;
  state.pageCounts.set(cleanPath, (state.pageCounts.get(cleanPath) || 0) + 1);

  if (input.sessionId && !state.sessions.has(input.sessionId)) {
    // Cap unique session set size to avoid unbounded memory growth
    if (state.sessions.size >= 50_000) state.sessions.clear();
    state.sessions.add(input.sessionId);
    const kind = detectDeviceKind(input.userAgent);
    state.devices[kind] += 1;
  }
}

export function getSiteAnalyticsSnapshot(): SiteAnalyticsSnapshot {
  const state = getState();
  const topPages = [...state.pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, views]) => ({ path, views }));

  return {
    pageviews: state.pageviews,
    uniqueVisitors: state.sessions.size,
    devices: { ...state.devices },
    topPages,
    startedAt: state.startedAt,
  };
}

