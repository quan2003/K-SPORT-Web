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

function supabaseHeaders(extra?: Record<string, string>): HeadersInit {
  const { key } = getSupabaseConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export type PublishedEventCategory = {
  id: string;
  name: string;
  gender: "male" | "female" | "any" | string;
  type: "kata" | "kumite" | string;
  isTeamEvent?: boolean;
  weightMin?: number | null;
  weightMax?: number | null;
};

export type PublishedTournamentConfig = {
  tournamentId: string;
  tournamentName: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  events: PublishedEventCategory[];
  publishedAt?: string;
  slug?: string;
};

export type RegistrationAthletePayload = {
  id: string;
  athleteId: string;
  clubId: string;
  name: string;
  gender: "male" | "female";
  birthDate: string;
  birthYear: number;
  eventId: string;
  eventName: string;
  weight?: string;
  isTeam?: boolean;
  teamCode?: string;
  club: string;
  photoStatus?: string;
  photoError?: string;
};

export type AthleteSubmissionRow = {
  id?: string | number;
  tournament_id: string;
  club_name: string;
  submitted_at: string;
  data: {
    updated_at_local?: string;
    last_updated?: string;
    tournamentId?: string;
    tournamentName?: string;
    coachName?: string;
    clubName?: string;
    clubId?: string;
    teamLeaderName?: string;
    additionalCoaches?: string[];
    exportTime?: string;
    athletes?: RegistrationAthletePayload[];
  };
};

type TournamentConfigRow = {
  id: string;
  slug: string;
  data: PublishedTournamentConfig;
  updated_at?: string;
};

export async function listPublishedTournaments(): Promise<PublishedTournamentConfig[]> {
  const { url } = getSupabaseConfig();
  try {
    const res = await fetch(
      `${url}/rest/v1/tournaments_config?select=id,slug,data,updated_at&order=updated_at.desc`,
      {
        headers: supabaseHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as TournamentConfigRow[];
    return rows
      .filter((r) => r?.data?.tournamentId && r?.data?.tournamentName)
      .map((r) => ({ ...r.data, slug: r.slug }));
  } catch {
    return [];
  }
}

export async function fetchPublishedTournamentBySlug(
  slugInput: string,
): Promise<PublishedTournamentConfig | null> {
  const { url } = getSupabaseConfig();
  const slug = decodeURIComponent(slugInput).trim();
  const candidates = [slug];
  const normalized = slug.replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  if (normalized !== slug) candidates.push(normalized);

  for (const candidate of candidates) {
    try {
      const res = await fetch(
        `${url}/rest/v1/tournaments_config?select=slug,data&slug=eq.${encodeURIComponent(candidate)}&limit=1`,
        {
          headers: supabaseHeaders(),
          cache: "no-store",
          signal: AbortSignal.timeout(5_000),
        },
      );
      if (!res.ok) continue;
      const rows = (await res.json()) as TournamentConfigRow[];
      if (rows[0]?.data) {
        return { ...rows[0].data, slug: rows[0].slug };
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function submitClubAthletes(input: {
  tournamentId: string;
  tournamentName: string;
  clubName: string;
  clubId: string;
  teamLeaderName: string;
  coachName: string;
  additionalCoaches: string[];
  athletes: RegistrationAthletePayload[];
}): Promise<{ ok: boolean; localTime?: string; error?: string }> {
  const { url } = getSupabaseConfig();
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const vnNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const localTime = `${pad(vnNow.getHours())}:${pad(vnNow.getMinutes())}:${pad(vnNow.getSeconds())} ${pad(vnNow.getDate())}/${pad(vnNow.getMonth() + 1)}`;

  const payload: AthleteSubmissionRow = {
    tournament_id: input.tournamentId,
    club_name: input.clubName.trim(),
    submitted_at: now.toISOString(),
    data: {
      updated_at_local: localTime,
      last_updated: now.toISOString(),
      tournamentId: input.tournamentId,
      tournamentName: input.tournamentName,
      coachName: input.coachName.trim() || "Chưa cập nhật",
      clubName: input.clubName.trim(),
      clubId: input.clubId,
      teamLeaderName: input.teamLeaderName.trim(),
      additionalCoaches: input.additionalCoaches,
      exportTime: now.toISOString(),
      athletes: input.athletes,
    },
  };

  try {
    const res = await fetch(
      `${url}/rest/v1/athlete_submissions?on_conflict=tournament_id,club_name`,
      {
        method: "POST",
        headers: supabaseHeaders({
          Prefer: "resolution=merge-duplicates,return=minimal",
        }),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        ok: false,
        error: errText || `Lỗi Supabase (${res.status})`,
      };
    }

    return { ok: true, localTime };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Không thể kết nối máy chủ đăng ký.",
    };
  }
}

export async function fetchTournamentSubmissions(
  tournamentId: string,
): Promise<AthleteSubmissionRow[]> {
  if (!tournamentId) return [];
  const { url } = getSupabaseConfig();
  try {
    const res = await fetch(
      `${url}/rest/v1/athlete_submissions?select=id,tournament_id,club_name,data,submitted_at&tournament_id=eq.${encodeURIComponent(tournamentId)}&order=submitted_at.desc`,
      {
        headers: supabaseHeaders(),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as AthleteSubmissionRow[];
    const seen = new Set<string>();
    const unique: AthleteSubmissionRow[] = [];
    for (const row of rows) {
      if (!seen.has(row.club_name)) {
        seen.add(row.club_name);
        unique.push(row);
      }
    }
    return unique;
  } catch {
    return [];
  }
}

