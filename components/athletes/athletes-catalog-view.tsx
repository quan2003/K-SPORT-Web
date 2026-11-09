"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type AthleteDirectoryEntry, competitionType } from "@/lib/public-data";
import { AthleteAvatar } from "@/components/athlete-avatar";

interface AthletesCatalogViewProps {
  initialAthletes: AthleteDirectoryEntry[];
  initialQuery?: string;
  initialCategory?: string;
}

export function AthletesCatalogView({
  initialAthletes,
  initialQuery = "",
  initialCategory = "all",
}: AthletesCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedType, setSelectedType] = useState<string>(
    initialCategory === "Kumite" || initialCategory === "Kata" ? initialCategory : "all"
  );
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Extract unique clubs
  const clubs = useMemo(() => {
    const list = Array.from(new Set(initialAthletes.map((a) => a.club).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, "vi"));
  }, [initialAthletes]);

  // Quick stats
  const totalCount = initialAthletes.length;
  const kumiteCount = useMemo(() => {
    return initialAthletes.filter((a) =>
      a.categories.some((c) => competitionType(c) === "Kumite")
    ).length;
  }, [initialAthletes]);

  const kataCount = useMemo(() => {
    return initialAthletes.filter((a) =>
      a.categories.some((c) => competitionType(c) === "Kata")
    ).length;
  }, [initialAthletes]);

  const clubsCount = clubs.length;

  // Filtered athletes
  const filteredAthletes = useMemo(() => {
    return initialAthletes.filter((athlete) => {
      // 1. Discipline (Kumite vs Kata)
      if (selectedType !== "all") {
        const matchesType = athlete.categories.some(
          (c) => competitionType(c) === selectedType
        );
        if (!matchesType) return false;
      }

      // 2. Gender
      if (selectedGender !== "all") {
        const matchesGender = athlete.categories.some((c) => {
          const lower = c.toLowerCase();
          if (selectedGender === "nam" && lower.includes("nam")) return true;
          if (selectedGender === "nu" && (lower.includes("nữ") || lower.includes("nu"))) return true;
          return false;
        });
        if (!matchesGender) return false;
      }

      // 3. Club
      if (selectedClub !== "all" && athlete.club !== selectedClub) {
        return false;
      }

      // 4. Search Query (Name, Code, Club, Categories)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inName = athlete.name.toLowerCase().includes(q);
        const inCode = (athlete.athleteCode || athlete.id).toLowerCase().includes(q);
        const inClub = athlete.club.toLowerCase().includes(q);
        const inCats = athlete.categories.some((c) => c.toLowerCase().includes(q));
        if (!inName && !inCode && !inClub && !inCats) return false;
      }

      return true;
    });
  }, [initialAthletes, selectedType, selectedGender, selectedClub, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedGender("all");
    setSelectedClub("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedType !== "all" ||
    selectedGender !== "all" ||
    selectedClub !== "all";

  return (
    <div className="ks-athletes-catalog-container">
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
            <span className="ks-stat-number">{totalCount}</span>
            <span className="ks-stat-label">Hồ sơ vận động viên</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap live">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="m9 15 2 2 4-4" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-live">{kumiteCount}</span>
            <span className="ks-stat-label">VĐV Kumite (Đối kháng)</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap upcoming">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-upcoming">{kataCount}</span>
            <span className="ks-stat-label">VĐV Kata (Quyền pháp)</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap ended">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{clubsCount}</span>
            <span className="ks-stat-label">Câu lạc bộ trực thuộc</span>
          </div>
        </div>
      </div>

      {/* 2. Multi-Dimensional Interactive Filter Console */}
      <div className="ks-events-filter-wrapper">
        {/* Row 1: Discipline & View Mode */}
        <div className="ks-filter-row-top">
          <div className="ks-filter-group">
            <span className="ks-filter-label">Thể thức:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedType === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedType("all")}
              >
                Tất cả ({totalCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedType === "Kumite" ? "is-active" : ""}`}
                onClick={() => setSelectedType("Kumite")}
              >
                Kumite ({kumiteCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedType === "Kata" ? "is-active" : ""}`}
                onClick={() => setSelectedType("Kata")}
              >
                Kata ({kataCount})
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="ks-view-toggle-wrap">
            <span className="ks-filter-label">Hiển thị:</span>
            <div className="ks-view-toggle-btns">
              <button
                type="button"
                className={`ks-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Xem dạng thẻ hồ sơ"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Dạng Thẻ</span>
              </button>
              <button
                type="button"
                className={`ks-toggle-btn ${viewMode === "list" ? "is-active" : ""}`}
                onClick={() => setViewMode("list")}
                title="Xem dạng danh sách"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>Danh Sách</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Gender & Club */}
        <div className="ks-filter-row-middle">
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

          <div className="ks-filter-group" style={{ flexGrow: 1, maxWidth: "420px" }}>
            <span className="ks-filter-label">Đơn vị / CLB:</span>
            <select
              className="ks-event-select-dropdown"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              aria-label="Chọn câu lạc bộ đơn vị"
            >
              <option value="all">Tất cả câu lạc bộ ({clubs.length})</option>
              {clubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Search Box */}
        <div className="ks-filter-row-bottom">
          <div className="ks-search-wrap" style={{ flexGrow: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ks-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="ks-events-search-input"
              placeholder="Tìm theo họ tên VĐV, mã số, CLB, nội dung..."
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
            Hiển thị <strong>{filteredAthletes.length}</strong> / {totalCount} hồ sơ vận động viên
            {selectedType !== "all" && <span> · Thể thức {selectedType}</span>}
            {selectedClub !== "all" && <span> · {selectedClub}</span>}
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

      {/* 3. Athletes Content: Grid Mode or List Mode */}
      {filteredAthletes.length > 0 ? (
        viewMode === "grid" ? (
          /* ================= GRID VIEW ================= */
          <div className="ks-athletes-grid">
            {filteredAthletes.map((athlete) => {
              const matchesCount = athlete.totalMatches ?? 0;
              const winsCount = athlete.wins ?? 0;
              const winRate =
                matchesCount > 0
                  ? Math.round((winsCount / matchesCount) * 100)
                  : typeof athlete.winRate === "number"
                  ? athlete.winRate
                  : null;

              return (
                <article key={athlete.id} className="ks-athlete-card">
                  <div className="ks-athlete-card-top">
                    <span className="ks-athlete-code-badge">
                      {athlete.athleteCode || athlete.id.toUpperCase()}
                    </span>
                    <span className="ks-athlete-country-chip">
                      🇻🇳 {athlete.country || "VN"}
                    </span>
                  </div>

                  <div className="ks-athlete-card-avatar-wrap">
                    <AthleteAvatar
                      name={athlete.name}
                      src={athlete.image}
                      className="ks-athlete-grid-avatar"
                    />
                  </div>

                  <h3 className="ks-athlete-card-name">
                    <Link href={`/athletes/${athlete.id}`}>{athlete.name}</Link>
                  </h3>

                  <p className="ks-athlete-card-club">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                    </svg>
                    <span>{athlete.club}</span>
                  </p>

                  <div className="ks-athlete-card-cats">
                    {athlete.categories.map((cat) => (
                      <span key={cat} className="ks-athlete-cat-badge">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Quick stats row */}
                  <div className="ks-athlete-card-stats">
                    <div className="ks-stat-col">
                      <span className="stat-label">Trận đấu</span>
                      <strong className="stat-value">{matchesCount}</strong>
                    </div>
                    <div className="ks-stat-col">
                      <span className="stat-label">Trận thắng</span>
                      <strong className="stat-value text-green">{winsCount}</strong>
                    </div>
                    <div className="ks-stat-col">
                      <span className="stat-label">Tỷ lệ thắng</span>
                      <strong className="stat-value text-blue">
                        {winRate !== null ? `${winRate}%` : "—"}
                      </strong>
                    </div>
                  </div>

                  {athlete.publicResult && (
                    <div className="ks-athlete-card-badge-result">
                      ★ {athlete.publicResult}
                    </div>
                  )}

                  <div className="ks-athlete-card-foot">
                    <Link
                      href={`/athletes/${athlete.id}`}
                      className="ks-btn ks-btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <span>Xem Hồ Sơ Chi Tiết</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ================= LIST VIEW ================= */
          <div className="ks-athletes-list-wrap">
            <table className="ks-athletes-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "90px" }}>Mã VĐV</th>
                  <th scope="col">Vận động viên</th>
                  <th scope="col">Câu lạc bộ / Đơn vị</th>
                  <th scope="col">Nội dung thi đấu</th>
                  <th scope="col" style={{ width: "140px", textAlign: "center" }}>Trận thắng</th>
                  <th scope="col" style={{ width: "110px", textAlign: "center" }}>Tỷ lệ thắng</th>
                  <th scope="col" style={{ width: "120px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((athlete) => {
                  const matchesCount = athlete.totalMatches ?? 0;
                  const winsCount = athlete.wins ?? 0;
                  const winRate =
                    matchesCount > 0
                      ? Math.round((winsCount / matchesCount) * 100)
                      : typeof athlete.winRate === "number"
                      ? athlete.winRate
                      : null;

                  return (
                    <tr key={athlete.id}>
                      <td>
                        <span className="ks-athlete-code-badge small">
                          {athlete.athleteCode || athlete.id.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="ks-rank-athlete-col">
                          <AthleteAvatar
                            name={athlete.name}
                            src={athlete.image}
                            className="ks-athlete-table-avatar"
                          />
                          <div className="ks-rank-info">
                            <Link href={`/athletes/${athlete.id}`} className="ks-rank-athlete-name">
                              {athlete.name}
                            </Link>
                            <span className="ks-rank-athlete-cat">🇻🇳 {athlete.country || "Việt Nam"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ks-rank-club-name">{athlete.club}</span>
                      </td>
                      <td>
                        <div className="ks-athlete-card-cats" style={{ margin: 0 }}>
                          {athlete.categories.map((c) => (
                            <span key={c} className="ks-athlete-cat-badge">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>
                          {winsCount} / {matchesCount}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {winRate !== null ? (
                          <span className="win-rate-pill">{winRate}%</span>
                        ) : (
                          "–"
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <Link
                          href={`/athletes/${athlete.id}`}
                          className="ks-rank-profile-btn"
                          aria-label={`Xem hồ sơ ${athlete.name}`}
                        >
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
          <p>Không có VĐV nào khớp với điều kiện lọc thể thức, CLB hoặc từ khóa tìm kiếm đã chọn.</p>
          <button
            type="button"
            className="ks-btn ks-btn-primary"
            onClick={handleResetFilters}
          >
            Xem Tất Cả Vận Động Viên
          </button>
        </div>
      )}
    </div>
  );
}

