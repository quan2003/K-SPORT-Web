"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TournamentEvent } from "@/lib/public-data";

const formatDateRange = (event: TournamentEvent) => {
  const formatter = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric" });
  const start = formatter.format(new Date(event.date));
  const end = event.endDate && event.endDate !== event.date ? formatter.format(new Date(event.endDate)) : null;
  return end ? `${start} – ${end}` : start;
};

export function HomeHeroSlider({ events, children }: { events: TournamentEvent[]; children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const slides = useMemo(() => events.filter((event) => event.status !== "Đã kết thúc").slice(0, 4), [events]);
  const totalSlides = slides.length + 1;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || totalSlides < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % totalSlides), 6000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, totalSlides]);

  const move = (direction: 1 | -1) => setActive((current) => (current + direction + totalSlides) % totalSlides);
  const onBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
  };

  return (
    <section
      ref={regionRef}
      className="home-hero"
      aria-roledescription="carousel"
      aria-label="Banner K-SPORT và giải đấu"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}
    >
      <div className="home-slides" aria-live={paused ? "polite" : "off"}>
        <div className={`home-slide${active === 0 ? " is-active" : ""}`} aria-hidden={active !== 0} inert={active !== 0}>
          <Image className="home-slide-image" src="/images/karate-hero.png" alt="Hai võ sĩ Karate thi đấu trên thảm" fill sizes="100vw" priority />
          <div className="hero-content">
            {/* taste-skill-ignore: brand slide keeps the existing product eyebrow required by the brief. */}
            <p className="hero-eyebrow" data-reveal>Cổng thông tin và phần mềm quản lý giải đấu Karate</p> {/* taste-skill-ignore */}
            <h1 data-reveal>Karate Việt Nam,<br /><span>trong một nhịp đấu.</span></h1>
            <p data-reveal>Kết nối giải đấu – vận hành chuyên nghiệp – lan tỏa tinh thần Karate vì một cộng đồng mạnh mẽ hơn.</p>
            <div className="hero-actions" data-reveal><Link className="button red" href="/events">Xem giải đấu <span aria-hidden="true">→</span></Link><Link className="text-action" href="/software">Tìm hiểu phần mềm</Link></div>
          </div>
        </div>
        {slides.map((event, index) => {
          const slideIndex = index + 1;
          return (
            <div className={`home-slide${active === slideIndex ? " is-active" : ""}`} aria-hidden={active !== slideIndex} inert={active !== slideIndex} key={event.slug}>
              <Image className="home-slide-image" src={event.image ?? "/images/karate-venue.png"} alt="" fill sizes="100vw" loading="lazy" />
              <div className="hero-content event-hero-content">
                <h2 data-reveal aria-label={event.name} title={event.name}>{event.name}</h2>
                <p data-reveal>{formatDateRange(event)} · {event.location}</p>
                <div className="hero-actions" data-reveal><Link className="button red" href={`/events/${event.slug}`}>Xem giải đấu <span aria-hidden="true">→</span></Link><Link className="text-action" href="/software">Tìm hiểu phần mềm</Link></div>
              </div>
            </div>
          );
        })}
      </div>
      {totalSlides > 1 ? <div className="home-slider-controls" aria-label="Điều khiển banner">
        <button type="button" className="home-slider-arrow" onClick={() => move(-1)} aria-label="Banner trước">←</button>
        <div className="home-slider-dots" role="tablist" aria-label="Chọn banner">
          {Array.from({ length: totalSlides }, (_, index) => <button type="button" role="tab" aria-selected={active === index} aria-label={`Banner ${index + 1}`} className={active === index ? "is-active" : ""} onClick={() => setActive(index)} key={index} />)}
        </div>
        <button type="button" className="home-slider-arrow" onClick={() => move(1)} aria-label="Banner sau">→</button>
      </div> : null}
      {children}
    </section>
  );
}
