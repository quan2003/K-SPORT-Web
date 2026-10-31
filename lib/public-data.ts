import { mockAthletes, mockRanking } from "@/lib/mock-data";

export type EventStatus = "Đang diễn ra" | "Sắp diễn ra" | "Đã kết thúc";

export type TournamentEvent = { slug: string; name: string; discipline: string; location: string; date: string; endDate: string; status: EventStatus; categories: string[]; description?: string; image?: string };
export type Match = { id: string; time: string; date: string; tatami: string; category: string; red: string; blue: string; redScore?: number; blueScore?: number; state: "Sắp diễn ra" | "Đang thi đấu" | "Đã kết thúc"; eventSlug?: string; eventName?: string };
export type Athlete = { id: string; athleteCode?: string; name: string; clubId?: string; club: string; category: string; country?: string; totalMatches?: number; wins?: number; winRate?: number | null; publicResult?: string; image?: string; photoUrl?: string };
export type Club = { id: string; name: string; region: string; athleteCount?: number };
export type RankingEntry = { rank: number; athleteId: string; name: string; club: string; category: string; points: number; rankChange?: number; season?: string; eventSlug: string; eventName: string; eventDate?: string; medals?: { gold?: number; silver?: number; bronze?: number } };
export type NewsItem = { slug: string; title: string; category: string; publishedAt: string; summary: string; image: string; body?: string[] };
export type PublicBanner = { id: string; eyebrow: string; title: string; description: string; image: string; primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string; position: number };

export type MatchDisplayState = Match["state"] | "Chờ cập nhật kết quả";

type CollectionPayload<T> = T[] | { items: T[] };
const apiBaseUrl = process.env.KSPORT_PUBLIC_API_URL?.replace(/\/$/, "");
const apiToken = process.env.KSPORT_PUBLIC_API_TOKEN;
const requestTimeoutMs = 8_000;
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
  if (!value || !apiBaseUrl) return value;
  try {
    return new URL(value, `${new URL(apiBaseUrl).origin}/`).toString();
  } catch {
    return value;
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

async function getCollection<T>(path: string, revalidate = 60, allowMissing = false): Promise<T[]> {
  if (!apiBaseUrl) return [];
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: requestHeaders(),
      next: { revalidate },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    if (allowMissing && response.status === 404) return [];
    if (!response.ok) throw new Error(`K-SPORT public API returned ${response.status} for ${path}`);
    const payload = (await response.json()) as CollectionPayload<T>;
    const items = Array.isArray(payload) ? payload : payload?.items;
    if (!Array.isArray(items)) throw new Error(`K-SPORT public API returned an invalid collection for ${path}`);
    return items;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getRecord<T>(path: string): Promise<T | null> {
  if (!apiBaseUrl) return null;
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: requestHeaders(),
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`K-SPORT public API returned ${response.status} for ${path}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getEvents = () => getCollection<TournamentEvent>("/events");
export const getEvent = (slug: string) => getRecord<TournamentEvent>(`/events/${encodeURIComponent(slug)}`);
export const getSchedule = () => getCollection<Match>("/schedule", 15);
export const getResults = () => getCollection<Match>("/results", 15);
export const getAthletes = async () => mockAthletes.map(normalizeAthlete);
export const getAthlete = async (id: string) => {
  const mockAthlete = mockAthletes.find((item) => item.id === id);
  if (mockAthlete) return normalizeAthlete(mockAthlete);
  const athlete = await getRecord<Athlete>(`/athletes/${encodeURIComponent(id)}`);
  return athlete ? normalizeAthlete(athlete) : null;
};
export const getClubs = () => getCollection<Club>("/clubs");
export const getClub = (id: string) => getRecord<Club>(`/clubs/${encodeURIComponent(id)}`);
// Bảng xếp hạng đang ở giai đoạn dựng UI nên luôn dùng bộ dữ liệu minh họa.
// Thay bằng endpoint /ranking khi dữ liệu công khai đã được phê duyệt để xuất bản.
export const getRanking = async () => mockRanking;
export const getNews = async () => (await getCollection<NewsItem>("/news", 300)).map(normalizeNewsItem);
// Banner content was added after the initial public API rollout. Keep the
// public homepage operational until every VPS instance has been deployed.
export const getBanners = () => getCollection<PublicBanner>("/banners", 60, true);
export const getNewsItem = async (slug: string) => {
  const item = await getRecord<NewsItem>(`/news/${encodeURIComponent(slug)}`);
  return item ? normalizeNewsItem(item) : null;
};

const vietnamDateKey = (value = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(value);

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

/**
 * The public API still exposes this field as `tatami`. Keep that contract at
 * the boundary, while presenting its Vietnamese name consistently in the UI.
 * A bare "Tatami" value is an API placeholder, not usable mat information.
 */
export function getMatDisplayName(value?: string) {
  const raw = value?.trim();
  if (!raw || /^tatami$/i.test(raw)) return null;

  const identifier = raw.replace(/^(tatami|thảm)\s*/i, "").trim();
  return identifier ? `Thảm ${identifier}` : null;
}

export function sortEvents(events: TournamentEvent[]) {
  const order: Record<EventStatus, number> = { "Đang diễn ra": 0, "Sắp diễn ra": 1, "Đã kết thúc": 2 };
  return [...events].sort((left, right) => order[left.status] - order[right.status] || left.date.localeCompare(right.date));
}

export const featureNotes = [
  ["Thiết lập nội dung", "Quản lý Kata, Kumite, nhóm tuổi và hạng cân trong một cấu trúc thống nhất."],
  ["Điều phối trận đấu", "Phân bổ thảm, thứ tự gọi trận và trạng thái vận hành theo thời gian thực."],
  ["Công bố kết quả", "Đồng bộ kết quả từ bàn điều hành đến cổng thông tin công khai."],
] as const;
