import {
  mockAthletes,
  mockBanners,
  mockClubs,
  mockEvents,
  mockMatches,
  mockNews,
  mockRanking,
} from "./mock-data";

type NextFetchRequestConfig = { revalidate?: number | false; tags?: string[]; internal?: boolean };

export type EventStatus = "Đang diễn ra" | "Sắp diễn ra" | "Đã kết thúc";

export type TournamentEvent = { slug: string; name: string; discipline: string; location: string; date: string; endDate: string; status: EventStatus; categories: string[]; description?: string; image?: string };
export type Match = { id: string; time: string; date: string; tatami: string; category: string; red: string; blue: string; redScore?: number; blueScore?: number; state: "Sắp diễn ra" | "Đang thi đấu" | "Đã kết thúc"; eventSlug?: string; eventName?: string };
export type Athlete = { id: string; athleteCode?: string; name: string; clubId?: string; club: string; eventId?: string; eventSlug?: string; category: string; country?: string; totalMatches?: number; wins?: number; winRate?: number | null; publicResult?: string; image?: string; photoUrl?: string };
export type AthleteDirectoryEntry = Athlete & { categories: string[]; sourceIds: string[] };
export type Club = { id: string; name: string; region: string; athleteCount?: number };
export type RankingEntry = { rank: number; athleteId: string; name: string; club: string; category: string; points: number; rankChange?: number; season?: string; eventSlug: string; eventName: string; eventDate?: string; medals?: { gold?: number; silver?: number; bronze?: number } };
export type NewsItem = { slug: string; title: string; category: string; publishedAt: string; summary: string; image: string; body?: string[] };
export type PublicBanner = { id: string; eyebrow: string; title: string; description: string; image: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string; position: number };

export type MatchDisplayState = Match["state"] | "Chờ cập nhật kết quả";

type CollectionPayload<T> = T[] | { items: T[] };
const apiBaseUrl = process.env.KSPORT_PUBLIC_API_URL?.replace(/\/$/, "");
const apiToken = process.env.KSPORT_PUBLIC_API_TOKEN;
// Use a responsive timeout with fallback to prevent UI hanging when the API is cold or offline.
const requestTimeoutMs = 3_500;
const countryNames: Record<string, string> = {
  VN: "Việt Nam",
  JP: "Nhật Bản",
  KR: "Hàn Quốc",
  CN: "Trung Quốc",
  TH: "Thái Lan",
  ID: "Indonesia",
  MY: "Malaysia",
  PH: "Philippines",
  SG: "Singapore",
  LA: "Lào",
  KH: "Campuchia",
};

function requestHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  };
}

function toAbsolutePublicUrl(value?: string) {
  if (!value) return value;
  const trimmed = value.trim();
  // Do not rewrite local static assets or absolute external URLs
  if (trimmed.startsWith("/images/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (!apiBaseUrl) return trimmed;
  try {
    return new URL(trimmed, `${new URL(apiBaseUrl).origin}/`).toString();
  } catch {
    return trimmed;
  }
}

function normalizeAthlete(athlete: Athlete): Athlete {
  const photoUrl = toAbsolutePublicUrl(athlete.photoUrl);
  const country = athlete.country?.trim().toUpperCase();
  return {
    ...athlete,
    ...(country ? { country: countryNames[country] || athlete.country } : {}),
    ...(photoUrl ? { photoUrl, image: photoUrl } : {}),
  };
}

/**
 * A tournament can return one registration record for every discipline an
 * athlete enters. The public directory must present those records as one
 * person, but only when the API provides the same stable athlete, club and
 * tournament identity.
 *
 * Never fall back to name matching here: people at the same club can share a
 * name, and merging them would expose the wrong public record.
 */
export function groupAthletesForDirectory(athletes: Athlete[]): AthleteDirectoryEntry[] {
  const groups = new Map<string, AthleteDirectoryEntry>();

  for (const athlete of athletes) {
    const athleteCode = athlete.athleteCode?.trim().toLocaleLowerCase("vi");
    const clubId = athlete.clubId?.trim().toLocaleLowerCase("vi");
    const eventId = athlete.eventId?.trim().toLocaleLowerCase("vi") || athlete.eventSlug?.trim().toLocaleLowerCase("vi");
    const groupKey = athleteCode && clubId && eventId
      ? `athlete:${athleteCode}\u001fclub:${clubId}\u001fevent:${eventId}`
      : `record:${athlete.id}`;
    const current = groups.get(groupKey);

    if (current) {
      current.sourceIds.push(athlete.id);
      if (!current.categories.includes(athlete.category)) current.categories.push(athlete.category);
      current.totalMatches = (current.totalMatches ?? 0) + (athlete.totalMatches ?? 0);
      current.wins = (current.wins ?? 0) + (athlete.wins ?? 0);
      current.winRate = current.totalMatches > 0 ? Math.round((current.wins / current.totalMatches) * 1000) / 10 : null;
      continue;
    }

    groups.set(groupKey, { ...athlete, categories: [athlete.category], sourceIds: [athlete.id] });
  }

  return [...groups.values()];
}

const abbreviatedWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const abbreviatedMonths: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function normalizePublishedAt(value: string) {
  const raw = value.trim();
  const match = raw.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/);
  if (!match) return value;

  const [, weekday, monthName, dayText] = match;
  const now = new Date();
  const day = Number(dayText);
  const candidates = [now.getUTCFullYear() - 1, now.getUTCFullYear(), now.getUTCFullYear() + 1]
    .map((year) => new Date(Date.UTC(year, abbreviatedMonths[monthName], day)))
    .filter((candidate) => abbreviatedWeekdays[candidate.getUTCDay()] === weekday);
  const closest = candidates.sort((left, right) => Math.abs(left.getTime() - now.getTime()) - Math.abs(right.getTime() - now.getTime()))[0];

  // The current public API omits the year (for example, "Thu Oct 29").
  // Retain a full ISO date for rendering until that API serialization is corrected.
  return closest?.toISOString() ?? value;
}

function normalizeNewsItem(item: NewsItem): NewsItem {
  return { ...item, publishedAt: normalizePublishedAt(item.publishedAt), image: toAbsolutePublicUrl(item.image) || item.image };
}

const vietnamDateKey = (value = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(value);

export function getEventDisplayStatus(
  event: Pick<TournamentEvent, "date" | "endDate" | "status">,
  now = new Date(),
): EventStatus {
  if (event.status === "Đã kết thúc") return "Đã kết thúc";
  const today = vietnamDateKey(now);
  const startKey = event.date?.slice(0, 10) || "";
  const endKey = (event.endDate || event.date)?.slice(0, 10) || startKey;
  if (endKey && endKey < today) return "Đã kết thúc";
  if (startKey && endKey && startKey <= today && today <= endKey) return "Đang diễn ra";
  return event.status;
}

function normalizeEvent(event: TournamentEvent, now = new Date()): TournamentEvent {
  const image = toAbsolutePublicUrl(event.image);
  return {
    ...event,
    status: getEventDisplayStatus(event, now),
    ...(image ? { image } : {}),
  };
}

type PublicDataCacheState = {
  collections: Map<string, { items: unknown[]; expiresAt: number }>;
  records: Map<string, { item: unknown; expiresAt: number }>;
  inFlight: Map<string, Promise<unknown>>;
  preferredBaseUrl: { url: string; expiresAt: number } | null;
  networkDownUntil: number;
  diskSeeded: boolean;
  lastWarnAt: number;
};

const globalForPublicData = globalThis as typeof globalThis & {
  __ksportPublicDataCache?: PublicDataCacheState;
};

function getCacheState(): PublicDataCacheState {
  if (!globalForPublicData.__ksportPublicDataCache) {
    globalForPublicData.__ksportPublicDataCache = {
      collections: new Map(),
      records: new Map(),
      inFlight: new Map(),
      preferredBaseUrl: null,
      networkDownUntil: 0,
      diskSeeded: false,
      lastWarnAt: 0,
    };
  }
  if (typeof globalForPublicData.__ksportPublicDataCache.networkDownUntil !== "number") {
    globalForPublicData.__ksportPublicDataCache.networkDownUntil = 0;
  }
  return globalForPublicData.__ksportPublicDataCache;
}

const knownPublicApiUrls = [
  "https://admin.luuquancoder.id.vn/api/public",
  "https://api.k-sport.net/api/public",
];

function getCandidateBaseUrls(cache: PublicDataCacheState): string[] {
  if (!apiBaseUrl) return [];
  const urls = new Set<string>();
  if (cache.preferredBaseUrl && cache.preferredBaseUrl.expiresAt > Date.now()) {
    urls.add(cache.preferredBaseUrl.url);
  }
  urls.add(apiBaseUrl);
  if (knownPublicApiUrls.includes(apiBaseUrl)) {
    for (const candidate of knownPublicApiUrls) urls.add(candidate);
  }
  return [...urls];
}

const collectionRoots = new Set(["/events", "/schedule", "/results", "/athletes", "/clubs", "/ranking", "/news", "/banners"]);

function seedFromNextFetchCache(cache: PublicDataCacheState) {
  if (cache.diskSeeded || typeof window !== "undefined") return;
  cache.diskSeeded = true;
  try {
    const nodeRequire = eval("require") as NodeRequire;
    const fs = nodeRequire("node:fs") as typeof import("node:fs");
    const path = nodeRequire("node:path") as typeof import("node:path");
    const cacheDir = path.join(process.cwd(), ".next", "cache", "fetch-cache");
    if (!fs.existsSync(cacheDir)) return;
    const files = fs.readdirSync(cacheDir)
      .map((name) => {
        const fullPath = path.join(cacheDir, name);
        try {
          const stat = fs.statSync(fullPath);
          return stat.isFile() ? { fullPath, mtimeMs: stat.mtimeMs } : null;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is { fullPath: string; mtimeMs: number } => Boolean(entry))
      .sort((left, right) => right.mtimeMs - left.mtimeMs);

    for (const file of files) {
      try {
        const raw = JSON.parse(fs.readFileSync(file.fullPath, "utf8")) as {
          data?: { url?: string; status?: number; body?: string };
        };
        const url = raw.data?.url;
        const body = raw.data?.body;
        if (raw.data?.status !== 200 || !url || !body) continue;
        const marker = "/api/public";
        const markerIndex = url.indexOf(marker);
        if (markerIndex === -1) continue;
        const apiPath = url.slice(markerIndex + marker.length) || "/";
        const isPreferredOrigin = apiBaseUrl ? url.startsWith(apiBaseUrl) : false;
        const parsed = JSON.parse(Buffer.from(body, "base64").toString("utf8")) as unknown;

        if (collectionRoots.has(apiPath)) {
          const payload = parsed as CollectionPayload<unknown>;
          const items = Array.isArray(payload) ? payload : payload?.items;
          if (!Array.isArray(items)) continue;
          const existing = cache.collections.get(apiPath);
          if (!existing || (isPreferredOrigin && existing.items.length < items.length)) {
            cache.collections.set(apiPath, { items, expiresAt: Date.now() + 60_000 });
          }
        } else if (!cache.records.has(apiPath) || isPreferredOrigin) {
          cache.records.set(apiPath, { item: parsed, expiresAt: Date.now() + 60_000 });
        }
      } catch {
        // Ignore malformed cache entries.
      }
    }
  } catch {
    // Ignore filesystem errors in restricted runtimes.
  }
}

function logApiWarning(cache: PublicDataCacheState, message: string) {
  const now = Date.now();
  if (now - cache.lastWarnAt > 15_000) {
    cache.lastWarnAt = now;
    console.warn(message);
  }
}

async function fetchCollectionFromNetwork<T>(
  cache: PublicDataCacheState,
  apiPath: string,
  revalidate: number,
  allowMissing: boolean,
): Promise<T[] | null> {
  if (cache.networkDownUntil > Date.now()) return null;
  const inFlightKey = `collection:${apiPath}`;
  const active = cache.inFlight.get(inFlightKey);
  if (active) return (await active) as T[] | null;

  const task = (async (): Promise<T[] | null> => {
    const candidates = getCandidateBaseUrls(cache);
    const hasFallbackCache = cache.collections.has(apiPath);
    const timeoutMs = hasFallbackCache ? 2_000 : requestTimeoutMs;

    for (const baseUrl of candidates) {
      try {
        const response = await fetch(`${baseUrl}${apiPath}`, {
          headers: requestHeaders(),
          next: { revalidate, internal: true } as NextFetchRequestConfig,
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (allowMissing && response.status === 404) {
          cache.networkDownUntil = 0;
          cache.collections.set(apiPath, { items: [], expiresAt: Date.now() + revalidate * 1000 });
          return [];
        }
        if (!response.ok) throw new Error(`K-SPORT public API returned ${response.status} for ${apiPath}`);
        const payload = (await response.json()) as CollectionPayload<T>;
        const items = Array.isArray(payload) ? payload : payload?.items;
        if (!Array.isArray(items)) throw new Error(`K-SPORT public API returned an invalid collection for ${apiPath}`);
        cache.networkDownUntil = 0;
        cache.preferredBaseUrl = { url: baseUrl, expiresAt: Date.now() + 300_000 };
        cache.collections.set(apiPath, { items, expiresAt: Date.now() + revalidate * 1000 });
        return items;
      } catch {
        // Try next candidate URL.
      }
    }

    cache.networkDownUntil = Date.now() + 60_000;
    return null;
  })();

  cache.inFlight.set(inFlightKey, task);
  try {
    return await task;
  } finally {
    cache.inFlight.delete(inFlightKey);
  }
}

async function getCollection<T>(apiPath: string, revalidate = 60, allowMissing = false): Promise<T[]> {
  if (!apiBaseUrl) return [];
  const cache = getCacheState();
  seedFromNextFetchCache(cache);
  const cached = cache.collections.get(apiPath);

  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.items as T[];
    }
    // Stale-while-revalidate: serve cached data immediately and refresh in background.
    cached.expiresAt = Date.now() + Math.max(revalidate, 30) * 1000;
    void fetchCollectionFromNetwork<T>(cache, apiPath, revalidate, allowMissing);
    return cached.items as T[];
  }

  const fresh = await fetchCollectionFromNetwork<T>(cache, apiPath, revalidate, allowMissing);
  if (fresh) return fresh;
  logApiWarning(cache, `[K-SPORT API] Không thể kết nối ${apiPath}.`);
  return [];
}

async function fetchRecordFromNetwork<T>(cache: PublicDataCacheState, apiPath: string): Promise<T | null> {
  if (cache.networkDownUntil > Date.now()) return null;
  const inFlightKey = `record:${apiPath}`;
  const active = cache.inFlight.get(inFlightKey);
  if (active) return (await active) as T | null;

  const task = (async (): Promise<T | null> => {
    const candidates = getCandidateBaseUrls(cache);
    const hasFallbackCache = cache.records.has(apiPath);
    const timeoutMs = hasFallbackCache ? 2_000 : requestTimeoutMs;

    for (const baseUrl of candidates) {
      try {
        const response = await fetch(`${baseUrl}${apiPath}`, {
          headers: requestHeaders(),
          next: { revalidate: 60, internal: true } as NextFetchRequestConfig,
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`K-SPORT public API returned ${response.status} for ${apiPath}`);
        const item = (await response.json()) as T;
        cache.networkDownUntil = 0;
        cache.preferredBaseUrl = { url: baseUrl, expiresAt: Date.now() + 300_000 };
        cache.records.set(apiPath, { item, expiresAt: Date.now() + 60_000 });
        return item;
      } catch {
        // Try next candidate URL.
      }
    }

    cache.networkDownUntil = Date.now() + 60_000;
    return null;
  })();

  cache.inFlight.set(inFlightKey, task);
  try {
    return await task;
  } finally {
    cache.inFlight.delete(inFlightKey);
  }
}

async function getRecord<T>(apiPath: string): Promise<T | null> {
  if (!apiBaseUrl) return null;
  const cache = getCacheState();
  seedFromNextFetchCache(cache);
  const cached = cache.records.get(apiPath);

  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.item as T;
    }
    cached.expiresAt = Date.now() + 60_000;
    void fetchRecordFromNetwork<T>(cache, apiPath);
    return cached.item as T;
  }

  const fresh = await fetchRecordFromNetwork<T>(cache, apiPath);
  if (fresh) return fresh;
  logApiWarning(cache, `[K-SPORT API] Không thể tải bản ghi ${apiPath}.`);
  return null;
}

export const getEvents = async () => {
  const list = (await getCollection<TournamentEvent>("/events")).map((event) => normalizeEvent(event));
  return list.length > 0 ? list : mockEvents.map((event) => normalizeEvent(event));
};

export const getEvent = async (slug: string) => {
  const events = await getEvents();
  const matched = events.find((event) => event.slug === slug);
  if (matched) return matched;
  const event = await getRecord<TournamentEvent>(`/events/${encodeURIComponent(slug)}`);
  if (event) return normalizeEvent(event);
  const fallback = mockEvents.find((entry) => entry.slug === slug);
  return fallback ? normalizeEvent(fallback) : null;
};

export const getSchedule = async () => {
  const list = await getCollection<Match>("/schedule", 15);
  return list.length > 0 ? list : mockMatches;
};

export const getResults = async () => {
  const list = await getCollection<Match>("/results", 15);
  return list.length > 0 ? list : mockMatches.filter((match) => match.state === "Đã kết thúc");
};

export const getAthletes = async () => {
  const list = (await getCollection<Athlete>("/athletes", 15)).map(normalizeAthlete);
  return list.length > 0 ? list : mockAthletes.map(normalizeAthlete);
};

export const getAthlete = async (idOrCode: string) => {
  const query = decodeURIComponent(idOrCode).trim();
  const list = await getAthletes();
  // Support scanning both internal ID and athleteCode (case-insensitive)
  const matchedFromList = list.find(
    (entry) =>
      entry.id.toLocaleLowerCase("vi") === query.toLocaleLowerCase("vi") ||
      (entry.athleteCode && entry.athleteCode.localeCompare(query, undefined, { sensitivity: "accent" }) === 0)
  );
  if (matchedFromList) return matchedFromList;

  const athlete = await getRecord<Athlete>(`/athletes/${encodeURIComponent(query)}`);
  if (athlete) return normalizeAthlete(athlete);

  const fallback = mockAthletes.find(
    (entry) =>
      entry.id.toLocaleLowerCase("vi") === query.toLocaleLowerCase("vi") ||
      (entry.athleteCode && entry.athleteCode.localeCompare(query, undefined, { sensitivity: "accent" }) === 0)
  );
  return fallback ? normalizeAthlete(fallback) : null;
};

export const getClubs = async () => {
  const list = await getCollection<Club>("/clubs");
  return list.length > 0 ? list : mockClubs;
};

export const getClub = async (id: string) => {
  const clubs = await getClubs();
  const matched = clubs.find((club) => club.id === id);
  if (matched) return matched;
  const remote = await getRecord<Club>(`/clubs/${encodeURIComponent(id)}`);
  return remote || mockClubs.find((club) => club.id === id) || null;
};

export const getRanking = async () => {
  const list = await getCollection<RankingEntry>("/ranking", 15);
  return list.length > 0 ? list : mockRanking;
};

export const getNews = async () => {
  const list = (await getCollection<NewsItem>("/news", 300)).map(normalizeNewsItem);
  return list.length > 0 ? list : mockNews.map(normalizeNewsItem);
};

// Banner content was added after the initial public API rollout.
export const getBanners = async () => {
  const list = await getCollection<PublicBanner>("/banners", 60, true);
  return list.length > 0 ? list : mockBanners;
};

export const getNewsItem = async (slug: string) => {
  const item = await getRecord<NewsItem>(`/news/${encodeURIComponent(slug)}`);
  if (item) return normalizeNewsItem(item);
  const list = await getNews();
  return list.find((entry) => entry.slug === slug) ?? null;
};

export function matchTimestamp(match: Match) {
  const time = /^\d{2}:\d{2}$/.test(match.time) ? match.time : "00:00";
  const timestamp = Date.parse(`${match.date}T${time}:00+07:00`);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function sortMatches(matches: Match[]) {
  return [...matches].sort((left, right) => matchTimestamp(left) - matchTimestamp(right));
}

export function isCurrentOrUpcomingMatch(match: Match, now = new Date()) {
  return match.state !== "Đã kết thúc" && match.date >= vietnamDateKey(now);
}

export function getMatchDisplayState(match: Match, now = new Date()): MatchDisplayState {
  if (match.state === "Đã kết thúc") return match.state;
  if (match.date < vietnamDateKey(now)) return "Chờ cập nhật kết quả";
  return match.state;
}

export function competitionType(category: string) {
  if (/^kata\b/i.test(category)) return "Kata";
  if (/^kumite\b/i.test(category)) return "Kumite";
  return "Khác";
}

/** Keep the public API field name at the boundary and localize its UI label. */
export function getMatDisplayName(value?: string) {
  const raw = value?.trim();
  const identifier = raw?.replace(/^(tatami|thảm)\s*/i, "").trim();
  return identifier ? `Thảm ${identifier}` : "Thảm";
}

/** Phân định mã màu đặc thù theo từng thảm đấu giúp phân biệt tức thì */
export function getTatamiColorClass(value?: string) {
  const num = parseInt(value?.replace(/\D/g, "") || "0", 10);
  switch (num) {
    case 1:
      return "tatami-1";
    case 2:
      return "tatami-2";
    case 3:
      return "tatami-3";
    case 4:
      return "tatami-4";
    case 5:
      return "tatami-5";
    case 6:
      return "tatami-6";
    default:
      return "tatami-default";
  }
}

export function sortEvents(events: TournamentEvent[]) {
  const order: Record<EventStatus, number> = { "Đang diễn ra": 0, "Sắp diễn ra": 1, "Đã kết thúc": 2 };
  return [...events].sort((left, right) => {
    const statusDiff = order[left.status] - order[right.status];
    if (statusDiff !== 0) return statusDiff;
    const leftHasLocation = left.location?.trim() ? 0 : 1;
    const rightHasLocation = right.location?.trim() ? 0 : 1;
    if (leftHasLocation !== rightHasLocation) return leftHasLocation - rightHasLocation;
    return left.status === "Đã kết thúc"
      ? (right.endDate || right.date).localeCompare(left.endDate || left.date)
      : left.date.localeCompare(right.date);
  });
}

export const featureNotes = [
  ["Thiết lập nội dung", "Quản lý Kata, Kumite, nhóm tuổi và hạng cân trong một cấu trúc thống nhất."],
  ["Điều phối trận đấu", "Phân bổ thảm, thứ tự gọi trận và trạng thái vận hành theo thời gian thực."],
  ["Công bố kết quả", "Đồng bộ kết quả từ bàn điều hành đến cổng thông tin công khai."],
] as const;
