import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentImage } from "@/components/content-image";
import { InternalLayout, MatchRows, MoreLink } from "@/components/portal-ui";
import { getEvent, getEvents, getSchedule, sortMatches } from "@/lib/public-data";
import { getSponsorsStore } from "@/lib/admin-store";

export async function generateStaticParams() {
  return (await getEvents()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getEvent((await params).slug);
  return event
    ? {
        title: `${event.name} | K-SPORT`,
        description: event.description ?? `Thông tin chính thức, lịch thi đấu và kết quả giải ${event.name}.`,
      }
    : { title: "Giải đấu | K-SPORT" };
}

function getAgeGroup(category: string) {
  const match = category.match(/(Dưới\s+\d+\s+tuổi|\d+\s*[–-]\s*\d+\s+tuổi|\d+\s+tuổi\s+trở\s+lên)/i);
  return match?.[1].replace(/\s*-\s*/g, "–") ?? "Nội dung khác";
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, schedule] = await Promise.all([getEvent(slug), getSchedule()]);
  if (!event) notFound();

  const allSponsors = getSponsorsStore();
  const eventSponsors = allSponsors.filter((s) => s.isActive && s.placements?.includes("event"));

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));

  const isLive = event.status === "Đang diễn ra";
  const isUpcoming = event.status === "Sắp diễn ra";

  const eventSchedule = sortMatches(
    schedule.filter((match) => match.eventSlug === slug || match.eventName === event.name)
  );

  const categoryGroups = Array.from(
    event.categories.reduce((groups, category) => {
      const group = getAgeGroup(category);
      groups.set(group, [...(groups.get(group) ?? []), category]);
      return groups;
    }, new Map<string, string[]>())
  );

  return (
    <InternalLayout>
      {/* 1. Event Hero Banner */}
      <section className="ks-event-detail-hero-premium">
        <div className="ks-detail-hero-bg">
          <ContentImage
            src={event.image || "/images/karate-venue.png"}
            fallbackSrc="/images/karate-venue.png"
            alt={event.name}
            width={1600}
            height={900}
            className="ks-detail-hero-bg-img"
            priority
          />
          <div className="ks-detail-hero-overlay" />
        </div>

        <div className="ks-section-container">
          <div className="ks-detail-hero-content">
            {/* Breadcrumb */}
            <nav className="ks-breadcrumb" aria-label="Đường dẫn trang">
              <Link href="/">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <Link href="/events">Giải đấu</Link>
              <span aria-hidden="true">/</span>
              <span className="current">{event.name}</span>
            </nav>

            {/* Badges Bar */}
            <div className="ks-detail-badges-bar">
              <span
                className={`ks-status-tag ${
                  isLive ? "is-live" : isUpcoming ? "is-upcoming" : "is-ended"
                }`}
              >
                {isLive && <span className="ks-pulse-dot" />}
                {event.status}
              </span>
              <span className="ks-disc-badge">{event.discipline}</span>
            </div>

            {/* Official Title */}
            <h1 className="ks-detail-hero-title">{event.name}</h1>

            {/* Facts summary */}
            <div className="ks-detail-facts-bar">
              <div className="ks-fact-item">
                <span className="ks-fact-label">Thời gian thi đấu</span>
                <span className="ks-fact-value">
                  {formatDate(event.date)}
                  {event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}
                </span>
              </div>
              <div className="ks-fact-item">
                <span className="ks-fact-label">Địa điểm tổ chức</span>
                <span className="ks-fact-value">{event.location || "Đang cập nhật"}</span>
              </div>
              <div className="ks-fact-item">
                <span className="ks-fact-label">Quy mô giải</span>
                <span className="ks-fact-value">
                  {event.categories.length > 0
                    ? `${event.categories.length} nội dung tranh tài`
                    : "Đang cập nhật"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="ks-detail-hero-actions">
              <a href="#schedule" className="ks-btn ks-btn-primary">
                <span>Lịch Thi Đấu ({eventSchedule.length} trận)</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </a>
              <a href="#categories" className="ks-btn ks-btn-outline-white">
                <span>Nội Dung Tranh Tài</span>
              </a>
              <Link href={`/schedule?event=${encodeURIComponent(event.slug)}`} className="ks-btn ks-btn-outline-white">
                <span>Xem Lịch Đấu Theo Thảm</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sub-navigation tabs */}
      <nav className="ks-detail-subnav-bar" aria-label="Nội dung trang giải đấu">
        <div className="ks-section-container">
          <div className="ks-detail-subnav-links">
            <a href="#overview">Tổng quan giải đấu</a>
            <a href="#schedule">
              Lịch thi đấu <span className="ks-nav-count">{eventSchedule.length}</span>
            </a>
            <a href="#categories">
              Nội dung thi đấu <span className="ks-nav-count">{event.categories.length}</span>
            </a>
          </div>
        </div>
      </nav>

      {/* 3. Overview Section */}
      <section id="overview" className="ks-detail-overview-section">
        <div className="ks-section-container">
          <div className="ks-detail-overview-grid">
            <div className="ks-overview-left">
              <span className="ks-eyebrow-tag">THÔNG TIN GIẢI ĐẤU</span>
              <h2 className="ks-detail-section-title">Tổng Quan & Điều Lệ</h2>
              <p className="ks-detail-desc">
                {event.description ?? "Thông tin chi tiết về điều lệ thi đấu, quy định cân ký và bốc thăm đang được ban tổ chức cập nhật trên hệ thống K-SPORT."}
              </p>

              <dl className="ks-overview-facts-grid">
                <div className="ks-overview-fact-card">
                  <dt>Trạng thái giải</dt>
                  <dd>
                    <span className={`ks-status-tag ${isLive ? "is-live" : isUpcoming ? "is-upcoming" : "is-ended"}`}>
                      {isLive && <span className="ks-pulse-dot" />}
                      {event.status}
                    </span>
                  </dd>
                </div>
                <div className="ks-overview-fact-card">
                  <dt>Thời gian</dt>
                  <dd>{formatDate(event.date)} – {formatDate(event.endDate)}</dd>
                </div>
                <div className="ks-overview-fact-card">
                  <dt>Địa điểm</dt>
                  <dd>{event.location || "Đang cập nhật"}</dd>
                </div>
                <div className="ks-overview-fact-card">
                  <dt>Thể thức tranh tài</dt>
                  <dd>{event.discipline}</dd>
                </div>
                <div className="ks-overview-fact-card">
                  <dt>Số nội dung</dt>
                  <dd>{event.categories.length} nội dung chính thức</dd>
                </div>
                <div className="ks-overview-fact-card">
                  <dt>Hệ thống điều hành</dt>
                  <dd>Phần mềm điều hành Tatami K-SPORT</dd>
                </div>
              </dl>
            </div>

            <div className="ks-overview-right">
              <div className="ks-venue-card">
                <div className="ks-venue-img-wrap">
                  <Image
                    src="/images/karate-venue.png"
                    alt={`Địa điểm thi đấu ${event.name}`}
                    width={800}
                    height={500}
                    className="ks-venue-img"
                  />
                </div>
                <div className="ks-venue-caption">
                  <h4>Địa điểm thi đấu chính thức</h4>
                  <p>{event.location || "Nhà thi đấu thể thao tiêu chuẩn quốc gia"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Schedule Section */}
      <section id="schedule" className="ks-detail-schedule-section">
        <div className="ks-section-container">
          <div className="ks-section-head">
            <div className="ks-head-left">
              <span className="ks-eyebrow-tag">LỊCH TRÌNH THẢM ĐẤU</span>
              <h2 className="ks-section-title">Lịch Thi Đấu Trực Tiếp</h2>
              <p className="ks-section-sub">
                {eventSchedule.length > 0
                  ? `Đã công bố ${eventSchedule.length} trận đấu chính thức cho giải này.`
                  : event.status === "Đã kết thúc"
                  ? "Giải đấu đã kết thúc thành công."
                  : "Lịch thi đấu từng thảm sẽ được công bố ngay sau buổi họp chuyên môn và bốc thăm."}
              </p>
            </div>
            {eventSchedule.length > 0 && (
              <div className="ks-head-right">
                <Link
                  href={`/schedule?event=${encodeURIComponent(event.slug)}`}
                  className="ks-btn ks-btn-outline-dark"
                >
                  <span>Xem bảng lịch đầy đủ theo thảm</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {eventSchedule.length > 0 ? (
            <div className="ks-event-matches-wrapper">
              <MatchRows matches={eventSchedule.slice(0, 8)} />
              {eventSchedule.length > 8 && (
                <div className="ks-schedule-more-bar" style={{ marginTop: "24px", textAlign: "center" }}>
                  <MoreLink href={`/schedule?event=${encodeURIComponent(event.slug)}`}>
                    Xem toàn bộ {eventSchedule.length} trận tại Lịch thi đấu
                  </MoreLink>
                </div>
              )}
            </div>
          ) : (
            <div className="ks-event-no-matches">
              <p>Chưa có lịch trận thi đấu công khai cho giải này.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Categories Section */}
      <section id="categories" className="ks-detail-categories-section">
        <div className="ks-section-container">
          <div className="ks-section-head">
            <div className="ks-head-left">
              <span className="ks-eyebrow-tag">NỘI DUNG HUY CHƯƠNG</span>
              <h2 className="ks-section-title">Danh Sách Nội Dung Thi Đấu</h2>
              <p className="ks-section-sub">
                {event.categories.length > 0
                  ? `Tổng cộng ${event.categories.length} nội dung tranh tài được phân bổ theo nhóm lứa tuổi và hạng cân.`
                  : "Nội dung thi đấu đang được cập nhật."}
              </p>
            </div>
          </div>

          {categoryGroups.length > 0 && (
            <div className="ks-category-groups-grid">
              {categoryGroups.map(([group, categories], index) => (
                <details key={group} open={index < 2} className="ks-category-group-card">
                  <summary className="ks-category-group-header">
                    <div className="ks-cat-title-wrap">
                      <span className="ks-cat-group-icon">🥋</span>
                      <strong className="ks-cat-group-name">{group}</strong>
                    </div>
                    <span className="ks-cat-group-badge">{categories.length} nội dung</span>
                  </summary>
                  <ul className="ks-category-items-list">
                    {categories.map((cat) => (
                      <li key={cat} className="ks-cat-item">
                        <span className="ks-cat-check">✓</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Event Official Sponsors & WKF Equipment Partners */}
      {eventSponsors.length > 0 && (
        <section className="ks-detail-sponsors-section">
          <div className="ks-section-container">
            <div className="ks-section-head">
              <div className="ks-head-left">
                <span className="ks-eyebrow-tag">ĐƠN VỊ ĐỒNG HÀNH &amp; TÀI TRỢ</span>
                <h2 className="ks-section-title">Nhà Tài Trợ &amp; Võ Phục Giải Đấu</h2>
                <p className="ks-section-sub">
                  Các thương hiệu trang phục, thiết bị đạt chuẩn WKF và đơn vị tài trợ đồng hành cùng giải {event.name}.
                </p>
              </div>
            </div>

            <div className="ks-event-sponsors-grid">
              {eventSponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-event-sponsor-card"
                  title={s.name}
                >
                  <div className="ks-event-sponsor-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logo} alt={s.name} className="ks-event-sponsor-img" />
                  </div>
                  <div className="ks-event-sponsor-info">
                    <span className="ks-event-sponsor-cat">{s.category}</span>
                    <strong className="ks-event-sponsor-name">{s.name}</strong>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </InternalLayout>
  );
}
