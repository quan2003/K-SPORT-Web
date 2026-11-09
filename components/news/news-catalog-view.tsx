"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { type NewsItem } from "@/lib/public-data";
import { ContentImage } from "@/components/content-image";

interface NewsCatalogViewProps {
  initialNews: NewsItem[];
}

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export function NewsCatalogView({ initialNews }: NewsCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(initialNews.map((n) => n.category).filter(Boolean)));
    return list.sort((a, b) => a.localeCompare(b, "vi"));
  }, [initialNews]);

  // Quick stats
  const totalNewsCount = initialNews.length;
  const tourneyCount = useMemo(
    () => initialNews.filter((n) => n.category === "Giải đấu").length,
    [initialNews]
  );
  const techCount = useMemo(
    () =>
      initialNews.filter(
        (n) => n.category === "Công nghệ thể thao" || n.category === "Chuyên môn"
      ).length,
    [initialNews]
  );
  const latestDate = useMemo(() => {
    if (initialNews.length === 0) return "—";
    const sorted = [...initialNews].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return formatDate(sorted[0].publishedAt);
  }, [initialNews]);

  // Filtered news
  const filteredNews = useMemo(() => {
    return initialNews.filter((item) => {
      // 1. Category
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // 2. Search query
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.summary.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        if (!inTitle && !inSummary && !inCat) return false;
      }

      return true;
    });
  }, [initialNews, selectedCategory, query]);

  // Lead / Spotlight article (only when showing all without search query)
  const isDefaultView = selectedCategory === "all" && !query.trim();
  const leadArticle = isDefaultView ? filteredNews[0] : null;
  const standardArticles = isDefaultView ? filteredNews.slice(1) : filteredNews;

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setQuery("");
  };

  const hasActiveFilters = selectedCategory !== "all" || query.trim() !== "";

  return (
    <div className="ks-news-catalog-container">
      {/* 1. Quick Stats Metric Cards */}
      <div className="ks-events-stats-row">
        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number">{totalNewsCount}</span>
            <span className="ks-stat-label">Bản tin đã phát hành</span>
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
            <span className="ks-stat-number text-live">{tourneyCount}</span>
            <span className="ks-stat-label">Tin giải đấu & sự kiện</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap upcoming">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number text-upcoming">{techCount}</span>
            <span className="ks-stat-label">Công nghệ & chuyên môn</span>
          </div>
        </div>

        <div className="ks-event-stat-card">
          <div className="ks-stat-icon-wrap ended">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="ks-stat-body">
            <span className="ks-stat-number" style={{ fontSize: "16px", whiteSpace: "nowrap" }}>
              {latestDate}
            </span>
            <span className="ks-stat-label">Cập nhật gần nhất</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter Console */}
      <div className="ks-events-filter-wrapper">
        <div className="ks-filter-row-top">
          <div className="ks-filter-group" style={{ flexGrow: 1 }}>
            <span className="ks-filter-label">Chuyên mục:</span>
            <div className="ks-pills-bar">
              <button
                type="button"
                className={`ks-filter-pill ${selectedCategory === "all" ? "is-active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Tất cả bài viết ({totalNewsCount})
              </button>
              {categories.map((cat) => {
                const count = initialNews.filter((n) => n.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`ks-filter-pill ${selectedCategory === cat ? "is-active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="ks-filter-row-bottom">
          <div className="ks-search-wrap" style={{ flexGrow: 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="ks-search-icon">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="ks-events-search-input"
              placeholder="Tìm kiếm tiêu đề bài viết, nội dung hoạt động..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="ks-search-clear-btn"
                onClick={() => setQuery("")}
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
            Hiển thị <strong>{filteredNews.length}</strong> / {totalNewsCount} bài viết
            {selectedCategory !== "all" && <span> · Chuyên mục {selectedCategory}</span>}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="ks-reset-filters-btn"
              onClick={handleResetFilters}
            >
              <span>↺ Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Featured Editorial Spotlight (Lead Article) */}
      {leadArticle && (
        <section className="ks-news-spotlight-section" aria-label="Bản tin tiêu biểu">
          <Link href={`/news/${leadArticle.slug}`} className="ks-news-spotlight-card">
            <div className="ks-spotlight-image-wrap">
              <ContentImage
                src={leadArticle.image}
                alt={leadArticle.title}
                width={1200}
                height={680}
                priority
                className="ks-spotlight-img"
              />
              <span className="ks-spotlight-badge">★ TIÊU ĐIỂM</span>
            </div>

            <div className="ks-spotlight-content">
              <div className="ks-spotlight-meta">
                <span className="ks-news-cat-chip">{leadArticle.category}</span>
                <span className="ks-news-time-dot">·</span>
                <time className="ks-news-date" dateTime={leadArticle.publishedAt}>
                  {formatDate(leadArticle.publishedAt)}
                </time>
                <span className="ks-news-read-time">3 phút đọc</span>
              </div>

              <h2 className="ks-spotlight-title">{leadArticle.title}</h2>
              <p className="ks-spotlight-excerpt">{leadArticle.summary}</p>

              <div className="ks-spotlight-cta">
                <span>Đọc bài viết chi tiết</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* 4. News Articles Grid */}
      {filteredNews.length > 0 ? (
        <div className="ks-news-grid">
          {standardArticles.map((item) => (
            <article key={item.slug} className="ks-news-card">
              <Link href={`/news/${item.slug}`} className="ks-news-card-link">
                <div className="ks-news-card-media">
                  <ContentImage
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={380}
                    className="ks-news-card-img"
                  />
                  <span className="ks-news-card-cat-badge">{item.category}</span>
                </div>

                <div className="ks-news-card-body">
                  <div className="ks-news-card-meta">
                    <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                  </div>

                  <h3 className="ks-news-card-title">{item.title}</h3>
                  <p className="ks-news-card-summary">{item.summary}</p>

                  <div className="ks-news-card-foot">
                    <span>Xem bài viết</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
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
          <h3>Không tìm thấy bài viết phù hợp</h3>
          <p>Không có bản tin nào khớp với chuyên mục hoặc từ khóa tìm kiếm đã chọn.</p>
          <button
            type="button"
            className="ks-btn ks-btn-primary"
            onClick={handleResetFilters}
          >
            Xem Tất Cả Bài Viết
          </button>
        </div>
      )}
    </div>
  );
}
