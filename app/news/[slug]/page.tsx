import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InternalLayout } from "@/components/portal-ui";
import { ContentImage } from "@/components/content-image";
import { getNews, getNewsItem } from "@/lib/public-data";

export async function generateStaticParams() {
  return (await getNews()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const item = await getNewsItem((await params).slug);
  return item
    ? { title: `${item.title} | K-SPORT`, description: item.summary }
    : { title: "Tin tức | K-SPORT" };
}

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export default async function NewsDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, allNews] = await Promise.all([getNewsItem(slug), getNews()]);

  if (!item) notFound();

  // Related news (excluding current article)
  const relatedNews = allNews
    .filter((n) => n.slug !== slug)
    .slice(0, 3);

  return (
    <InternalLayout>
      {/* Synchronized Header Banner */}
      <section className="ks-events-hero-section ks-news-detail-hero">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            {/* Breadcrumb nav */}
            <nav className="ks-article-breadcrumbs" aria-label="Đường dẫn bài viết">
              <Link href="/">Trang chủ</Link>
              <span className="sep">/</span>
              <Link href="/news">Tin tức</Link>
              <span className="sep">/</span>
              <span className="current">{item.category}</span>
            </nav>

            <span className="ks-eyebrow-tag" style={{ marginTop: "12px" }}>
              {item.category.toUpperCase()}
            </span>

            <h1 className="ks-news-detail-title">
              {item.title}
            </h1>

            <p className="ks-events-hero-sub">
              {item.summary}
            </p>

            <div className="ks-news-detail-meta-bar">
              <span className="author">Ban Biên Tập K-SPORT</span>
              <span className="dot">·</span>
              <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
              <span className="dot">·</span>
              <span className="read-time">3 phút đọc</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Body */}
      <section className="ks-news-detail-content-section">
        <div className="ks-section-container">
          <article className="ks-news-article-wrap">
            {/* Cover image */}
            <div className="ks-news-article-cover-wrap">
              <ContentImage
                src={item.image}
                alt={item.title}
                width={1200}
                height={680}
                priority
                className="ks-news-article-cover"
              />
              <p className="ks-cover-caption">* Hình ảnh minh họa hoạt động Karate K-SPORT</p>
            </div>

            {/* Article Prose */}
            <div className="ks-news-prose">
              {item.summary && (
                <p className="ks-prose-lead">
                  {item.summary}
                </p>
              )}

              {item.body && item.body.length > 0 ? (
                item.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>Nội dung chi tiết của bản tin đang được biên tập và cập nhật từ ban tổ chức.</p>
              )}

              {/* Callout box */}
              <div className="ks-news-callout-box">
                <h4>Về Nền Tảng K-SPORT</h4>
                <p>
                  K-SPORT là giải pháp phần mềm quản lý, điều hành thi đấu Karate chuyên nghiệp tại Việt Nam. Nền tảng hỗ trợ toàn diện từ bốc thăm phân nhánh tự động, bảng điểm điện tử Tatami, số hóa thẻ VĐV cho đến phát trực tiếp diễn biến trận đấu theo tiêu chuẩn WKF.
                </p>
                <Link href="/software" className="ks-callout-link">
                  Khám phá tính năng phần mềm K-SPORT →
                </Link>
              </div>
            </div>

            {/* Back button */}
            <div className="ks-article-footer-nav">
              <Link href="/news" className="ks-btn ks-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Quay lại danh mục Tin tức</span>
              </Link>
            </div>
          </article>

          {/* Related Articles Section */}
          {relatedNews.length > 0 && (
            <aside className="ks-news-related-section" aria-label="Tin tức liên quan">
              <div className="ks-related-head">
                <span className="ks-eyebrow-tag">BẢN TIN LIÊN QUAN</span>
                <h3 className="ks-related-title">Bài Viết Khác Cùng Chuyên Mục</h3>
              </div>

              <div className="ks-news-grid">
                {relatedNews.map((related) => (
                  <article key={related.slug} className="ks-news-card">
                    <Link href={`/news/${related.slug}`} className="ks-news-card-link">
                      <div className="ks-news-card-media">
                        <ContentImage
                          src={related.image}
                          alt={related.title}
                          width={600}
                          height={380}
                          className="ks-news-card-img"
                        />
                        <span className="ks-news-card-cat-badge">{related.category}</span>
                      </div>

                      <div className="ks-news-card-body">
                        <div className="ks-news-card-meta">
                          <time dateTime={related.publishedAt}>{formatDate(related.publishedAt)}</time>
                        </div>
                        <h4 className="ks-news-card-title">{related.title}</h4>
                        <p className="ks-news-card-summary">{related.summary}</p>
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
            </aside>
          )}
        </div>
      </section>
    </InternalLayout>
  );
}
