import Link from "next/link";
import { ContentImage } from "@/components/content-image";
import type { NewsItem } from "@/lib/public-data";

interface HomeNewsProps {
  news: NewsItem[];
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value)
  );

export function HomeNews({ news }: HomeNewsProps) {
  if (news.length === 0) return null;

  const leadStory = news[0];
  const secondaryStories = news.slice(1, 3);

  return (
    <section className="ks-news-section" aria-label="Tin tức và bài viết chuyên môn">
      <div className="ks-section-container">
        {/* Section Header */}
        <div className="ks-section-head">
          <div className="ks-head-left">
            <span className="ks-eyebrow-tag">HOẠT ĐỘNG PHONG TRÀO & ĐỈNH CAO</span>
            <h2 className="ks-section-title">Tin Tức & Chuyên Môn Karate</h2>
            <p className="ks-section-sub">
              Cập nhật thông báo điều lệ, tổng hợp kết quả giải và chuyển giao công nghệ thi đấu.
            </p>
          </div>
          <div className="ks-head-right">
            <Link href="/news" className="ks-link-arrow">
              <span>Xem tất cả tin bài</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* News Grid */}
        <div className="ks-news-layout">
          {/* Main Lead Story */}
          {leadStory && (
            <article className="ks-lead-news-card">
              <Link href={`/news/${leadStory.slug}`} className="ks-lead-media">
                <ContentImage
                  src={leadStory.image || "/images/karate-venue.png"}
                  alt={leadStory.title}
                  width={800}
                  height={480}
                  className="ks-lead-img"
                />
                <div className="ks-lead-overlay" />
                <span className="ks-news-category-badge">{leadStory.category}</span>
              </Link>

              <div className="ks-lead-body">
                <div className="ks-news-meta">
                  <span className="ks-news-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatDate(leadStory.publishedAt)}
                  </span>
                  <span className="ks-news-dot">·</span>
                  <span className="ks-news-read-time">3 phút đọc</span>
                </div>

                <h3 className="ks-lead-title">
                  <Link href={`/news/${leadStory.slug}`}>{leadStory.title}</Link>
                </h3>

                <p className="ks-lead-summary">{leadStory.summary}</p>

                <Link href={`/news/${leadStory.slug}`} className="ks-read-more-link">
                  Đọc toàn bộ bài viết →
                </Link>
              </div>
            </article>
          )}

          {/* Secondary News Stories Stack */}
          <div className="ks-secondary-news-stack">
            {secondaryStories.map((item) => (
              <article key={item.slug} className="ks-side-news-card">
                <Link href={`/news/${item.slug}`} className="ks-side-news-thumb">
                  <ContentImage
                    src={item.image || "/images/karate-training.png"}
                    alt={item.title}
                    width={320}
                    height={210}
                    className="ks-side-news-img"
                  />
                  <span className="ks-side-cat-badge">{item.category}</span>
                </Link>

                <div className="ks-side-news-body">
                  <div className="ks-news-meta">
                    <span className="ks-news-date">{formatDate(item.publishedAt)}</span>
                  </div>

                  <h4 className="ks-side-news-title">
                    <Link href={`/news/${item.slug}`} title={item.title}>
                      {item.title}
                    </Link>
                  </h4>

                  <p className="ks-side-news-desc">{item.summary}</p>
                </div>
              </article>
            ))}

            {/* Karate Newsletter / Community Card */}
            <div className="ks-community-card">
              <div className="ks-community-text">
                <strong>Bạn là Huấn luyện viên hoặc Trọng tài?</strong>
                <p>Nhận tài liệu điều lệ WKF mới nhất và hướng dẫn sử dụng phần mềm chấm điểm K-SPORT.</p>
                <Link href="/contact" className="ks-community-link">
                  Đăng ký nhận tài liệu chuyên môn →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
