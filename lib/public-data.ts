export type EventStatus = "Đang diễn ra" | "Sắp diễn ra" | "Đã kết thúc";

export type TournamentEvent = { slug: string; name: string; discipline: string; location: string; date: string; endDate: string; status: EventStatus; categories: string[]; description?: string; image?: string };
export type Match = { id: string; time: string; date: string; tatami: string; category: string; red: string; blue: string; redScore?: number; blueScore?: number; state: "Sắp diễn ra" | "Đang thi đấu" | "Đã kết thúc"; eventSlug?: string; eventName?: string };
export type Athlete = { id: string; name: string; clubId?: string; club: string; category: string; publicResult?: string; image?: string };
export type Club = { id: string; name: string; region: string; athleteCount?: number };
export type RankingEntry = { rank: number; athleteId: string; name: string; club: string; category: string; points: number; season?: string };
export type NewsItem = { slug: string; title: string; category: string; publishedAt: string; summary: string; image: string; body?: string[] };

export type MatchDisplayState = Match["state"] | "Chờ cập nhật kết quả";

type CollectionPayload<T> = T[] | { items: T[] };
const apiBaseUrl = process.env.KSPORT_PUBLIC_API_URL?.replace(/\/$/, "");
const apiToken = process.env.KSPORT_PUBLIC_API_TOKEN;
const requestTimeoutMs = 8_000;

function requestHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  };
}

async function getCollection<T>(path: string, revalidate = 60): Promise<T[]> {
  if (!apiBaseUrl) return [];
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: requestHeaders(),
      next: { revalidate },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
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
export const getAthletes = () => getCollection<Athlete>("/athletes");
export const getAthlete = (id: string) => getRecord<Athlete>(`/athletes/${encodeURIComponent(id)}`);
export const getClubs = () => getCollection<Club>("/clubs");
export const getClub = (id: string) => getRecord<Club>(`/clubs/${encodeURIComponent(id)}`);
export const getRanking = () => getCollection<RankingEntry>("/ranking", 60);
export const getNews = () => getCollection<NewsItem>("/news", 300);
export const getNewsItem = (slug: string) => getRecord<NewsItem>(`/news/${encodeURIComponent(slug)}`);

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

export function sortEvents(events: TournamentEvent[]) {
  const order: Record<EventStatus, number> = { "Đang diễn ra": 0, "Sắp diễn ra": 1, "Đã kết thúc": 2 };
  return [...events].sort((left, right) => order[left.status] - order[right.status] || left.date.localeCompare(right.date));
}

export const featureNotes = [
  ["Thiết lập nội dung", "Quản lý Kata, Kumite, nhóm tuổi và hạng cân trong một cấu trúc thống nhất."],
  ["Điều phối trận đấu", "Phân bổ tatami, thứ tự gọi trận và trạng thái vận hành theo thời gian thực."],
  ["Công bố kết quả", "Đồng bộ kết quả từ bàn điều hành đến cổng thông tin công khai."],
] as const;
