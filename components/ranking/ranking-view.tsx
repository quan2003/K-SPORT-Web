"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type RankingEntry, type Athlete, competitionType } from "@/lib/public-data";

interface RankingViewProps {
  initialRanking: RankingEntry[];
  athletes: Athlete[];
  initialCategory?: string;
  initialSeason?: string;
  initialTop?: number;
}

export function RankingView({
  initialRanking,
  athletes,
  initialCategory = "all",
  initialSeason = "all",
  initialTop = 10,
}: RankingViewProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(initialSeason);
  const [selectedType, setSelectedType] = useState<string>("all"); // 'all' | 'Kumite' | 'Kata'
  const [selectedGender, setSelectedGender] = useState<string>("all"); // 'all' | 'nam' | 'nu'
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTop, setSelectedTop] = useState<number>(initialTop);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Map athlete details by ID for quick stats lookup
  const athleteMap = useMemo(() => {
    const map = new Map<string, Athlete>();
    for (const a of athletes) {
      map.set(a.id, a);
    }
    return map;
  }, [athletes]);

  // Extract unique seasons
  const seasons = useMemo(() => {
    const list = Array.from(
      new Set(initialRanking.map((r) => r.season).filter((s): s is string => Boolean(s)))
    );
    return list.sort((a, b) => b.localeCompare(a));
  }, [initialRanking]);

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(initialRanking.map((r) => r.category).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, "vi"));
  }, [initialRanking]);

  // 1. Season Aggregation or Filtering
  const seasonFiltered = useMemo(() => {
    if (selectedSeason === "all") {
      // Aggregate multi-season points per athlete or take latest
      const athleteEntries = new Map<string, RankingEntry[]>();
      for (const entry of initialRanking) {
        const arr = athleteEntries.get(entry.athleteId) || [];
        arr.push(entry);
        athleteEntries.set(entry.athleteId, arr);
      }

      const aggregated: RankingEntry[] = [];
      athleteEntries.forEach((entries, athleteId) => {
        // Sort latest first
        entries.sort((a, b) => (b.season ?? "").localeCompare(a.season ?? "") || b.points - a.points);
        const latest = entries[0];
        const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
        const totalGold = entries.reduce((sum, e) => sum + (e.medals?.gold ?? 0), 0);
        const totalSilver = entries.reduce((sum, e) => sum + (e.medals?.silver ?? 0), 0);
        const totalBronze = entries.reduce((sum, e) => sum + (e.medals?.bronze ?? 0), 0);

        aggregated.push({
          ...latest,
          athleteId,
          points: totalPoints,
          medals: { gold: totalGold, silver: totalSilver, bronze: totalBronze },
        });
      });

      return aggregated;
    }

    return initialRanking.filter((r) => r.season === selectedSeason);
  }, [initialRanking, selectedSeason]);

  // 2. Multi-Filter & Search
  const filteredList = useMemo(() => {
    return seasonFiltered
      .filter((item) => {
        // Type filter (Kumite vs Kata)
        if (selectedType !== "all" && competitionType(item.category) !== selectedType) {
          return false;
        }

        // Gender filter
        if (selectedGender !== "all") {
          const lowerCat = item.category.toLowerCase();
          if (selectedGender === "nam" && !lowerCat.includes("nam")) return false;
          if (selectedGender === "nu" && !lowerCat.includes("nữ") && !lowerCat.includes("nu")) return false;
        }

        // Category filter
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
          return false;
        }

        // Search query (Athlete name, club, category)
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const inName = item.name.toLowerCase().includes(q);
          const inClub = item.club.toLowerCase().includes(q);
          const inCat = item.category.toLowerCase().includes(q);
          if (!inName && !inClub && !inCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Points desc
        if (b.points !== a.points) return b.points - a.points;
        // Medals desc
        const goldA = a.medals?.gold ?? 0;
        const goldB = b.medals?.gold ?? 0;
        if (goldB !== goldA) return goldB - goldA;
        const silverA = a.medals?.silver ?? 0;
        const silverB = b.medals?.silver ?? 0;
        if (silverB !== silverA) return silverB - silverA;
        // Rank asc
        return a.rank - b.rank;
      });
  }, [seasonFiltered, selectedType, selectedGender, selectedCategory, searchQuery]);

  // Sliced according to Top limit
  const visibleList = useMemo(() => {
    return selectedTop === 9999 ? filteredList : filteredList.slice(0, selectedTop);
  }, [filteredList, selectedTop]);

  // Top 3 for Podium
  const top3 = useMemo(() => {
    return filteredList.slice(0, 3);
  }, [filteredList]);

  // Quick stats
  const totalAthletesCount = filteredList.length;
  const topAthlete = filteredList[0];
  const maxPoints = topAthlete ? topAthlete.points : 0;
  const uniqueClubsCount = useMemo(() => {
    return new Set(filteredList.map((item) => item.club)).size;
  }, [filteredList]);

  const handleResetFilters = () => {
    setSelectedSeason("all");
    setSelectedType("all");
    setSelectedGender("all");
    setSelectedCategory("all");
    setSelectedTop(10);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedSeason !== "all" ||
    selectedType !== "all" ||
    selectedGender !== "all" ||
    selectedCategory !== "all" ||
    selectedTop !== 10 ||
    searchQuery.trim() !== "";

  return (
    <div className="ks-ranking-catalog-container">
      {/* 1. Quick Stats Metric Cards */}
      <div className="ks-events-stats-row">
        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{totalAthletesCount}</span>
            <span className="ks-stat-label">VĐV được xếp hạng</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap live">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-live" style={{ fontSize: "20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {topAthlete ? topAthlete.name : "–"}
            </span>
            <span className="ks-stat-label">Hạt giống số 1 hiện tại</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap upcoming">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-upcoming">{maxPoints}</span>
            <span className="ks-stat-label">Điểm tích lũy cao nhất</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap ended">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4" />
              <path d="M10 10h4" />
              <path d="M10 14h4" />
              <path d="M10 18h4" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{uniqueClubsCount}</span>
            <span className="ks-stat-label">Câu lạc bộ / Đơn vị</span>
          </div>
        </div>
      </div>

      {/* 2. Podium Section for Top 3 Contenders */}
      {top3.length >= 3 && !searchQuery && selectedCategory === "all" && (
        <section className="ks-ranking-podium-section" aria-label="Top 3 VĐV dẫn đầu">
          <div className="ks-podium-header">
            <span className="ks-podium-tag">TOP 3 HẠT GIỐNG DẪN ĐẦU</span>
            <h2 className="ks-podium-title">Vinh Danh Vận Động Viên Xuất Sắc</h2>
            <p className="ks-podium-desc">Gương mặt tiêu biểu dẫn đầu bảng tổng sắp điểm tích lũy quốc gia & phong trào K-SPORT</p>
          </div>

          <div className="ks-ranking-podium-grid">
            {/* Rank 2 - Silver */}
            <article className="ks-podium-card is-rank-2">
              <div className="ks-podium-step-badge silver">
                <span className="ks-podium-medal-icon">🥈</span>
                <span className="ks-podium-rank-num">Hạng 2</span>
              </div>
              <div className="ks-podium-avatar-wrap">
                <div className="ks-podium-avatar-circle silver">
                  <span>{top3[1].name.slice(-1)}</span>
                </div>
              </div>
              <h3 className="ks-podium-athlete-name">
                <Link href={`/athletes/${top3[1].athleteId}`}>{top3[1].name}</Link>
              </h3>
              <p className="ks-podium-club">{top3[1].club}</p>
              <div className="ks-podium-category-chip">{top3[1].category}</div>
              <div className="ks-podium-points-box">
                <strong>{top3[1].points}</strong>
                <span>điểm</span>
              </div>
              <div className="ks-podium-stats">
                {athleteMap.get(top3[1].athleteId) && (
                  <span>
                    Thắng {athleteMap.get(top3[1].athleteId)?.wins}/{athleteMap.get(top3[1].athleteId)?.totalMatches} trận ({athleteMap.get(top3[1].athleteId)?.winRate}%)
                  </span>
                )}
              </div>
              <Link href={`/athletes/${top3[1].athleteId}`} className="ks-podium-profile-link">
                Xem hồ sơ VĐV →
              </Link>
            </article>

            {/* Rank 1 - Gold (Center / Elevated) */}
            <article className="ks-podium-card is-rank-1">
              <div className="ks-podium-crown-badge">★ QUÁN QUÂN BẢNG ĐIỂM ★</div>
              <div className="ks-podium-step-badge gold">
                <span className="ks-podium-medal-icon">🥇</span>
                <span className="ks-podium-rank-num">Hạng 1</span>
              </div>
              <div className="ks-podium-avatar-wrap">
                <div className="ks-podium-avatar-circle gold">
                  <span>{top3[0].name.slice(-1)}</span>
                </div>
              </div>
              <h3 className="ks-podium-athlete-name">
                <Link href={`/athletes/${top3[0].athleteId}`}>{top3[0].name}</Link>
              </h3>
              <p className="ks-podium-club">{top3[0].club}</p>
              <div className="ks-podium-category-chip gold">{top3[0].category}</div>
              <div className="ks-podium-points-box gold">
                <strong>{top3[0].points}</strong>
                <span>điểm tích lũy</span>
              </div>
              <div className="ks-podium-stats">
                {athleteMap.get(top3[0].athleteId) && (
                  <span>
                    Thắng {athleteMap.get(top3[0].athleteId)?.wins}/{athleteMap.get(top3[0].athleteId)?.totalMatches} trận ({athleteMap.get(top3[0].athleteId)?.winRate}%)
                  </span>
                )}
              </div>
              <Link href={`/athletes/${top3[0].athleteId}`} className="ks-podium-profile-link is-gold">
                Xem hồ sơ VĐV số 1 →
              </Link>
            </article>

            {/* Rank 3 - Bronze */}
            <article className="ks-podium-card is-rank-3">
              <div className="ks-podium-step-badge bronze">
                <span className="ks-podium-medal-icon">🥉</span>
                <span className="ks-podium-rank-num">Hạng 3</span>
              </div>
              <div className="ks-podium-avatar-wrap">
                <div className="ks-podium-avatar-circle bronze">
                  <span>{top3[2].name.slice(-1)}</span>
                </div>
              </div>
              <h3 className="ks-podium-athlete-name">
                <Link href={`/athletes/${top3[2].athleteId}`}>{top3[2].name}</Link>
              </h3>
              <p className="ks-podium-club">{top3[2].club}</p>
              <div className="ks-podium-category-chip">{top3[2].category}</div>
              <div className="ks-podium-points-box">
                <strong>{top3[2].points}</strong>
                <span>điểm</span>
              </div>
              <div className="ks-podium-stats">
                {athleteMap.get(top3[2].athleteId) && (
                  <span>
                    Thắng {athleteMap.get(top3[2].athleteId)?.wins}/{athleteMap.get(top3[2].athleteId)?.totalMatches} trận ({athleteMap.get(top3[2].athleteId)?.winRate}%)
                  </span>
                )}
              </div>
              <Link href={`/athletes/${top3[2].athleteId}`} className="ks-podium-profile-link">
                Xem hồ sơ VĐV →
              </Link>
            </article>
          </div>
        </section>
      )}

      {/* 3. Multi-Dimensional Interactive Filter Console */}
      <div className="ks-events-filter-wrapper">
        {/* Row 1: Season Pills & View Toggle */}
        <div className="ks-filter-row-top">
          <div className="ks-filter-group">
            <span className="ks-filter-label">Mùa giải:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedSeason === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedSeason("all")}
              >
                Tất cả các năm (Tổng hợp)
              </button>
              {seasons.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`ks-filter-pill ${selectedSeason === year ? "is-active" : ""}`}
                  onClick={() => setSelectedSeason(year)}
                >
                  Năm {year}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="ks-view-toggle-wrap">
            <span className="ks-filter-label">Hiển thị:</span>
            <div className="ks-view-toggle-btns">
              <button
                type="button"
                className={`ks-toggle-btn ${viewMode === "table" ? "is-active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Xem dạng bảng chi tiết"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>Dạng Bảng</span>
              </button>
              <button
                type="button"
                className={`ks-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Xem dạng thẻ vận động viên"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Dạng Thẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Discipline, Gender & Scope */}
        <div className="ks-filter-row-middle">
          <div className="ks-filter-group">
            <span className="ks-filter-label">Thể thức:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedType === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedType("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedType === "Kumite" ? "is-active" : ""}`}
                onClick={() => setSelectedType("Kumite")}
              >
                Kumite (Đối kháng)
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedType === "Kata" ? "is-active" : ""}`}
                onClick={() => setSelectedType("Kata")}
              >
                Kata (Quyền)
              </button>
            </div>
          </div>

          <div className="ks-filter-group">
            <span className="ks-filter-label">Giới tính:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedGender === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedGender("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedGender === "nam" ? "is-active" : ""}`}
                onClick={() => setSelectedGender("nam")}
              >
                Nam
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedGender === "nu" ? "is-active" : ""}`}
                onClick={() => setSelectedGender("nu")}
              >
                Nữ
              </button>
            </div>
          </div>

          <div className="ks-filter-group">
            <span className="ks-filter-label">Phạm vi:</span>
            <div className="ks-pills-bar">
              {[10, 32, 64].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`ks-filter-pill ${selectedTop === num ? "is-active" : ""}`}
                  onClick={() => setSelectedTop(num)}
                >
                  Top {num}
                </button>
              ))}
              <button
                type="button"
                className={`ks-filter-pill ${selectedTop === 9999 ? "is-active" : ""}`}
                onClick={() => setSelectedTop(9999)}
              >
                Tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Category Select & Search Box */}
        <div className="ks-filter-row-bottom">
          <div className="ks-filter-group" style={{ flexGrow: 1, maxWidth: "420px" }}>
            <span className="ks-filter-label">Hạng cân / Nội dung:</span>
            <select
              className="ks-event-select-dropdown"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Chọn hạng cân nội dung thi đấu"
            >
              <option value="all">Tất cả các nội dung thi đấu ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="ks-search-wrap" style={{ flexGrow: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ks-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="ks-events-search-input"
              placeholder="Tìm tên VĐV, tên CLB, đơn vị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="ks-search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Bar */}
        <div className="ks-filter-results-bar">
          <div className="ks-results-count">
            Hiển thị <strong>{visibleList.length}</strong> / {filteredList.length} vận động viên phù hợp
            {selectedSeason !== "all" && <span> · Mùa giải {selectedSeason}</span>}
            {selectedType !== "all" && <span> · {selectedType}</span>}
            {selectedCategory !== "all" && <span> · {selectedCategory}</span>}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="ks-reset-filters-btn"
              onClick={handleResetFilters}
            >
              <span>↺ Đặt lại tất cả bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Ranking Content: Table or Grid View */}
      {visibleList.length > 0 ? (
        viewMode === "table" ? (
          /* ================= TABLE VIEW ================= */
          <div className="ks-ranking-table-wrap">
            <table className="ks-ranking-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "90px", textAlign: "center" }}>Hạng</th>
                  <th scope="col">Vận động viên</th>
                  <th scope="col">Câu lạc bộ / Đơn vị</th>
                  <th scope="col" style={{ width: "160px" }}>Huy chương</th>
                  <th scope="col" style={{ width: "160px", textAlign: "center" }}>Thống kê trận</th>
                  <th scope="col" style={{ width: "140px", textAlign: "right" }}>Điểm tích lũy</th>
                  <th scope="col" style={{ width: "120px", textAlign: "center" }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {visibleList.map((entry, index) => {
                  const athlete = athleteMap.get(entry.athleteId);
                  const rankPos = index + 1;
                  const shift = entry.rankChange ?? 0;
                  const gold = entry.medals?.gold ?? 0;
                  const silver = entry.medals?.silver ?? 0;
                  const bronze = entry.medals?.bronze ?? 0;

                  return (
                    <tr key={`${entry.athleteId}-${entry.season ?? "all"}`} className={rankPos <= 3 ? `row-top-${rankPos}` : ""}>
                      {/* Rank Position */}
                      <td style={{ textAlign: "center" }}>
                        <div className="ks-rank-pos-col">
                          <span className={`ks-rank-num rank-${Math.min(rankPos, 4)}`}>
                            {rankPos}
                          </span>
                          <span
                            className={`ks-rank-shift ${
                              shift > 0 ? "is-shift-up" : shift < 0 ? "is-shift-down" : "is-shift-equal"
                            }`}
                            title={shift > 0 ? `Tăng ${shift} bậc` : shift < 0 ? `Giảm ${Math.abs(shift)} bậc` : "Không đổi"}
                          >
                            {shift > 0 ? `↑${shift}` : shift < 0 ? `↓${Math.abs(shift)}` : "–"}
                          </span>
                        </div>
                      </td>

                      {/* Athlete Info */}
                      <td>
                        <div className="ks-rank-athlete-col">
                          <div className={`ks-rank-thumb rank-${Math.min(rankPos, 4)}`}>
                            <span>{entry.name.slice(-1)}</span>
                          </div>
                          <div className="ks-rank-info">
                            <Link href={`/athletes/${entry.athleteId}`} className="ks-rank-athlete-name">
                              {entry.name}
                            </Link>
                            <span className="ks-rank-athlete-cat">{entry.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Club */}
                      <td>
                        <span className="ks-rank-club-name">{entry.club}</span>
                      </td>

                      {/* Medals */}
                      <td>
                        <div className="ks-medals-mini-row">
                          {gold > 0 && (
                            <span className="ks-medal-mini-chip gold" title={`${gold} Huy chương Vàng`}>
                              🥇 {gold}
                            </span>
                          )}
                          {silver > 0 && (
                            <span className="ks-medal-mini-chip silver" title={`${silver} Huy chương Bạc`}>
                              🥈 {silver}
                            </span>
                          )}
                          {bronze > 0 && (
                            <span className="ks-medal-mini-chip bronze" title={`${bronze} Huy chương Đồng`}>
                              🥉 {bronze}
                            </span>
                          )}
                          {gold === 0 && silver === 0 && bronze === 0 && (
                            <span className="text-muted" style={{ fontSize: "13px" }}>–</span>
                          )}
                        </div>
                      </td>

                      {/* Win Rate / Match Stats */}
                      <td style={{ textAlign: "center" }}>
                        {athlete ? (
                          <div className="ks-stats-mini-cell">
                            <strong>{athlete.wins}/{athlete.totalMatches} thắng</strong>
                            <span className="win-rate-pill">{athlete.winRate}%</span>
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "13px" }}>–</span>
                        )}
                      </td>

                      {/* Points */}
                      <td style={{ textAlign: "right" }}>
                        <div className="ks-rank-points-cell">
                          <strong>{new Intl.NumberFormat("vi-VN").format(entry.points)}</strong>
                          <span>điểm</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: "center" }}>
                        <Link href={`/athletes/${entry.athleteId}`} className="ks-rank-profile-btn" aria-label={`Xem hồ sơ ${entry.name}`}>
                          <span>Hồ sơ</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ================= GRID VIEW ================= */
          <div className="ks-ranking-grid">
            {visibleList.map((entry, index) => {
              const athlete = athleteMap.get(entry.athleteId);
              const rankPos = index + 1;
              const shift = entry.rankChange ?? 0;

              return (
                <article key={`${entry.athleteId}-${entry.season ?? "all"}`} className={`ks-rank-card ${rankPos <= 3 ? `is-top-${rankPos}` : ""}`}>
                  <div className="ks-rank-card-head">
                    <span className={`ks-rank-card-badge rank-${Math.min(rankPos, 4)}`}>
                      #{rankPos}
                    </span>
                    <span
                      className={`ks-rank-shift ${
                        shift > 0 ? "is-shift-up" : shift < 0 ? "is-shift-down" : "is-shift-equal"
                      }`}
                    >
                      {shift > 0 ? `↑ Tăng ${shift}` : shift < 0 ? `↓ Giảm ${Math.abs(shift)}` : "Hạng ổn định"}
                    </span>
                  </div>

                  <div className="ks-rank-card-body">
                    <div className={`ks-rank-thumb large rank-${Math.min(rankPos, 4)}`}>
                      <span>{entry.name.slice(-1)}</span>
                    </div>
                    <h3 className="ks-rank-card-name">
                      <Link href={`/athletes/${entry.athleteId}`}>{entry.name}</Link>
                    </h3>
                    <p className="ks-rank-card-club">{entry.club}</p>
                    <div className="ks-rank-athlete-cat">{entry.category}</div>

                    <div className="ks-rank-card-points">
                      <strong>{new Intl.NumberFormat("vi-VN").format(entry.points)}</strong>
                      <span>điểm tích lũy</span>
                    </div>

                    {athlete && (
                      <div className="ks-rank-card-stats-row">
                        <div className="stat-item">
                          <span>Trận</span>
                          <strong>{athlete.totalMatches}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Thắng</span>
                          <strong>{athlete.wins}</strong>
                        </div>
                        <div className="stat-item">
                          <span>Tỷ lệ</span>
                          <strong>{athlete.winRate}%</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ks-rank-card-foot">
                    <Link href={`/athletes/${entry.athleteId}`} className="ks-btn ks-btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                      Xem hồ sơ thi đấu →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="ks-events-empty-state">
          <div className="ks-empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Không tìm thấy vận động viên phù hợp</h3>
          <p>Không có VĐV nào khớp với điều kiện lọc mùa giải, hạng cân hoặc từ khóa đã chọn.</p>
          <button
            type="button"
            className="ks-btn ks-btn-primary"
            onClick={handleResetFilters}
          >
            Xem Tất Cả Vận Động Viên
          </button>
        </div>
      )}

      {/* 5. Points Rules Reference Box */}
      <section className="ks-ranking-rules-box" aria-labelledby="ranking-rules-title">
        <div className="ks-rules-head">
          <div className="ks-rules-icon">📋</div>
          <div>
            <h3 id="ranking-rules-title" className="ks-rules-title">Quy Chuẩn Tính Điểm Bảng Xếp Hạng K-SPORT</h3>
            <p className="ks-rules-sub">Áp dụng theo tiêu chuẩn tính điểm giải đấu chính thức của hệ thống điều hành giải Karate</p>
          </div>
        </div>

        <div className="ks-rules-grid">
          <div className="ks-rule-item">
            <div className="ks-rule-medal gold">🥇</div>
            <div className="ks-rule-text">
              <strong>Huy Chương Vàng</strong>
              <span>+100 điểm tích lũy</span>
            </div>
          </div>

          <div className="ks-rule-item">
            <div className="ks-rule-medal silver">🥈</div>
            <div className="ks-rule-text">
              <strong>Huy Chương Bạc</strong>
              <span>+70 điểm tích lũy</span>
            </div>
          </div>

          <div className="ks-rule-item">
            <div className="ks-rule-medal bronze">🥉</div>
            <div className="ks-rule-text">
              <strong>Huy Chương Đồng</strong>
              <span>+40 điểm tích lũy</span>
            </div>
          </div>

          <div className="ks-rule-item">
            <div className="ks-rule-medal part">🎖️</div>
            <div className="ks-rule-text">
              <strong>Vào Tứ Kết / Tham Gia</strong>
              <span>+20 điểm / +10 điểm</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

