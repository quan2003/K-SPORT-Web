"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicSession } from "@/lib/auth";
import type { Athlete, Club, Match, RankingEntry, TournamentEvent } from "@/lib/public-data";
import { escapeHtml, printBtcHtmlReport } from "@/lib/btc-pdf-export";

type BtcTab =
  | "delegation"
  | "fees"
  | "by-club"
  | "by-category"
  | "overview"
  | "tatami"
  | "medals"
  | "sync";

interface AdminBtcDashboardProps {
  session: PublicSession | null;
  events: TournamentEvent[];
  schedule: Match[];
  results: Match[];
  athletes: Athlete[];
  clubs: Club[];
  ranking: RankingEntry[];
}

type FeeSettings = {
  individualFee: number;
  teamFee: number;
  enableSurcharge: boolean;
  surchargeFee: number;
};

const DEFAULT_FEE_SETTINGS: FeeSettings = {
  individualFee: 200_000,
  teamFee: 500_000,
  enableSurcharge: false,
  surchargeFee: 100_000,
};

function dedupeMatches(schedule: Match[], results: Match[]): Match[] {
  const map = new Map<string, Match>();
  for (const m of schedule) map.set(m.id, m);
  for (const m of results) map.set(m.id, m);
  return [...map.values()];
}

function normalizeTatamiLabel(value?: string) {
  const raw = value?.trim();
  if (!raw) return "Chưa phân thảm";
  const cleaned = raw.replace(/^(tatami|thảm)\s*/i, "").trim();
  return cleaned ? `Thảm ${cleaned}` : raw;
}

function normalizeText(value?: string): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getAthleteIdentityKey(a: Athlete): string {
  const club = normalizeText(a.club);
  if (a.athleteCode?.trim()) {
    return `${club}::code:${a.athleteCode.trim().toLowerCase()}`;
  }
  return `${club}::name:${normalizeText(a.name)}`;
}

function inferGenderFromCategory(category?: string): "male" | "female" | "unknown" {
  const cat = String(category || "").toLowerCase();
  if (/\bnữ\b/.test(cat) || /\bfemale\b/.test(cat)) return "female";
  if (/\bnam\b/.test(cat) || /\bmale\b/.test(cat)) return "male";
  return "unknown";
}

function isTeamCategory(category?: string): boolean {
  const cat = String(category || "").toLowerCase();
  return /đồng đội|hỗn hợp|team/.test(cat);
}

function readStoredFees(eventKey: string): FeeSettings {
  if (typeof window === "undefined") return DEFAULT_FEE_SETTINGS;
  try {
    const saved = localStorage.getItem(`ksport_btc_fees_${eventKey}`);
    return saved ? { ...DEFAULT_FEE_SETTINGS, ...(JSON.parse(saved) as Partial<FeeSettings>) } : DEFAULT_FEE_SETTINGS;
  } catch {
    return DEFAULT_FEE_SETTINGS;
  }
}

function readStoredPaid(eventKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(`ksport_btc_paid_${eventKey}`);
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount || 0));
}

export function AdminBtcDashboard({
  session,
  events,
  schedule,
  results,
  athletes,
  clubs,
  ranking,
}: AdminBtcDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BtcTab>("delegation");
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>(events[0]?.slug || "");
  const [selectedTatami, setSelectedTatami] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Selections for Club / Category views
  const [clubSearch, setClubSearch] = useState("");
  const [selectedClubs, setSelectedClubs] = useState<Set<string> | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryDiscipline, setCategoryDiscipline] = useState<"all" | "kata" | "kumite">("all");
  const [selectedCategories, setSelectedCategories] = useState<Set<string> | null>(null);

  const initialEventKey = events[0]?.slug || "default";

  // Fee settings & payment status (persisted in localStorage per event)
  const [feeSettings, setFeeSettings] = useState<FeeSettings>(() => readStoredFees(initialEventKey));
  const [paidClubs, setPaidClubs] = useState<Record<string, boolean>>(() => readStoredPaid(initialEventKey));

  const isBtcOrAdmin = session?.role === "btc" || session?.role === "admin";
  const count = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

  const selectedEvent = useMemo(
    () => events.find((e) => e.slug === selectedEventSlug) || events[0] || null,
    [events, selectedEventSlug],
  );

  const eventStorageKey = selectedEvent?.slug || "default";

  const updateFeeSettings = (patch: Partial<FeeSettings>) => {
    setFeeSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(`ksport_btc_fees_${eventStorageKey}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleClubPaid = (clubName: string) => {
    setPaidClubs((prev) => {
      const next = { ...prev, [clubName]: !prev[clubName] };
      try {
        localStorage.setItem(`ksport_btc_paid_${eventStorageKey}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const allMatches = useMemo(() => dedupeMatches(schedule, results), [schedule, results]);

  const eventMatches = useMemo(() => {
    if (!selectedEvent) return allMatches;
    const filtered = allMatches.filter(
      (m) => m.eventSlug === selectedEvent.slug || m.eventName === selectedEvent.name,
    );
    return filtered.length > 0 || events.length > 1 ? filtered : allMatches;
  }, [allMatches, selectedEvent, events.length]);

  const eventAthletes = useMemo(() => {
    if (!selectedEvent) return athletes;
    const filtered = athletes.filter(
      (a) => a.eventSlug === selectedEvent.slug || a.eventId === selectedEvent.slug,
    );
    return filtered.length > 0 || events.length > 1 ? filtered : athletes;
  }, [athletes, selectedEvent, events.length]);

  const eventRanking = useMemo(() => {
    if (!selectedEvent) return ranking;
    const filtered = ranking.filter(
      (r) => r.eventSlug === selectedEvent.slug || r.eventName === selectedEvent.name,
    );
    return filtered.length > 0 || events.length > 1 ? filtered : ranking;
  }, [ranking, selectedEvent, events.length]);

  // Unique athletes & Delegation summary by club
  const { uniqueAthletesCount, clubNames, delegationRows, delegationTotals } = useMemo(() => {
    const uniqueAll = new Set<string>();
    const clubMap = new Map<
      string,
      {
        club: string;
        teamLeaderCount: number;
        coachCount: number;
        maleKeys: Set<string>;
        femaleKeys: Set<string>;
        athleteKeys: Set<string>;
        entries: Athlete[];
      }
    >();

    for (const a of eventAthletes) {
      const key = getAthleteIdentityKey(a);
      uniqueAll.add(key);
      const clubName = a.club?.trim() || "Đơn vị tự do";
      let entry = clubMap.get(clubName);
      if (!entry) {
        entry = {
          club: clubName,
          teamLeaderCount: 0,
          coachCount: 0,
          maleKeys: new Set<string>(),
          femaleKeys: new Set<string>(),
          athleteKeys: new Set<string>(),
          entries: [],
        };
        clubMap.set(clubName, entry);
      }
      entry.entries.push(a);
      entry.athleteKeys.add(key);
      const g = inferGenderFromCategory(a.category);
      if (g === "male") entry.maleKeys.add(key);
      else if (g === "female") entry.femaleKeys.add(key);
    }

    const rows = [...clubMap.values()]
      .map((item) => {
        const cbTotal = item.teamLeaderCount + item.coachCount;
        const maleCount = item.maleKeys.size;
        const femaleCount = item.femaleKeys.size;
        const vdvCount = item.athleteKeys.size;
        return {
          club: item.club,
          teamLeaderCount: item.teamLeaderCount,
          coachCount: item.coachCount,
          cbTotal,
          maleCount,
          femaleCount,
          vdvCount,
          grandTotal: cbTotal + vdvCount,
          entryCount: item.entries.length,
        };
      })
      .sort((a, b) => a.club.localeCompare(b.club, "vi"));

    const totals = rows.reduce(
      (acc, r) => ({
        teamLeaderCount: acc.teamLeaderCount + r.teamLeaderCount,
        coachCount: acc.coachCount + r.coachCount,
        cbTotal: acc.cbTotal + r.cbTotal,
        maleCount: acc.maleCount + r.maleCount,
        femaleCount: acc.femaleCount + r.femaleCount,
        vdvCount: acc.vdvCount + r.vdvCount,
        grandTotal: acc.grandTotal + r.grandTotal,
        entryCount: acc.entryCount + r.entryCount,
      }),
      {
        teamLeaderCount: 0,
        coachCount: 0,
        cbTotal: 0,
        maleCount: 0,
        femaleCount: 0,
        vdvCount: 0,
        grandTotal: 0,
        entryCount: 0,
      },
    );

    return {
      uniqueAthletesCount: uniqueAll.size,
      clubNames: rows.map((r) => r.club),
      delegationRows: rows,
      delegationTotals: totals,
    };
  }, [eventAthletes]);

  // Club Fee Summary (mirrors D:\Boc_tham_karate\src\utils\feeCalculation.js)
  const feeSummary = useMemo(() => {
    const rows = clubNames.map((clubName) => {
      const clubEntries = eventAthletes.filter((a) => (a.club?.trim() || "Đơn vị tự do") === clubName);
      const individualEventsByAthlete = new Map<string, Set<string>>();
      const teamCategoryNames = new Set<string>();
      let individualCount = 0;

      for (const a of clubEntries) {
        const cat = a.category?.trim() || "Chưa phân hạng mục";
        if (isTeamCategory(cat)) {
          teamCategoryNames.add(cat);
          continue;
        }
        individualCount += 1;
        const key = getAthleteIdentityKey(a);
        let set = individualEventsByAthlete.get(key);
        if (!set) {
          set = new Set<string>();
          individualEventsByAthlete.set(key, set);
        }
        set.add(cat);
      }

      let extraEventsForSurcharge = 0;
      if (feeSettings.enableSurcharge) {
        individualEventsByAthlete.forEach((evSet) => {
          extraEventsForSurcharge += Math.max(0, evSet.size - 1);
        });
      }

      const individualAthleteCount = individualEventsByAthlete.size;
      const teamEntries = teamCategoryNames.size;
      const individualFeeTotal = individualAthleteCount * (Number(feeSettings.individualFee) || 0);
      const teamFeeTotal = teamEntries * (Number(feeSettings.teamFee) || 0);
      const surchargeTotal = extraEventsForSurcharge * (Number(feeSettings.surchargeFee) || 0);
      const totalFee = individualFeeTotal + teamFeeTotal + surchargeTotal;

      return {
        club: clubName,
        individualAthleteCount,
        individualCount,
        extraEventsForSurcharge,
        teamEntries,
        individualFeeTotal,
        teamFeeTotal,
        surchargeTotal,
        totalFee,
      };
    });

    const totals = rows.reduce(
      (acc, r) => ({
        individualAthleteCount: acc.individualAthleteCount + r.individualAthleteCount,
        extraEventsForSurcharge: acc.extraEventsForSurcharge + r.extraEventsForSurcharge,
        teamEntries: acc.teamEntries + r.teamEntries,
        individualFeeTotal: acc.individualFeeTotal + r.individualFeeTotal,
        teamFeeTotal: acc.teamFeeTotal + r.teamFeeTotal,
        surchargeTotal: acc.surchargeTotal + r.surchargeTotal,
        totalFee: acc.totalFee + r.totalFee,
      }),
      {
        individualAthleteCount: 0,
        extraEventsForSurcharge: 0,
        teamEntries: 0,
        individualFeeTotal: 0,
        teamFeeTotal: 0,
        surchargeTotal: 0,
        totalFee: 0,
      },
    );

    return { rows, totals };
  }, [clubNames, eventAthletes, feeSettings]);

  // Group athletes by Club (deduped athlete with list of registered categories)
  const athletesByClubGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        club: string;
        uniqueAthletes: { key: string; name: string; code?: string; gender: string; categories: string[] }[];
        entryCount: number;
      }
    >();

    for (const a of eventAthletes) {
      const clubName = a.club?.trim() || "Đơn vị tự do";
      let group = map.get(clubName);
      if (!group) {
        group = { club: clubName, uniqueAthletes: [], entryCount: 0 };
        map.set(clubName, group);
      }
      group.entryCount += 1;
      const key = getAthleteIdentityKey(a);
      const gLabel =
        inferGenderFromCategory(a.category) === "female"
          ? "Nữ"
          : inferGenderFromCategory(a.category) === "male"
            ? "Nam"
            : "—";
      const existing = group.uniqueAthletes.find((u) => u.key === key);
      if (existing) {
        if (a.category && !existing.categories.includes(a.category)) {
          existing.categories.push(a.category);
        }
      } else {
        group.uniqueAthletes.push({
          key,
          name: a.name,
          code: a.athleteCode,
          gender: gLabel,
          categories: a.category ? [a.category] : [],
        });
      }
    }

    return [...map.values()]
      .map((g) => ({
        ...g,
        uniqueAthletes: [...g.uniqueAthletes].sort((x, y) => x.name.localeCompare(y.name, "vi")),
      }))
      .sort((a, b) => a.club.localeCompare(b.club, "vi"));
  }, [eventAthletes]);

  const visibleClubGroups = useMemo(() => {
    const q = normalizeText(clubSearch);
    if (!q) return athletesByClubGroups;
    return athletesByClubGroups.filter(
      (g) =>
        normalizeText(g.club).includes(q) ||
        g.uniqueAthletes.some((u) => normalizeText(u.name).includes(q)),
    );
  }, [athletesByClubGroups, clubSearch]);

  const activeSelectedClubs = useMemo(
    () => selectedClubs ?? new Set(clubNames),
    [selectedClubs, clubNames],
  );

  // Group athletes by Category
  const athletesByCategoryGroups = useMemo(() => {
    const map = new Map<string, Athlete[]>();
    for (const a of eventAthletes) {
      const cat = a.category?.trim() || "Chưa phân hạng mục";
      const list = map.get(cat) || [];
      list.push(a);
      map.set(cat, list);
    }
    return [...map.entries()]
      .map(([category, list]) => ({
        category,
        athletes: [...list].sort((x, y) => x.name.localeCompare(y.name, "vi")),
      }))
      .sort((a, b) => a.category.localeCompare(b.category, "vi"));
  }, [eventAthletes]);

  const visibleCategoryGroups = useMemo(() => {
    const q = normalizeText(categorySearch);
    return athletesByCategoryGroups.filter((g) => {
      const catLower = g.category.toLowerCase();
      if (categoryDiscipline === "kata" && !catLower.includes("kata")) return false;
      if (categoryDiscipline === "kumite" && !catLower.includes("kumite")) return false;
      if (q && !catLower.includes(q) && !g.athletes.some((a) => normalizeText(a.name).includes(q))) {
        return false;
      }
      return true;
    });
  }, [athletesByCategoryGroups, categorySearch, categoryDiscipline]);

  const activeSelectedCategories = useMemo(
    () => selectedCategories ?? new Set(athletesByCategoryGroups.map((g) => g.category)),
    [selectedCategories, athletesByCategoryGroups],
  );

  const tatamiGroups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of eventMatches) {
      const label = normalizeTatamiLabel(m.tatami);
      const list = map.get(label) || [];
      list.push(m);
      map.set(label, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "vi", { numeric: true }));
  }, [eventMatches]);

  const activeTatamiLabel =
    selectedTatami && tatamiGroups.some(([l]) => l === selectedTatami)
      ? selectedTatami
      : tatamiGroups[0]?.[0] || "";

  const activeTatamiMatches = useMemo(
    () => tatamiGroups.find(([l]) => l === activeTatamiLabel)?.[1] || [],
    [tatamiGroups, activeTatamiLabel],
  );

  const clubStandings = useMemo(() => {
    const map = new Map<
      string,
      { club: string; gold: number; silver: number; bronze: number; points: number }
    >();
    for (const r of eventRanking) {
      const clubName = r.club?.trim() || "Đoàn khác";
      const cur = map.get(clubName) || { club: clubName, gold: 0, silver: 0, bronze: 0, points: 0 };
      cur.gold += r.medals?.gold ?? 0;
      cur.silver += r.medals?.silver ?? 0;
      cur.bronze += r.medals?.bronze ?? 0;
      cur.points += r.points ?? 0;
      map.set(clubName, cur);
    }
    return [...map.values()].sort(
      (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.points - a.points,
    );
  }, [eventRanking]);

  if (!isBtcOrAdmin) {
    return (
      <div className="btc-forbidden">
        <div className="btc-forbidden-card">
          <span className="btc-forbidden-icon">🔒</span>
          <h2>Khu vực giới hạn Ban Tổ Chức (Role BTC)</h2>
          <p>
            Tài khoản hiện tại ({session?.name || "Người dùng"}) không có quyền truy cập dữ liệu điều hành của Ban Tổ Chức giải.
          </p>
          <Link href="/admin" className="button red">
            Quay lại Tổng quan Admin
          </Link>
        </div>
      </div>
    );
  }

  const completedMatchesCount = eventMatches.filter((m) => m.state === "Đã kết thúc").length;
  const liveMatchesCount = eventMatches.filter((m) => m.state === "Đang thi đấu").length;
  const progressPct =
    eventMatches.length > 0 ? Math.round((completedMatchesCount / eventMatches.length) * 1000) / 10 : 0;

  const clubCount = clubNames.length > 0 ? clubNames.length : clubs.length;
  const categoriesCount =
    selectedEvent?.categories.length || new Set(eventMatches.map((m) => m.category)).size;
  const tournamentTitle = selectedEvent?.name || "Giải đấu K-SPORT";

  // ===== PDF EXPORT HANDLERS =====
  const handleExportDelegationPDF = () => {
    const rowsHtml = delegationRows
      .map(
        (d, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-left bold">${escapeHtml(d.club)}</td>
        <td class="text-center">${d.teamLeaderCount}</td>
        <td class="text-center">${d.coachCount}</td>
        <td class="text-center bg-cb">${d.cbTotal}</td>
        <td class="text-center">${d.maleCount}</td>
        <td class="text-center">${d.femaleCount}</td>
        <td class="text-center bg-vdv">${d.vdvCount}</td>
        <td class="text-center bg-total">${d.grandTotal}</td>
      </tr>`,
      )
      .join("");

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th rowspan="2" style="width:42px;">TT</th>
            <th rowspan="2" class="text-left">ĐƠN VỊ</th>
            <th colspan="3" style="background:#f59e0b;color:#fff;">CÁN BỘ</th>
            <th colspan="3" style="background:#16a34a;color:#fff;">VĐV</th>
            <th rowspan="2" style="width:92px;">TỔNG CỘNG</th>
          </tr>
          <tr>
            <th style="width:52px;background:#f59e0b;color:#fff;">TĐ</th>
            <th style="width:52px;background:#f59e0b;color:#fff;">HLV</th>
            <th style="width:62px;background:#f59e0b;color:#fff;">CỘNG</th>
            <th style="width:52px;background:#16a34a;color:#fff;">NAM</th>
            <th style="width:52px;background:#16a34a;color:#fff;">NỮ</th>
            <th style="width:62px;background:#16a34a;color:#fff;">CỘNG</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr class="row-grand-total">
            <td colspan="2" class="text-center">TỔNG CỘNG</td>
            <td class="text-center">${delegationTotals.teamLeaderCount}</td>
            <td class="text-center">${delegationTotals.coachCount}</td>
            <td class="text-center">${delegationTotals.cbTotal}</td>
            <td class="text-center">${delegationTotals.maleCount}</td>
            <td class="text-center">${delegationTotals.femaleCount}</td>
            <td class="text-center">${delegationTotals.vdvCount}</td>
            <td class="text-center">${delegationTotals.grandTotal}</td>
          </tr>
        </tfoot>
      </table>`;

    printBtcHtmlReport({
      title: "THỐNG KÊ ĐOÀN THAM DỰ",
      tournamentName: tournamentTitle,
      subtitle: `${delegationRows.length} đơn vị · ${delegationTotals.vdvCount} VĐV thực tế (${delegationTotals.entryCount} lượt đăng ký)`,
      bodyHtml,
    });
  };

  const handleExportFeesPDF = () => {
    const rowsHtml = feeSummary.rows
      .map(
        (r, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-left bold">${escapeHtml(r.club)}</td>
        <td class="text-center">${r.individualAthleteCount}</td>
        <td class="text-center">${r.extraEventsForSurcharge}</td>
        <td class="text-center">${r.teamEntries}</td>
        <td class="text-right bold">${formatVnd(r.totalFee)} đ</td>
        <td class="text-center">${paidClubs[r.club] ? "Đã đóng" : "Chưa đóng"}</td>
      </tr>`,
      )
      .join("");

    const bodyHtml = `
      <table>
        <thead>
          <tr>
            <th style="width:42px;">STT</th>
            <th class="text-left">Đơn vị / CLB</th>
            <th style="width:82px;">VĐV Cá nhân</th>
            <th style="width:80px;">Phụ thu (ND)</th>
            <th style="width:70px;">Đội (ĐĐ)</th>
            <th class="text-right" style="width:130px;">Tổng lệ phí (VNĐ)</th>
            <th style="width:95px;">Tình trạng</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr class="row-grand-total">
            <td colspan="2" class="text-center">TỔNG CỘNG</td>
            <td class="text-center">${feeSummary.totals.individualAthleteCount}</td>
            <td class="text-center">${feeSummary.totals.extraEventsForSurcharge}</td>
            <td class="text-center">${feeSummary.totals.teamEntries}</td>
            <td class="text-right">${formatVnd(feeSummary.totals.totalFee)} đ</td>
            <td class="text-center">—</td>
          </tr>
        </tfoot>
      </table>`;

    printBtcHtmlReport({
      title: "BẢNG KÊ LỆ PHÍ THAM GIA ĐOÀN",
      tournamentName: tournamentTitle,
      subtitle: `Cá nhân: ${formatVnd(feeSettings.individualFee)} đ/VĐV · Đồng đội: ${formatVnd(feeSettings.teamFee)} đ/đội${feeSettings.enableSurcharge ? ` · Phụ thu từ ND thứ 2: ${formatVnd(feeSettings.surchargeFee)} đ` : ""}`,
      bodyHtml,
    });
  };

  const handleExportByClubPDF = () => {
    const chosen = athletesByClubGroups.filter((g) => activeSelectedClubs.has(g.club));
    if (chosen.length === 0) return;

    const bodyHtml = chosen
      .map(
        (g) => `
      <div class="group-block">
        <h3 class="group-heading">${escapeHtml(g.club)} (${g.uniqueAthletes.length} VĐV · ${g.entryCount} lượt)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:42px;">STT</th>
              <th class="text-left">Họ và tên</th>
              <th style="width:110px;">Mã VĐV</th>
              <th style="width:70px;">Giới tính</th>
              <th class="text-left">Nội dung đăng ký</th>
            </tr>
          </thead>
          <tbody>
            ${g.uniqueAthletes
              .map(
                (u, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td class="text-left bold">${escapeHtml(u.name)}</td>
                <td class="text-center">${escapeHtml(u.code || "—")}</td>
                <td class="text-center">${escapeHtml(u.gender)}</td>
                <td class="text-left">${escapeHtml(u.categories.join(", "))}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`,
      )
      .join("");

    printBtcHtmlReport({
      title: "DANH SÁCH VĐV THEO ĐƠN VỊ / CLB",
      tournamentName: tournamentTitle,
      subtitle: `${chosen.length} đơn vị được chọn`,
      bodyHtml,
    });
  };

  const handleExportByCategoryPDF = () => {
    const chosen = athletesByCategoryGroups.filter((g) => activeSelectedCategories.has(g.category));
    if (chosen.length === 0) return;

    const bodyHtml = chosen
      .map(
        (g) => `
      <div class="group-block">
        <h3 class="group-heading">${escapeHtml(g.category)} (${g.athletes.length} VĐV)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:42px;">STT</th>
              <th class="text-left">Họ và tên</th>
              <th style="width:115px;">Mã VĐV</th>
              <th class="text-left">Đơn vị / CLB</th>
            </tr>
          </thead>
          <tbody>
            ${g.athletes
              .map(
                (a, i) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td class="text-left bold">${escapeHtml(a.name)}</td>
                <td class="text-center">${escapeHtml(a.athleteCode || a.id)}</td>
                <td class="text-left">${escapeHtml(a.club)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`,
      )
      .join("");

    printBtcHtmlReport({
      title: "DANH SÁCH VĐV THEO HẠNG MỤC",
      tournamentName: tournamentTitle,
      subtitle: `${chosen.length} hạng mục được chọn`,
      bodyHtml,
    });
  };

  return (
    <div className="btc-portal">
      {/* Tournament Top Banner */}
      <header className="btc-header">
        <div className="btc-header-left">
          <div className="btc-badge-row">
            <span className={`btc-status-badge ${selectedEvent?.status === "Đang diễn ra" ? "is-live" : ""}`}>
              {selectedEvent ? `● ${selectedEvent.status}` : "● Chưa có giải đấu"}
            </span>
            <span className="btc-sub-badge">Phân quyền: Ban Tổ Chức Giải (BTC)</span>
            <span className="btc-sub-badge">Dữ liệu thực tế Public API</span>
          </div>
          <h1 className="btc-tournament-title">
            {selectedEvent ? selectedEvent.name : "Chưa có giải đấu nào được đồng bộ"}
          </h1>
          <div className="btc-meta-row">
            <span>
              📅{" "}
              {selectedEvent
                ? selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date
                  ? `${selectedEvent.date} - ${selectedEvent.endDate}`
                  : selectedEvent.date
                : "—"}
            </span>
            <span>📍 {selectedEvent?.location || "Chưa cập nhật địa điểm"}</span>
            <span>
              🥋 {count.format(clubCount)} CLB · {count.format(uniqueAthletesCount)} VĐV ({count.format(eventAthletes.length)} lượt)
            </span>
            <span>⚡ {tatamiGroups.length} Thảm đấu</span>
          </div>
        </div>

        <div className="btc-header-actions">
          {events.length > 1 ? (
            <select
              aria-label="Chọn giải đấu"
              className="filter-select-pro"
              value={selectedEvent?.slug || ""}
              onChange={(e) => {
                const nextSlug = e.target.value;
                setSelectedEventSlug(nextSlug);
                setSelectedTatami("");
                setSelectedClubs(null);
                setSelectedCategories(null);
                setFeeSettings(readStoredFees(nextSlug || "default"));
                setPaidClubs(readStoredPaid(nextSlug || "default"));
              }}
            >
              {events.map((ev) => (
                <option key={ev.slug} value={ev.slug}>
                  {ev.name} ({ev.status})
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            className="btc-action-btn secondary"
            disabled={refreshing}
            onClick={() => {
              setRefreshing(true);
              router.refresh();
              setTimeout(() => setRefreshing(false), 800);
            }}
          >
            {refreshing ? "Đang tải..." : "🔄 Làm mới"}
          </button>
          {selectedEvent ? (
            <Link href={`/events/${selectedEvent.slug}`} className="btc-action-btn primary">
              Xem trang giải đấu ↗
            </Link>
          ) : null}
        </div>
      </header>

      {/* KPI Overview Grid */}
      <div className="btc-kpi-grid">
        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">👥</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Tổng số Vận Động Viên</span>
            <strong className="btc-kpi-val">{count.format(uniqueAthletesCount)}</strong>
            <span className="btc-kpi-sub">{count.format(eventAthletes.length)} lượt đăng ký thi đấu</span>
          </div>
        </div>

        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">🏛️</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Đoàn / Câu Lạc Bộ</span>
            <strong className="btc-kpi-val">{count.format(clubCount)}</strong>
            <span className="btc-kpi-sub">Tổng số đơn vị tham gia thi đấu</span>
          </div>
        </div>

        <div className="btc-kpi-card">
          <div className="btc-kpi-icon">🏅</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Nội Dung Thi Đấu</span>
            <strong className="btc-kpi-val">{count.format(categoriesCount)}</strong>
            <span className="btc-kpi-sub">Kata &amp; Kumite theo điều lệ giải</span>
          </div>
        </div>

        <div className="btc-kpi-card highlight">
          <div className="btc-kpi-icon">⚡</div>
          <div className="btc-kpi-content">
            <span className="btc-kpi-label">Tiến Độ Trận Đấu</span>
            <strong className="btc-kpi-val">{progressPct}%</strong>
            <span className="btc-kpi-sub">
              Đã xong {count.format(completedMatchesCount)}/{count.format(eventMatches.length)} trận ({liveMatchesCount} đang đấu)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="btc-tabs" role="tablist" aria-label="Các mục điều hành BTC">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "delegation"}
          className={`btc-tab ${activeTab === "delegation" ? "is-active" : ""}`}
          onClick={() => setActiveTab("delegation")}
        >
          📊 Thống kê Đoàn ({delegationRows.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "fees"}
          className={`btc-tab ${activeTab === "fees" ? "is-active" : ""}`}
          onClick={() => setActiveTab("fees")}
        >
          💰 Thống kê lệ phí
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "by-club"}
          className={`btc-tab ${activeTab === "by-club" ? "is-active" : ""}`}
          onClick={() => setActiveTab("by-club")}
        >
          🏢 VĐV theo Đơn vị ({athletesByClubGroups.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "by-category"}
          className={`btc-tab ${activeTab === "by-category" ? "is-active" : ""}`}
          onClick={() => setActiveTab("by-category")}
        >
          📋 VĐV theo Hạng mục ({athletesByCategoryGroups.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`btc-tab ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          🏟️ Thảm đấu ({tatamiGroups.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "tatami"}
          className={`btc-tab ${activeTab === "tatami" ? "is-active" : ""}`}
          onClick={() => setActiveTab("tatami")}
        >
          🥋 Lịch &amp; Trận ({eventMatches.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "medals"}
          className={`btc-tab ${activeTab === "medals" ? "is-active" : ""}`}
          onClick={() => setActiveTab("medals")}
        >
          🥇 BXH Đoàn ({clubStandings.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "sync"}
          className={`btc-tab ${activeTab === "sync" ? "is-active" : ""}`}
          onClick={() => setActiveTab("sync")}
        >
          ⚖️ Cân ký &amp; Trọng tài
        </button>
      </div>

      {/* TAB 1: DELEGATION STATS (LIKE DESKTOP) */}
      {activeTab === "delegation" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>THỐNG KÊ ĐOÀN THAM DỰ</h3>
                <p>{tournamentTitle}</p>
              </div>
              <button
                type="button"
                className="btc-export-pdf-btn"
                disabled={delegationRows.length === 0}
                onClick={handleExportDelegationPDF}
              >
                📄 Xuất PDF Thống kê
              </button>
            </div>

            {delegationRows.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>
                Chưa có dữ liệu VĐV cho giải đấu này trên Public API. Hãy bấm Đồng bộ Public từ K-SPORT Desktop rồi bấm Làm mới.
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="btc-delegation-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: "48px" }}>TT</th>
                      <th rowSpan={2} className="text-left">ĐƠN VỊ</th>
                      <th colSpan={3} className="col-cb-head">CÁN BỘ</th>
                      <th colSpan={3} className="col-vdv-head">VĐV</th>
                      <th rowSpan={2} style={{ width: "110px" }}>TỔNG CỘNG</th>
                    </tr>
                    <tr>
                      <th className="col-cb-head" style={{ width: "64px" }}>TĐ</th>
                      <th className="col-cb-head" style={{ width: "64px" }}>HLV</th>
                      <th className="col-cb-head" style={{ width: "74px" }}>CỘNG</th>
                      <th className="col-vdv-head" style={{ width: "64px" }}>NAM</th>
                      <th className="col-vdv-head" style={{ width: "64px" }}>NỮ</th>
                      <th className="col-vdv-head" style={{ width: "74px" }}>CỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delegationRows.map((d, idx) => (
                      <tr key={d.club}>
                        <td className="text-center">{idx + 1}</td>
                        <td className="text-left font-medium">{d.club}</td>
                        <td className="text-center">{d.teamLeaderCount}</td>
                        <td className="text-center">{d.coachCount}</td>
                        <td className="text-center cell-cb-total">{d.cbTotal}</td>
                        <td className="text-center font-semibold">{d.maleCount}</td>
                        <td className="text-center font-semibold">{d.femaleCount}</td>
                        <td className="text-center cell-vdv-total">{d.vdvCount}</td>
                        <td className="text-center cell-grand-total">{d.grandTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="row-grand-total">
                      <td colSpan={2} className="text-center">TỔNG CỘNG</td>
                      <td className="text-center">{delegationTotals.teamLeaderCount}</td>
                      <td className="text-center">{delegationTotals.coachCount}</td>
                      <td className="text-center cell-cb-sum">{delegationTotals.cbTotal}</td>
                      <td className="text-center">{delegationTotals.maleCount}</td>
                      <td className="text-center">{delegationTotals.femaleCount}</td>
                      <td className="text-center cell-vdv-sum">{delegationTotals.vdvCount}</td>
                      <td className="text-center cell-grand-sum">{delegationTotals.grandTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FEE STATISTICS */}
      {activeTab === "fees" && (
        <div className="btc-tab-content">
          <div className="btc-section-card" style={{ marginBottom: "18px" }}>
            <div className="btc-card-header">
              <div>
                <h3>⚙️ Cài đặt Mức lệ phí</h3>
                <p>Tự động lưu theo trình duyệt cho từng giải đấu</p>
              </div>
              <button
                type="button"
                className="btc-export-pdf-btn"
                disabled={feeSummary.rows.length === 0}
                onClick={handleExportFeesPDF}
              >
                📄 Xuất PDF Lệ phí
              </button>
            </div>

            <div className="btc-fee-settings-grid">
              <label className="btc-fee-field">
                <span>Lệ phí cá nhân (VNĐ / VĐV)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatVnd(feeSettings.individualFee)}
                  onChange={(e) =>
                    updateFeeSettings({ individualFee: Number(e.target.value.replace(/\D/g, "")) || 0 })
                  }
                />
              </label>

              <label className="btc-fee-field">
                <span>Lệ phí đồng đội / hỗn hợp (VNĐ / đội)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatVnd(feeSettings.teamFee)}
                  onChange={(e) =>
                    updateFeeSettings({ teamFee: Number(e.target.value.replace(/\D/g, "")) || 0 })
                  }
                />
              </label>

              <div className="btc-fee-field">
                <label className="btc-fee-checkbox">
                  <input
                    type="checkbox"
                    checked={feeSettings.enableSurcharge}
                    onChange={(e) => updateFeeSettings({ enableSurcharge: e.target.checked })}
                  />
                  <span>Phụ thu VĐV thi ≥ 2 nội dung</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  disabled={!feeSettings.enableSurcharge}
                  value={formatVnd(feeSettings.surchargeFee)}
                  onChange={(e) =>
                    updateFeeSettings({ surchargeFee: Number(e.target.value.replace(/\D/g, "")) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>💰 Bảng kê Lệ phí theo Đơn vị ({feeSummary.rows.length})</h3>
                <p>Tổng thu dự kiến: <strong>{formatVnd(feeSummary.totals.totalFee)} đ</strong></p>
              </div>
            </div>

            {feeSummary.rows.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có dữ liệu VĐV để tính lệ phí.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-content-table admin-responsive-table">
                  <thead>
                    <tr>
                      <th style={{ width: "52px" }}>STT</th>
                      <th>Đơn vị / CLB</th>
                      <th style={{ textAlign: "center" }}>VĐV Cá nhân</th>
                      <th style={{ textAlign: "center" }}>ND Phụ thu</th>
                      <th style={{ textAlign: "center" }}>Đội (ĐĐ)</th>
                      <th style={{ textAlign: "right" }}>Tổng lệ phí</th>
                      <th style={{ textAlign: "center" }}>Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeSummary.rows.map((r, idx) => {
                      const isPaid = Boolean(paidClubs[r.club]);
                      return (
                        <tr key={r.club}>
                          <td data-label="STT">{idx + 1}</td>
                          <td data-label="Đơn vị / CLB"><strong>{r.club}</strong></td>
                          <td data-label="VĐV Cá nhân" style={{ textAlign: "center" }}>{r.individualAthleteCount}</td>
                          <td data-label="ND Phụ thu" style={{ textAlign: "center" }}>{r.extraEventsForSurcharge}</td>
                          <td data-label="Đội (ĐĐ)" style={{ textAlign: "center" }}>{r.teamEntries}</td>
                          <td data-label="Tổng lệ phí" style={{ textAlign: "right", fontWeight: 700, color: "#0369a1" }}>
                            {formatVnd(r.totalFee)} đ
                          </td>
                          <td data-label="Tình trạng" style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className={`btc-paid-pill ${isPaid ? "is-paid" : "is-unpaid"}`}
                              onClick={() => toggleClubPaid(r.club)}
                            >
                              {isPaid ? "✓ Đã đóng" : "Chưa đóng"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="row-grand-total">
                      <td colSpan={2} style={{ textAlign: "center", fontWeight: 800 }}>TỔNG CỘNG</td>
                      <td style={{ textAlign: "center", fontWeight: 800 }}>{feeSummary.totals.individualAthleteCount}</td>
                      <td style={{ textAlign: "center", fontWeight: 800 }}>{feeSummary.totals.extraEventsForSurcharge}</td>
                      <td style={{ textAlign: "center", fontWeight: 800 }}>{feeSummary.totals.teamEntries}</td>
                      <td style={{ textAlign: "right", fontWeight: 800, color: "#dc2626" }}>
                        {formatVnd(feeSummary.totals.totalFee)} đ
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ATHLETES BY CLUB */}
      {activeTab === "by-club" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>🏢 Danh sách VĐV theo Đơn vị / CLB ({visibleClubGroups.length}/{athletesByClubGroups.length})</h3>
                <p>Tích chọn các đơn vị cần xuất PDF</p>
              </div>
              <button
                type="button"
                className="btc-export-pdf-btn"
                disabled={activeSelectedClubs.size === 0}
                onClick={handleExportByClubPDF}
              >
                📄 Xuất PDF ({activeSelectedClubs.size} CLB)
              </button>
            </div>

            <div className="btc-filter-toolbar">
              <input
                type="search"
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
                placeholder="Tìm tên CLB hoặc tên VĐV..."
                aria-label="Tìm CLB hoặc VĐV"
                className="btc-search-input"
              />
              <button
                type="button"
                className="btc-mini-btn"
                onClick={() => setSelectedClubs(new Set(clubNames))}
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                className="btc-mini-btn"
                onClick={() => setSelectedClubs(new Set())}
              >
                Bỏ chọn
              </button>
            </div>

            {visibleClubGroups.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Không có dữ liệu đơn vị phù hợp.</p>
            ) : (
              <div className="btc-group-list">
                {visibleClubGroups.map((g) => {
                  const checked = activeSelectedClubs.has(g.club);
                  return (
                    <details key={g.club} className="btc-group-card" open={visibleClubGroups.length <= 5}>
                      <summary className="btc-group-summary">
                        <label
                          className="btc-group-check"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = new Set(activeSelectedClubs);
                              if (checked) next.delete(g.club);
                              else next.add(g.club);
                              setSelectedClubs(next);
                            }}
                          />
                          <strong>{g.club}</strong>
                        </label>
                        <span className="btc-group-count">
                          {g.uniqueAthletes.length} VĐV · {g.entryCount} lượt
                        </span>
                      </summary>
                      <div className="admin-table-wrap" style={{ marginTop: "10px" }}>
                        <table className="admin-content-table admin-responsive-table">
                          <thead>
                            <tr>
                              <th style={{ width: "48px" }}>STT</th>
                              <th>Họ và tên</th>
                              <th>Mã VĐV</th>
                              <th style={{ width: "80px" }}>Giới tính</th>
                              <th>Nội dung đăng ký</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.uniqueAthletes.map((u, idx) => (
                              <tr key={u.key}>
                                <td data-label="STT">{idx + 1}</td>
                                <td data-label="Họ và tên"><strong>{u.name}</strong></td>
                                <td data-label="Mã VĐV"><code>{u.code || "—"}</code></td>
                                <td data-label="Giới tính">{u.gender}</td>
                                <td data-label="Nội dung">{u.categories.join(", ")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ATHLETES BY CATEGORY */}
      {activeTab === "by-category" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>📋 Danh sách VĐV theo Hạng mục ({visibleCategoryGroups.length}/{athletesByCategoryGroups.length})</h3>
                <p>Tích chọn các hạng mục cần xuất PDF</p>
              </div>
              <button
                type="button"
                className="btc-export-pdf-btn"
                disabled={activeSelectedCategories.size === 0}
                onClick={handleExportByCategoryPDF}
              >
                📄 Xuất PDF ({activeSelectedCategories.size} hạng mục)
              </button>
            </div>

            <div className="btc-filter-toolbar">
              <input
                type="search"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Tìm tên hạng mục hoặc VĐV..."
                aria-label="Tìm hạng mục"
                className="btc-search-input"
              />
              <select
                aria-label="Lọc thể thức"
                className="filter-select-pro"
                value={categoryDiscipline}
                onChange={(e) => setCategoryDiscipline(e.target.value as "all" | "kata" | "kumite")}
              >
                <option value="all">Tất cả (Kata &amp; Kumite)</option>
                <option value="kata">Chỉ Kata</option>
                <option value="kumite">Chỉ Kumite</option>
              </select>
              <button
                type="button"
                className="btc-mini-btn"
                onClick={() => setSelectedCategories(new Set(visibleCategoryGroups.map((g) => g.category)))}
              >
                Chọn đang lọc
              </button>
              <button
                type="button"
                className="btc-mini-btn"
                onClick={() => setSelectedCategories(new Set())}
              >
                Bỏ chọn
              </button>
            </div>

            {visibleCategoryGroups.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Không có hạng mục phù hợp.</p>
            ) : (
              <div className="btc-group-list">
                {visibleCategoryGroups.map((g) => {
                  const checked = activeSelectedCategories.has(g.category);
                  return (
                    <details key={g.category} className="btc-group-card" open={visibleCategoryGroups.length <= 5}>
                      <summary className="btc-group-summary">
                        <label
                          className="btc-group-check"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = new Set(activeSelectedCategories);
                              if (checked) next.delete(g.category);
                              else next.add(g.category);
                              setSelectedCategories(next);
                            }}
                          />
                          <strong>{g.category}</strong>
                        </label>
                        <span className="btc-group-count">{g.athletes.length} VĐV</span>
                      </summary>
                      <div className="admin-table-wrap" style={{ marginTop: "10px" }}>
                        <table className="admin-content-table admin-responsive-table">
                          <thead>
                            <tr>
                              <th style={{ width: "48px" }}>STT</th>
                              <th>Họ và tên</th>
                              <th>Mã VĐV</th>
                              <th>Đơn vị / CLB</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.athletes.map((a, idx) => (
                              <tr key={a.id}>
                                <td data-label="STT">{idx + 1}</td>
                                <td data-label="Họ và tên">
                                  <Link href={`/athletes/${encodeURIComponent(a.id)}`}>
                                    <strong>{a.name}</strong>
                                  </Link>
                                </td>
                                <td data-label="Mã VĐV"><code>{a.athleteCode || a.id}</code></td>
                                <td data-label="Đơn vị / CLB">{a.club}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: OVERVIEW / TATAMI */}
      {activeTab === "overview" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Trạng thái {tatamiGroups.length} Thảm đấu hiện tại</h3>
              <span className="btc-live-dot">Đồng bộ Public API</span>
            </div>
            {tatamiGroups.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có dữ liệu trận đấu nào cho giải này.</p>
            ) : (
              <div className="btc-tatami-cards">
                {tatamiGroups.map(([label, matches]) => {
                  const done = matches.filter((m) => m.state === "Đã kết thúc").length;
                  const live = matches.find((m) => m.state === "Đang thi đấu") || matches[0];
                  const pct = matches.length > 0 ? Math.round((done / matches.length) * 100) : 0;
                  return (
                    <div key={label} className={`btc-tatami-mini ${pct === 100 ? "is-done" : "is-ongoing"}`}>
                      <div className="btc-mini-top">
                        <span className="btc-tatami-tag red">{label.toUpperCase()}</span>
                        <span className="btc-tatami-status">{live?.state || "Chờ cập nhật"}</span>
                      </div>
                      <strong className="btc-match-name">{live?.category || "Chưa có nội dung"}</strong>
                      {live ? (
                        <div className="btc-athletes-match">
                          <span className="aka">
                            🔴 AKA: {live.red} {typeof live.redScore === "number" ? `(${live.redScore}đ)` : ""}
                          </span>
                          <span className="ao">
                            🔵 AO: {live.blue} {typeof live.blueScore === "number" ? `(${live.blueScore}đ)` : ""}
                          </span>
                        </div>
                      ) : null}
                      <div className="btc-progress-bar">
                        <div className="btc-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="btc-progress-txt">
                        Hoàn thành {done}/{matches.length} trận ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: TATAMI MATCHES */}
      {activeTab === "tatami" && (
        <div className="btc-tab-content">
          <div className="btc-tatami-selector">
            <span>Chọn thảm:</span>
            {tatamiGroups.map(([label, matches]) => (
              <button
                key={label}
                type="button"
                className={`btc-tatami-btn ${activeTatamiLabel === label ? "is-selected" : ""}`}
                onClick={() => setSelectedTatami(label)}
              >
                {label} ({matches.length} trận)
              </button>
            ))}
          </div>

          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Danh sách trận đấu — {activeTatamiLabel || "Tất cả"}</h3>
            </div>
            {activeTatamiMatches.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Chưa có trận đấu nào trên thảm này.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-content-table admin-responsive-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Nội dung</th>
                      <th>AKA (Đỏ)</th>
                      <th>Tỉ số</th>
                      <th>AO (Xanh)</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTatamiMatches.map((m) => (
                      <tr key={m.id}>
                        <td data-label="Thời gian">
                          {m.date} {m.time}
                        </td>
                        <td data-label="Nội dung">
                          <strong>{m.category}</strong>
                        </td>
                        <td data-label="AKA (Đỏ)">{m.red}</td>
                        <td data-label="Tỉ số">
                          {typeof m.redScore === "number" && typeof m.blueScore === "number"
                            ? `${m.redScore} - ${m.blueScore}`
                            : "—"}
                        </td>
                        <td data-label="AO (Xanh)">{m.blue}</td>
                        <td data-label="Trạng thái">{m.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: MEDAL TABLE */}
      {activeTab === "medals" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <div>
                <h3>Bảng tổng sắp theo dữ liệu Xếp hạng (Public API)</h3>
                <p>Tổng hợp từ /api/public/ranking</p>
              </div>
            </div>
            {clubStandings.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>
                Chưa có dữ liệu bảng xếp hạng / huy chương cho giải đấu này.
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-content-table admin-responsive-table">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Hạng</th>
                      <th>Đoàn / Câu Lạc Bộ</th>
                      <th style={{ textAlign: "center" }}>🥇 Vàng</th>
                      <th style={{ textAlign: "center" }}>🥈 Bạc</th>
                      <th style={{ textAlign: "center" }}>🥉 Đồng</th>
                      <th style={{ textAlign: "right" }}>Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubStandings.map((row, idx) => (
                      <tr key={row.club}>
                        <td data-label="Hạng">
                          <strong>{idx + 1}</strong>
                        </td>
                        <td data-label="Đoàn / CLB">
                          <strong>{row.club}</strong>
                        </td>
                        <td data-label="Vàng" style={{ textAlign: "center", fontWeight: "bold" }}>
                          {row.gold}
                        </td>
                        <td data-label="Bạc" style={{ textAlign: "center", fontWeight: "bold" }}>
                          {row.silver}
                        </td>
                        <td data-label="Đồng" style={{ textAlign: "center", fontWeight: "bold" }}>
                          {row.bronze}
                        </td>
                        <td data-label="Điểm" style={{ textAlign: "right", fontWeight: "bold" }}>
                          {count.format(row.points)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: WEIGH-IN & REFEREES */}
      {activeTab === "sync" && (
        <div className="btc-tab-content">
          <div className="btc-section-card">
            <div className="btc-card-header">
              <h3>Cân ký &amp; Phân công Trọng tài</h3>
            </div>
            <p style={{ color: "var(--muted)", margin: 0 }}>
              Máy chủ Public API hiện chưa cung cấp dữ liệu nội bộ về biên bản cân ký và phân công trọng tài. Dữ liệu chỉ hiển thị khi K-SPORT Desktop đồng bộ các bảng này lên máy chủ quản trị.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
