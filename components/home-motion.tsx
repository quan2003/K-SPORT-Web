"use client";

import { useEffect } from "react";

export function HomeMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    document.body.classList.add("motion-ready");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));

    const hero = document.querySelector<HTMLElement>(".home-hero");
    const heroImage = document.querySelector<HTMLElement>(".home-hero > img");
    let frame = 0;
    let heroHeight = hero?.offsetHeight ?? 1;
    const updateHero = () => {
      frame = 0;
      if (!hero || !heroImage || window.innerWidth < 761) return;
      const progress = Math.min(window.scrollY / Math.max(heroHeight, 1), 1);
      heroImage.style.setProperty("--hero-drift", `${progress * 22}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHero);
    };
    const onResize = () => {
      heroHeight = hero?.offsetHeight ?? 1;
      onScroll();
    };

    updateHero();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.body.classList.remove("motion-ready");
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
