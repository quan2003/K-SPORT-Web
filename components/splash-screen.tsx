"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const MIN_VISIBLE_MS = 1100;
const SESSION_KEY = "ks-splash-seen";

/**
 * Màn hình chào K-SPORT hiển thị khi mở website lần đầu trong phiên.
 * Server render sẵn overlay để không bị nháy nội dung; ẩn bằng ref/class
 * (chỉ animate opacity) sau khi trang tải xong và đủ thời gian tối thiểu.
 */
export function SplashScreen() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimum = seen ? 150 : reduced ? 300 : MIN_VISIBLE_MS;
    const startedAt = performance.now();
    let hideTimer = 0;
    let removeTimer = 0;

    const hide = () => {
      const wait = Math.max(0, minimum - (performance.now() - startedAt));
      hideTimer = window.setTimeout(() => {
        window.sessionStorage.setItem(SESSION_KEY, "1");
        root.classList.add("is-hidden");
        removeTimer = window.setTimeout(() => {
          root.hidden = true;
        }, 600);
      }, wait);
    };

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });

    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <div ref={rootRef} className="ks-splash" role="status" aria-live="polite" aria-label="Đang tải K-SPORT">
      <noscript>
        <style>{`.ks-splash{display:none!important}`}</style>
      </noscript>
      <div className="ks-splash-inner">
        <div className="ks-splash-logo">
          <Image src="/images/logo-header.png" alt="K-SPORT" width={260} height={83} priority />
        </div>
        <div className="ks-splash-track" aria-hidden="true">
          <span className="ks-splash-bar" />
        </div>
        <p className="ks-splash-text">Đang chuẩn bị sàn đấu<span className="ks-splash-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></p>
        <p className="ks-splash-sub">Cổng thông tin &amp; phần mềm quản lý giải đấu Karate</p>
      </div>
    </div>
  );
}

