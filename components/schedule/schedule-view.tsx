"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { competitionType, getMatDisplayName, getTatamiColorClass, type Match, type TournamentEvent } from "@/lib/public-data";
import type { SponsorItem } from "@/lib/admin-store";

interface ScheduleViewProps {
  initialMatches: Match[];
  events: TournamentEvent[];
  initialEvent?: string;
  initialTatami?: string;
  initialStatus?: string;
}

export function ScheduleView({
  initialMatches,
  events,
  initialEvent = "all",
  initialTatami = "all",
  initialStatus = "all",
}: ScheduleViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>(initialEvent);
  const [selectedTatami, setSelectedTatami] = useState<string>(initialTatami);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [tatamiSponsors, setTatamiSponsors] = useState<SponsorItem[]>([]);

  useEffect(() => {
    let cancel = false;
    fetch("/api/public/sponsors")
      .then((res) => res.json())
      .then((data) => {
        if (!cancel && Array.isArray(data.items)) {
          setTatamiSponsors(data.items.filter((item: SponsorItem) => item.placements?.includes("tatami")));
        }
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  // Filter out finished events by slug
  const endedEvents = useMemo(() => events.filter((e) => e.status === "Đã kết thúc"), [events]);
  const endedEventSlugs = useMemo(() => new Set(endedEvents.map((e) => e.slug)), [endedEvents]);
  const endedEventNames = useMemo(() => new Set(endedEvents.map((e) => e.name)), [endedEvents]);

  // Active tournaments
  const activeEvents = useMemo(() => events.filter((e) => e.status !== "Đã kết thúc"), [events]);

  // Is selected event finished?
  const isSelectedEventEnded = useMemo(() => {
    if (selectedEvent === "all") return false;
    const current = events.find((e) => e.slug === selectedEvent);
    return current ? current.status === "Đã kết thúc" : false;
  }, [events, selectedEvent]);

  // Base matches based on tournament selection
  const baseMatches = useMemo(() => {
    if (selectedEvent === "all") {
      // By default keep current and upcoming active matches
      return initialMatches.filter((match) => {
        if (match.eventSlug && endedEventSlugs.has(match.eventSlug)) return false;
        if (match.eventName && endedEventNames.has(match.eventName)) return false;
        return true;
      });
    }
    return initialMatches.filter((match) => match.eventSlug === selectedEvent);
  }, [initialMatches, selectedEvent, endedEventSlugs, endedEventNames]);

  // Extract unique tatamis numerically sorted
  const tatamis = useMemo(() => {
    const list = Array.from(new Set(baseMatches.map((m) => m.tatami).filter(Boolean)));
    return list.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b, "vi");
    });
  }, [baseMatches]);

  // Quick stats numbers
  const totalMatchesCount = baseMatches.length;
  const liveMatchesCount = baseMatches.filter((m) => m.state === "Đang thi đấu").length;
  const upcomingMatchesCount = baseMatches.filter((m) => m.state === "Sắp diễn ra").length;
  const activeTatamisCount = tatamis.length;

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return baseMatches.filter((match) => {
      // 1. Tatami
      if (selectedTatami !== "all" && match.tatami !== selectedTatami) {
        return false;
      }
      // 2. Status
      if (selectedStatus !== "all" && match.state !== selectedStatus) {
        return false;
      }
      // 3. Type (Kumite / Kata)
      if (selectedType !== "all" && competitionType(match.category) !== selectedType) {
        return false;
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inRed = (match.red || "").toLowerCase().includes(q);
        const inBlue = (match.blue || "").toLowerCase().includes(q);
        const inCat = (match.category || "").toLowerCase().includes(q);
        const inTatami = (match.tatami || "").toLowerCase().includes(q);
        if (!inRed && !inBlue && !inCat && !inTatami) return false;
      }
      return true;
    });
  }, [baseMatches, selectedTatami, selectedStatus, selectedType, searchQuery]);

  const handleResetFilters = () => {
    setSelectedEvent("all");
    setSelectedTatami("all");
    setSelectedStatus("all");
    setSelectedType("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedEvent !== "all" ||
    selectedTatami !== "all" ||
    selectedStatus !== "all" ||
    selectedType !== "all" ||
    searchQuery.trim() !== "";

  return (
    <div className="ks-schedule-catalog-container">
      {/* 1. Quick Stats Metric Cards (Synchronized with /events) */}
      <div className="ks-events-stats-row">
        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{totalMatchesCount}</span>
            <span className="ks-stat-label">Tổng số trận đấu</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap live">
            <span className="ks-pulse-dot" />
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-live">{liveMatchesCount}</span>
            <span className="ks-stat-label">Trận đang đấu trên thảm</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap upcoming">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-upcoming">{upcomingMatchesCount}</span>
            <span className="ks-stat-label">Trận sắp bước vào thảm</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap ended">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{activeTatamisCount}</span>
            <span className="ks-stat-label">Thảm đấu hoạt động</span>
          </div>
        </div>
      </div>

      {/* 2. Multi-Dimensional Interactive Filter Console */}
      <div className="ks-events-filter-wrapper">
        {/* Row 1: Tournament Selector & View Switcher */}
        <div className="ks-filter-row-top">
          <div className="ks-filter-group" style={{ flexGrow: 1, maxWidth: "600px" }}>
            <span className="ks-filter-label">Giải đấu:</span>
            <select
              className="ks-event-select-dropdown"
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                setSelectedTatami("all");
              }}
              aria-label="Chọn giải đấu"
            >
              <option value="all">
                {activeEvents.length > 0
                  ? "Tất cả các giải đang & sắp diễn ra"
                  : "Tất cả giải đấu công khai"}
              </option>
              {activeEvents.length > 0 && (
                <optgroup label="Giải đang & sắp khởi tranh">
                  {activeEvents.map((item) => (
                    <option value={item.slug} key={item.slug}>
                      {item.name} ({item.status})
                    </option>
                  ))}
                </optgroup>
              )}
              {endedEvents.length > 0 && (
                <optgroup label="Giải đã kết thúc (Lưu trữ lịch)">
                  {endedEvents.map((item) => (
                    <option value={item.slug} key={item.slug}>
                      {item.name} · Đã kết thúc
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="ks-view-toggle-wrap">
            <span className="ks-filter-label">Hiển thị:</span>
            <div className="ks-view-toggle-btns">
              <button
                type="button"
                className={`ks-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Xem dạng thẻ sàn đấu"
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
            </div>
          </div>
        </div>

        {/* Row 2: Tatami Pills Bar */}
        <div className="ks-filter-row-middle">
          <div className="ks-filter-group">
            <span className="ks-filter-label">Thảm đấu:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedTatami === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedTatami("all")}
              >
                Tất cả thảm ({baseMatches.length})
              </button>
              {tatamis.map((tatami) => {
                const count = baseMatches.filter((m) => m.tatami === tatami).length;
                const displayName = getMatDisplayName(tatami);
                const colorClass = getTatamiColorClass(tatami);
                return (
                  <button
                    key={tatami}
                    type="button"
                    className={`ks-filter-pill ${colorClass} ${selectedTatami === tatami ? "is-active" : ""}`}
                    onClick={() => setSelectedTatami(tatami)}
                  >
                    <span className={`ks-tatami-indicator ${colorClass}`} aria-hidden="true" />
                    <span>{displayName}</span>
                    <span>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Status, Discipline & Search Box */}
        <div className="ks-filter-row-bottom">
          <div className="ks-filter-group">
            <span className="ks-filter-label">Trạng thái:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedStatus === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`ks-filter-pill live ${selectedStatus === "Đang thi đấu" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("Đang thi đấu")}
              >
                <span className="ks-pulse-dot" />
                Đang đấu ({liveMatchesCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedStatus === "Sắp diễn ra" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("Sắp diễn ra")}
              >
                Sắp diễn ra ({upcomingMatchesCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedStatus === "Đã kết thúc" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("Đã kết thúc")}
              >
                Đã xong
              </button>
            </div>
          </div>

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

          {/* Athlete / Category Search Input */}
          <div className="ks-search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ks-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="ks-events-search-input"
              placeholder="Tìm tên VĐV (Aka / Ao), nội dung..."
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
            Hiển thị <strong>{filteredMatches.length}</strong> trận đấu phù hợp
            {selectedTatami !== "all" && <span> · {getMatDisplayName(selectedTatami)}</span>}
            {selectedStatus !== "all" && <span> · {selectedStatus}</span>}
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

      {/* 3. Ended Tournament Notice (if user specifically selects a concluded tournament) */}
      {isSelectedEventEnded && (
        <div className="ks-schedule-ended-banner" role="status">
          <div className="ks-ended-icon-box">🏆</div>
          <div className="ks-ended-content">
            <h4>Giải đấu này đã kết thúc thành công</h4>
            <p>
              Lịch thi đấu bên dưới là dữ liệu lưu trữ lịch sử của giải. Bạn có thể xem kết quả tổng hợp, bảng huy chương và biên bản giải đấu tại trang Kết quả.
            </p>
          </div>
          <Link href={`/results?event=${selectedEvent}`} className="ks-btn ks-btn-primary">
            <span>Mở Bảng Kết Quả Giải</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      )}

      {/* 4. Official Tatami Mat Sponsors Backdrop */}
      {tatamiSponsors.length > 0 && (
        <div className="ks-tatami-backdrop-strip">
          <div className="tatami-backdrop-inner">
            <span className="tatami-backdrop-badge">WKF OFFICIAL TATAMI BACKDROP</span>
            <span className="tatami-backdrop-lbl">ĐƠN VỊ TÀI TRỢ THIẾT BỊ SÀN ĐẤU &amp; THẢM TATAMI:</span>
            <div className="tatami-backdrop-logos">
              {tatamiSponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tatami-backdrop-item"
                  title={`${s.name} — ${s.category}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt={s.name} className="tatami-backdrop-img" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Matches Output: Cards Grid Mode or Table Mode */}
      {filteredMatches.length > 0 ? (
        viewMode === "grid" ? (
          /* ================= GRID VIEW ================= */
          <div className="ks-matches-grid">
            {filteredMatches.map((match) => {
              const isLive = match.state === "Đang thi đấu";
              const isEnded = match.state === "Đã kết thúc";
              const tatamiName = getMatDisplayName(match.tatami);

              return (
                <article key={match.id} className={`ks-match-card ${isLive ? "is-match-live" : ""}`}>
                  <div className="ks-match-top">
                    <div className="ks-match-info">
                      <span className={`ks-tatami-badge ${getTatamiColorClass(match.tatami)}`}>{tatamiName}</span>
                      <span className="ks-match-time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {match.time}
                      </span>
                    </div>

                    <div className="ks-match-status-wrap">
                      {isLive ? (
                        <span className="ks-match-live-tag">
                          <span className="ks-pulse-dot" />
                          Đang đấu
                        </span>
                      ) : isEnded ? (
                        <span className="ks-match-ended-tag">Đã xong</span>
                      ) : (
                        <span className="ks-match-upcoming-tag">Sắp diễn ra</span>
                      )}
                    </div>
                  </div>

                  <div className="ks-match-category" title={match.category}>
                    {match.category}
                  </div>

                  {match.eventName && (
                    <div className="ks-match-event-name" title={match.eventName}>
                      {match.eventName}
                    </div>
                  )}

                  {/* Combatants section */}
                  <div className="ks-match-fighters">
                    {/* Aka (Red) */}
                    <div className="ks-fighter-row is-aka">
                      <div className="ks-fighter-flag">
                        <span className="ks-fighter-belt aka" />
                        <span className="ks-fighter-role">AKA</span>
                      </div>
                      <div className="ks-fighter-meta">
                        <strong className="ks-fighter-name">{match.red}</strong>
                      </div>
                      <div className="ks-fighter-score aka">
                        {match.redScore !== undefined ? match.redScore : "–"}
                      </div>
                    </div>

                    <div className="ks-match-vs-divider">
                      <span className="ks-vs-badge">VS</span>
                    </div>

                    {/* Ao (Blue) */}
                    <div className="ks-fighter-row is-ao">
                      <div className="ks-fighter-flag">
                        <span className="ks-fighter-belt ao" />
                        <span className="ks-fighter-role">AO</span>
                      </div>
                      <div className="ks-fighter-meta">
                        <strong className="ks-fighter-name">{match.blue}</strong>
                      </div>
                      <div className="ks-fighter-score ao">
                        {match.blueScore !== undefined ? match.blueScore : "–"}
                      </div>
                    </div>
                  </div>

                  {/* Footer link to scoreboard demo / live console */}
                  <div className="ks-match-card-foot">
                    <span className="ks-match-date-badge">{match.date}</span>
                    <Link href="/software" className="ks-match-live-link">
                      <span>Bảng điểm LED</span>
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
          /* ================= TABLE VIEW ================= */
          <div className="ks-schedule-table-wrap">
            <table className="ks-schedule-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "110px" }}>Thời gian</th>
                  <th scope="col" style={{ width: "100px" }}>Thảm</th>
                  <th scope="col">Nội dung thi đấu</th>
                  <th scope="col">VĐV Đỏ (AKA)</th>
                  <th scope="col" style={{ width: "50px", textAlign: "center" }}>VS</th>
                  <th scope="col">VĐV Xanh (AO)</th>
                  <th scope="col" style={{ width: "120px", textAlign: "center" }}>Tỷ số</th>
                  <th scope="col" style={{ width: "130px", textAlign: "center" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => {
                  const isLive = match.state === "Đang thi đấu";
                  const isEnded = match.state === "Đã kết thúc";

                  return (
                    <tr key={match.id} className={isLive ? "row-live" : ""}>
                      <td>
                        <div className="ks-td-time">
                          <strong>{match.time}</strong>
                          <span>{match.date}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`ks-tatami-table-badge ${getTatamiColorClass(match.tatami)}`}>
                          {getMatDisplayName(match.tatami)}
                        </span>
                      </td>
                      <td>
                        <div className="ks-td-cat">
                          <strong>{match.category}</strong>
                          <span>{match.eventName ?? "Giải đấu K-SPORT"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ks-td-fighter aka">
                          <span className="ks-fighter-dot aka" />
                          <strong>{match.red}</strong>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="ks-vs-table-chip">VS</span>
                      </td>
                      <td>
                        <div className="ks-td-fighter ao">
                          <span className="ks-fighter-dot ao" />
                          <strong>{match.blue}</strong>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="ks-td-scores">
                          <span className="score aka">{match.redScore ?? "–"}</span>
                          <span className="score-sep">:</span>
                          <span className="score ao">{match.blueScore ?? "–"}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {isLive ? (
                          <span className="ks-match-live-tag">
                            <span className="ks-pulse-dot" />
                            Đang đấu
                          </span>
                        ) : isEnded ? (
                          <span className="ks-match-ended-tag">Đã xong</span>
                        ) : (
                          <span className="ks-match-upcoming-tag">Sắp diễn ra</span>
                        )}
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
          <h3>Không tìm thấy trận đấu phù hợp</h3>
          <p>
            Không có trận nào khớp với bộ lọc thảm đấu, trạng thái hoặc từ khóa tìm kiếm đã chọn. Vui lòng kiểm tra lại bộ lọc hoặc bấm nút bên dưới.
          </p>
          <button
            type="button"
            className="ks-btn ks-btn-primary"
            onClick={handleResetFilters}
          >
            Xem Tất Cả Trận Đấu
          </button>
        </div>
      )}
    </div>
  );
}

