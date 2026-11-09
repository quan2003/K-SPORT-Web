"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ContentImage } from "@/components/content-image";
import type { TournamentEvent } from "@/lib/public-data";

interface EventsCatalogViewProps {
  initialEvents: TournamentEvent[];
  initialStatus?: string;
  initialYear?: string;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const getEventYear = (dateStr: string) => {
  const match = dateStr.match(/^\d{4}/);
  return match ? match[0] : new Date(dateStr).getFullYear().toString();
};

export function EventsCatalogView({
  initialEvents,
  initialStatus = "all",
  initialYear = "all",
}: EventsCatalogViewProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all available years from events, sorted descending
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    for (const ev of initialEvents) {
      if (ev.date) yearsSet.add(getEventYear(ev.date));
    }
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [initialEvents]);

  // Overall counts for quick stats
  const totalCount = initialEvents.length;
  const liveCount = initialEvents.filter((e) => e.status === "Đang diễn ra").length;
  const upcomingCount = initialEvents.filter((e) => e.status === "Sắp diễn ra").length;
  const endedCount = initialEvents.filter((e) => e.status === "Đã kết thúc").length;

  // Filtered list
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // 1. Status Filter
      if (selectedStatus !== "all" && event.status !== selectedStatus) {
        return false;
      }
      // 2. Year Filter (Thay thế lọc theo nội dung)
      if (selectedYear !== "all") {
        const evYear = getEventYear(event.date);
        if (evYear !== selectedYear) return false;
      }
      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inName = event.name.toLowerCase().includes(q);
        const inLocation = (event.location || "").toLowerCase().includes(q);
        const inDiscipline = (event.discipline || "").toLowerCase().includes(q);
        if (!inName && !inLocation && !inDiscipline) return false;
      }
      return true;
    });
  }, [initialEvents, selectedStatus, selectedYear, searchQuery]);

  const handleResetFilters = () => {
    setSelectedStatus("all");
    setSelectedYear("all");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStatus !== "all" || selectedYear !== "all" || searchQuery.trim() !== "";

  // Identify featured event (prefer live, then upcoming, or first event when viewing all)
  const featuredEvent = useMemo(() => {
    if (filteredEvents.length === 0) return null;
    return (
      filteredEvents.find((e) => e.status === "Đang diễn ra") ||
      filteredEvents.find((e) => e.status === "Sắp diễn ra") ||
      filteredEvents[0]
    );
  }, [filteredEvents]);

  // Remaining events in grid excluding featured card if featured is shown at top
  const gridEvents = useMemo(() => {
    if (!featuredEvent) return filteredEvents;
    // When searching or heavily filtered, keep all in grid for clear overview
    if (filteredEvents.length <= 3) return filteredEvents;
    return filteredEvents.filter((e) => e.slug !== featuredEvent.slug);
  }, [filteredEvents, featuredEvent]);

  return (
    <div className="ks-events-catalog-container">
      {/* 1. Quick Stats Metric Cards */}
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
            <span className="ks-stat-number">{totalCount}</span>
            <span className="ks-stat-label">Tổng số giải đấu</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap live">
            <span className="ks-pulse-dot" />
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-live">{liveCount}</span>
            <span className="ks-stat-label">Đang thi đấu trực tiếp</span>
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
            <span className="ks-stat-number text-upcoming">{upcomingCount}</span>
            <span className="ks-stat-label">Sắp khởi tranh</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap ended">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{endedCount}</span>
            <span className="ks-stat-label">Đã hoàn thành</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter Bar: Trạng thái & Lọc theo Năm */}
      <div className="ks-events-filter-wrapper">
        <div className="ks-filter-row-top">
          {/* Status Tabs */}
          <div className="ks-filter-group">
            <span className="ks-filter-label">Trạng thái:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedStatus === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("all")}
              >
                Tất cả ({totalCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill live ${selectedStatus === "Đang diễn ra" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("Đang diễn ra")}
              >
                <span className="ks-pulse-dot" />
                Đang diễn ra ({liveCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedStatus === "Sắp diễn ra" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("Sắp diễn ra")}
              >
                Sắp diễn ra ({upcomingCount})
              </button>
              <button
                type="button"
                className={`ks-filter-pill ${selectedStatus === "Đã kết thúc" ? "is-active" : ""}`}
                onClick={() => setSelectedStatus("Đã kết thúc")}
              >
                Đã kết thúc ({endedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Lọc theo Năm & Ô tìm kiếm */}
        <div className="ks-filter-row-bottom">
          <div className="ks-filter-group">
            <span className="ks-filter-label">Lọc theo năm:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedYear === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedYear("all")}
              >
                Tất cả các năm
              </button>
              {availableYears.map((yr) => {
                const countInYear = initialEvents.filter((e) => getEventYear(e.date) === yr).length;
                return (
                  <button
                    key={yr}
                    type="button"
                    className={`ks-filter-pill ${selectedYear === yr ? "is-active" : ""}`}
                    onClick={() => setSelectedYear(yr)}
                  >
                    Năm {yr} ({countInYear})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search box */}
          <div className="ks-search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ks-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="ks-events-search-input"
              placeholder="Tìm tên giải, địa điểm, tỉnh thành..."
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

        {/* Results Info & Active Filters Bar */}
        <div className="ks-filter-results-bar">
          <div className="ks-results-count">
            Hiển thị <strong>{filteredEvents.length}</strong> giải đấu phù hợp
            {selectedYear !== "all" && <span> · Mùa giải <strong>{selectedYear}</strong></span>}
            {selectedStatus !== "all" && <span> · Trạng thái <strong>{selectedStatus}</strong></span>}
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

      {/* 3. Featured Tournament Spotlight (shown when viewing all or when featured is live/upcoming) */}
      {featuredEvent && filteredEvents.length > 3 && (
        <div className="ks-events-spotlight-section">
          <div className="ks-spotlight-ribbon">
            <span className="ks-ribbon-tag">GIẢI ĐẤU TIÊU BIỂU</span>
          </div>

          <article className="ks-event-featured-card">
            <div className="ks-featured-media">
              <ContentImage
                src={featuredEvent.image || "/images/karate-venue.png"}
                fallbackSrc="/images/karate-venue.png"
                alt={featuredEvent.name}
                width={1200}
                height={600}
                className="ks-featured-img"
                priority
              />
              <div className="ks-featured-badge-bar">
                <span
                  className={`ks-status-tag ${
                    featuredEvent.status === "Đang diễn ra"
                      ? "is-live"
                      : featuredEvent.status === "Sắp diễn ra"
                      ? "is-upcoming"
                      : "is-ended"
                  }`}
                >
                  {featuredEvent.status === "Đang diễn ra" && <span className="ks-pulse-dot" />}
                  {featuredEvent.status}
                </span>
                <span className="ks-disc-badge">{featuredEvent.discipline}</span>
                <span className="ks-year-badge">Mùa giải {getEventYear(featuredEvent.date)}</span>
              </div>
            </div>

            <div className="ks-featured-body">
              <div className="ks-featured-date-loc">
                <span className="ks-date-inline">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(featuredEvent.date)}
                  {featuredEvent.endDate && featuredEvent.endDate !== featuredEvent.date
                    ? ` – ${formatDate(featuredEvent.endDate)}`
                    : ""}
                </span>
                <span className="ks-loc-inline">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {featuredEvent.location}
                </span>
              </div>

              <h2 className="ks-featured-title">
                <Link href={`/events/${featuredEvent.slug}`}>
                  {featuredEvent.name}
                </Link>
              </h2>

              <p className="ks-featured-desc">{featuredEvent.description}</p>

              {featuredEvent.categories && featuredEvent.categories.length > 0 && (
                <div className="ks-featured-cat-tags">
                  <span className="ks-cat-count-pill">
                    {featuredEvent.categories.length} nội dung tranh tài
                  </span>
                  {featuredEvent.categories.slice(0, 4).map((cat) => (
                    <span key={cat} className="ks-cat-chip">
                      {cat}
                    </span>
                  ))}
                  {featuredEvent.categories.length > 4 && (
                    <span className="ks-cat-chip more">
                      +{featuredEvent.categories.length - 4} nội dung khác
                    </span>
                  )}
                </div>
              )}

              <div className="ks-featured-actions">
                <Link href={`/events/${featuredEvent.slug}`} className="ks-btn ks-btn-primary">
                  <span>Xem Chi Tiết & Lịch Đấu Giải</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
                <Link href={`/schedule?event=${featuredEvent.slug}`} className="ks-btn ks-btn-outline-dark">
                  <span>Tra Cứu Lịch Thảm</span>
                </Link>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* 4. Main Tournament Cards Grid */}
      {gridEvents.length > 0 ? (
        <div className="ks-events-main-grid">
          {gridEvents.map((event) => {
            const isLive = event.status === "Đang diễn ra";
            const isUpcoming = event.status === "Sắp diễn ra";
            const evYear = getEventYear(event.date);

            return (
              <article key={event.slug} className="ks-event-card">
                <div className="ks-event-card-media">
                  <ContentImage
                    src={event.image || "/images/karate-venue.png"}
                    fallbackSrc="/images/karate-venue.png"
                    alt={event.name}
                    width={600}
                    height={380}
                    className="ks-event-card-img"
                  />
                  <div className="ks-event-card-badges">
                    <span
                      className={`ks-status-tag ${
                        isLive ? "is-live" : isUpcoming ? "is-upcoming" : "is-ended"
                      }`}
                    >
                      {isLive && <span className="ks-pulse-dot" />}
                      {event.status}
                    </span>
                    <span className="ks-event-year-tag">Năm {evYear}</span>
                  </div>
                </div>

                <div className="ks-event-card-body">
                  <div className="ks-event-meta-top">
                    <span className="ks-event-date-text">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(event.date)}
                    </span>
                    <span className="ks-event-disc-text">{event.discipline}</span>
                  </div>

                  <h3 className="ks-event-card-title">
                    <Link href={`/events/${event.slug}`} title={event.name}>
                      {event.name}
                    </Link>
                  </h3>

                  <p className="ks-event-card-location">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{event.location || "Đang cập nhật địa điểm"}</span>
                  </p>

                  {event.categories && event.categories.length > 0 && (
                    <div className="ks-event-card-cat-summary">
                      <span className="ks-cat-count-badge">
                        {event.categories.length} nội dung thi đấu
                      </span>
                    </div>
                  )}

                  <div className="ks-event-card-footer">
                    <Link href={`/events/${event.slug}`} className="ks-event-view-link">
                      <span>Xem chi tiết giải đấu</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="ks-events-empty-state">
          <div className="ks-empty-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3>Không tìm thấy giải đấu phù hợp</h3>
          <p>
            Không có giải đấu nào khớp với bộ lọc trạng thái hoặc năm được chọn. Vui lòng thử chọn năm khác hoặc xóa bộ lọc để xem toàn bộ hệ thống giải.
          </p>
          <button
            type="button"
            className="ks-btn ks-btn-primary"
            onClick={handleResetFilters}
          >
            Xem Tất Cả Các Giải Đấu
          </button>
        </div>
      )}
    </div>
  );
}

