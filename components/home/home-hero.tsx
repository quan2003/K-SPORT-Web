"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { PublicBanner, TournamentEvent } from "@/lib/public-data";
import { ContentImage } from "@/components/content-image";

interface HomeHeroProps {
  events: TournamentEvent[];
  banners: PublicBanner[];
}

export function HomeHero({ events, banners }: HomeHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const activeEvent = events.find((e) => e.status === "Đang diễn ra") || events[0];

  // Combine banners and featured events
  const slides = [
    {
      id: "slide-main",
      eyebrow: "CỔNG THÔNG TIN & PHẦN MỀM QUẢN LÝ GIẢI ĐẤU KARATE",
      title: "KARATE VIỆT NAM,",
      highlight: "TRONG MỘT NHỊP ĐẤU",
      desc: "Nền tảng số hóa quản lý giải đấu toàn diện — Bốc thăm phân nhánh tự động, bảng điểm điện tử Tatami và cập nhật kết quả trực tiếp chuẩn WKF.",
      image: "/images/karate-hero.png",
      primaryCta: { label: "Xem Lịch Thi Đấu", href: "/schedule" },
      secondaryCta: { label: "Khám Phá Phần Mềm", href: "/software" },
    },
    ...(activeEvent
      ? [
          {
            id: `slide-event-${activeEvent.slug}`,
            eyebrow: activeEvent.status === "Đang diễn ra" ? "GIẢI ĐẤU ĐANG DIỄN RA" : "SỰ KIỆN NỔI BẬT",
            title: activeEvent.name,
            highlight: "",
            desc: activeEvent.description || `${activeEvent.location} · Tranh tài nội dung ${activeEvent.discipline}. Cập nhật trực tiếp trên K-SPORT.`,
            image: activeEvent.image || "/images/karate-venue.png",
            primaryCta: { label: "Xem Sơ Đồ & Lịch Đấu", href: `/events/${activeEvent.slug}` },
            secondaryCta: { label: "Bảng Xếp Hạng", href: "/ranking" },
          },
        ]
      : []),
    ...banners.map((b) => ({
      id: `slide-banner-${b.id}`,
      eyebrow: b.eyebrow || "THÔNG BÁO TỪ K-SPORT",
      title: b.title,
      highlight: "",
      desc: b.description,
      image: b.image || "/images/karate-venue.png",
      primaryCta: { label: b.primaryLabel || "Khám phá", href: b.primaryHref || "/events" },
      secondaryCta: { label: b.secondaryLabel || "Chi tiết", href: b.secondaryHref || "/software" },
    })),
  ].slice(0, 4);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <section className="ks-hero-wrapper" aria-label="K-SPORT Hero Showcase">
      {/* Background slide images with crossfade */}
      <div className="ks-hero-media">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`ks-hero-media-item ${idx === activeSlide ? "is-active" : ""}`}
            aria-hidden={idx !== activeSlide}
          >
            {s.image.startsWith("/images/") ? (
              <Image
                src={s.image}
                alt=""
                fill
                priority={idx === 0}
                className="ks-hero-bg-img"
                sizes="100vw"
              />
            ) : (
              <ContentImage
                src={s.image}
                alt=""
                width={1920}
                height={1080}
                className="ks-hero-bg-img"
              />
            )}
            <div className="ks-hero-overlay" />
          </div>
        ))}
      </div>

      <div className="ks-hero-container">
        <div className="ks-hero-content">
          {/* Eyebrow badge */}
          <div className="ks-hero-badge-wrap">
            <span className="ks-hero-badge">
              <span className="ks-pulse-dot" />
              {current.eyebrow}
            </span>
          </div>

          {/* Heading */}
          <h1 className="ks-hero-title">
            {current.title}{" "}
            {current.highlight && <span className="ks-text-gradient">{current.highlight}</span>}
          </h1>

          {/* Description */}
          <p className="ks-hero-desc">{current.desc}</p>

          {/* Action buttons */}
          <div className="ks-hero-actions">
            <Link href={current.primaryCta.href} className="ks-btn ks-btn-primary">
              <span>{current.primaryCta.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href={current.secondaryCta.href} className="ks-btn ks-btn-outline">
              <span>{current.secondaryCta.label}</span>
            </Link>
          </div>

          {/* Slide navigation indicators */}
          {slides.length > 1 && (
            <div className="ks-hero-dots" role="tablist" aria-label="Chọn banner">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeSlide}
                  aria-label={`Slide ${idx + 1}`}
                  className={`ks-hero-dot ${idx === activeSlide ? "is-active" : ""}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Tournament Spotlight Card on Hero */}
        {activeEvent && (
          <div className="ks-hero-spotlight">
            <div className="ks-spotlight-card">
              <div className="ks-spotlight-header">
                <span className="ks-status-tag is-live">
                  <span className="ks-pulse-dot" />
                  {activeEvent.status}
                </span>
                <span className="ks-spotlight-disc">{activeEvent.discipline}</span>
              </div>
              <h2 className="ks-spotlight-title">{activeEvent.name}</h2>
              <div className="ks-spotlight-meta">
                <div className="ks-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>
                    {new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(activeEvent.date))}
                    {activeEvent.endDate && activeEvent.endDate !== activeEvent.date ? ` – ${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(activeEvent.endDate))}` : ""}
                  </span>
                </div>
                <div className="ks-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">{activeEvent.location}</span>
                </div>
              </div>
              <div className="ks-spotlight-footer">
                <Link href={`/events/${activeEvent.slug}`} className="ks-spotlight-btn">
                  <span>Vào Trang Giải Đấu</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Action Strip under Hero */}
      <nav className="ks-feature-strip" aria-label="Lối tắt chính">
        <div className="ks-feature-strip-inner">
          <Link href="/schedule" className="ks-strip-item">
            <div className="ks-strip-icon">⏱️</div>
            <div className="ks-strip-text">
              <strong>Lịch Thi Đấu & Thảm</strong>
              <span>Tra cứu thứ tự trận và phân bổ thảm 1, 2, 3</span>
            </div>
            <span className="ks-strip-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/events" className="ks-strip-item">
            <div className="ks-strip-text">
              <strong>Giải Đấu Karate</strong>
              <span>Các giải đang diễn ra và sắp khởi tranh</span>
            </div>
            <span className="ks-strip-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/athletes" className="ks-strip-item">
            <div className="ks-strip-text">
              <strong>Thẻ VĐV & Tra Cứu Số Hóa</strong>
              <span>Tra cứu hồ sơ, góc đai Aka/Ao và lịch cá nhân trên laptop</span>
            </div>
            <span className="ks-strip-arrow" aria-hidden="true">→</span>
          </Link>
          <Link href="/ranking" className="ks-strip-item">
            <div className="ks-strip-icon">🏆</div>
            <div className="ks-strip-text">
              <strong>Bảng Xếp Hạng & Điểm Số</strong>
              <span>Bảng tổng sắp huy chương và điểm tích lũy</span>
            </div>
            <span className="ks-strip-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </section>
  );
}
