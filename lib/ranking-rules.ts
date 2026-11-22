export type TournamentTier = "national" | "regional" | "club";

export const WKF_BASE_POINTS = {
  gold: 100,
  silver: 70,
  bronze: 50,
} as const;

export const TOURNAMENT_TIER_META: Record<
  TournamentTier,
  { label: string; shortLabel: string; multiplier: number }
> = {
  national: {
    label: "Quốc gia / Quốc tế (× 2.0)",
    shortLabel: "Quốc gia / Quốc tế",
    multiplier: 2.0,
  },
  regional: {
    label: "Tỉnh / Khu vực / Cúp CLB mạnh (× 1.5)",
    shortLabel: "Tỉnh / Khu vực",
    multiplier: 1.5,
  },
  club: {
    label: "CLB / Sinh viên / Mở rộng (× 1.0)",
    shortLabel: "CLB / Mở rộng",
    multiplier: 1.0,
  },
};

/**
 * Auto-suggest tournament tier from its Vietnamese title.
 * Admin can override this manually in /admin/events before publishing rankings.
 */
export function suggestTournamentTier(name: string): TournamentTier {
  const normalized = String(name || "").trim();
  if (!normalized) return "club";

  if (
    /quốc\s*gia|quốc\s*tế|toàn\s*quốc|sea\s*games|wkf|châu\s*á|thế\s*giới|quoc\s*gia|quoc\s*te|toan\s*quoc/i.test(
      normalized,
    )
  ) {
    return "national";
  }

  if (
    /tỉnh|thành\s*phố|\btp\.?\s|đại\s*hội\s*tdtt|khu\s*vực|miền\s*(bắc|trung|nam)|cúp\s*(các\s*)?clb\s*mạnh|tinh\b|dai\s*hoi/i.test(
      normalized,
    )
  ) {
    return "regional";
  }

  return "club";
}

export function calculateWkfPoints(input: {
  gold?: number;
  silver?: number;
  bronze?: number;
  tier: TournamentTier;
}): number {
  const mult = TOURNAMENT_TIER_META[input.tier].multiplier;
  const raw =
    (input.gold ?? 0) * WKF_BASE_POINTS.gold +
    (input.silver ?? 0) * WKF_BASE_POINTS.silver +
    (input.bronze ?? 0) * WKF_BASE_POINTS.bronze;
  return Math.round(raw * mult);
}

