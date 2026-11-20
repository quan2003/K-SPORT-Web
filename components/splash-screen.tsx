"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Màn hình chào K-SPORT hiển thị khi mở website lần đầu trong phiên.
 * Server render sẵn overlay để không bị nháy nội dung; ẩn bằng ref/class
 * (chỉ animate opacity) ngay khi trình duyệt báo trang và tài nguyên đã sẵn sàng.
 */
export function SplashScreen() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let removeTimer = 0;

    const hide = () => {
      root.classList.add("is-hidden");
      removeTimer = window.setTimeout(() => {
        root.hidden = true;
      }, 600);
    };

    const hideWhenReady = () => {
      void document.fonts.ready.then(() => window.requestAnimationFrame(hide));
    };

    if (document.readyState === "complete") hideWhenReady();
    else window.addEventListener("load", hideWhenReady, { once: true });

    return () => {
      window.removeEventListener("load", hideWhenReady);
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
          <Image src="/images/logo-header.png" alt="K-SPORT" width={260} height={83} style={{ height: "auto" }} priority />
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
