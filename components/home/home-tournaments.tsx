import Link from "next/link";
import { ContentImage } from "@/components/content-image";
import type { TournamentEvent } from "@/lib/public-data";

interface HomeTournamentsProps {
  events: TournamentEvent[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value)
  );

const formatShortDate = (value: string) => {
  const d = new Date(value);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return { day, month, year: d.getFullYear() };
};

export function HomeTournaments({ events }: HomeTournamentsProps) {
  if (events.length === 0) return null;

  const featured = events[0];
  const otherEvents = events.slice(1, 4);

  return (
    <section className="ks-tournaments-section" aria-label="Danh sách giải đấu">
      <div className="ks-section-container">
        {/* Section Header */}
        <div className="ks-section-head">
          <div className="ks-head-left">
            <span className="ks-eyebrow-tag">LỊCH TRÌNH THI ĐẤU</span>
            <h2 className="ks-section-title">Hệ Thống Giải Đấu Karate Toàn Quốc</h2>
            <p className="ks-section-sub">
              Thông tin thời gian, địa điểm, điều lệ thi đấu và công bố phân nhánh từ ban tổ chức.
            </p>
          </div>
          <div className="ks-head-right">
            <Link href="/events" className="ks-link-arrow">
              <span>Xem tất cả giải đấu</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="ks-tournaments-layout">
          {/* Featured Event Card */}
          {featured && (
            <article className="ks-event-featured-card">
              <div className="ks-featured-media">
                <ContentImage
                  src={featured.image || "/images/karate-venue.png"}
                  fallbackSrc="/images/karate-venue.png"
                  alt={featured.name}
                  width={900}
                  height={550}
                  className="ks-featured-img"
                />
                <div className="ks-featured-badge-bar">
                  <span
                    className={`ks-status-tag ${
                      featured.status === "Đang diễn ra"
                        ? "is-live"
                        : featured.status === "Sắp diễn ra"
                        ? "is-upcoming"
                        : "is-ended"
                    }`}
                  >
                    {featured.status === "Đang diễn ra" && <span className="ks-pulse-dot" />}
                    {featured.status}
                  </span>
                  <span className="ks-disc-badge">{featured.discipline}</span>
                </div>
              </div>

              <div className="ks-featured-body">
                <div className="ks-featured-date-loc">
                  <span className="ks-date-inline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(featured.date)}
                    {featured.endDate && featured.endDate !== featured.date ? ` – ${formatDate(featured.endDate)}` : ""}
                  </span>
                  <span className="ks-loc-inline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {featured.location}
                  </span>
                </div>

                <h3 className="ks-featured-title">
                  <Link href={`/events/${featured.slug}`}>{featured.name}</Link>
                </h3>

                {featured.description && (
                  <p className="ks-featured-desc">{featured.description}</p>
                )}

                {featured.categories && featured.categories.length > 0 && (
                  <div className="ks-featured-cat-tags">
                    {featured.categories.slice(0, 4).map((cat) => (
                      <span key={cat} className="ks-cat-tag">
                        {cat}
                      </span>
                    ))}
                    {featured.categories.length > 4 && (
                      <span className="ks-cat-tag is-more">
                        +{featured.categories.length - 4} nội dung khác
                      </span>
                    )}
                  </div>
                )}

                <div className="ks-featured-actions">
                  <Link href={`/events/${featured.slug}`} className="ks-btn ks-btn-primary">
                    <span>Xem Chi Tiết & Sơ Đồ</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                  <Link href="/schedule" className="ks-btn ks-btn-outline-dark">
                    <span>Lịch Đấu Các Thảm</span>
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Side Events List */}
          <div className="ks-events-side-list">
            <h4 className="ks-side-list-title">Các giải đấu tiếp theo</h4>

            {otherEvents.map((event) => {
              const dateObj = formatShortDate(event.date);
              return (
                <article key={event.slug} className="ks-side-event-card">
                  <div className="ks-date-block">
                    <span className="ks-date-day">{dateObj.day}</span>
                    <span className="ks-date-month">Th{dateObj.month}</span>
                  </div>

                  <div className="ks-side-event-info">
                    <div className="ks-side-meta">
                      <span
                        className={`ks-status-dot-tag ${
                          event.status === "Đang diễn ra"
                            ? "is-live"
                            : event.status === "Sắp diễn ra"
                            ? "is-upcoming"
                            : "is-ended"
                        }`}
                      >
                        {event.status}
                      </span>
                      <span className="ks-side-disc">{event.discipline}</span>
                    </div>

                    <h4 className="ks-side-event-name">
                      <Link href={`/events/${event.slug}`} title={event.name}>
                        {event.name}
                      </Link>
                    </h4>

                    <p className="ks-side-loc">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {event.location}
                    </p>
                  </div>

                  <Link
                    href={`/events/${event.slug}`}
                    className="ks-side-link-btn"
                    aria-label={`Xem giải ${event.name}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </article>
              );
            })}

            <div className="ks-organize-card">
              <div className="ks-organize-content">
                <strong>Bạn muốn tổ chức giải đấu trên K-SPORT?</strong>
                <p>Hỗ trợ thiết lập hệ thống bốc thăm, điều hành bảng điểm điện tử và xuất chứng nhận.</p>
                <Link href="/contact" className="ks-organize-link">
                  Đăng ký hỗ trợ giải đấu →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

