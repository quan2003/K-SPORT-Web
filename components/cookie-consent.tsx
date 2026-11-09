"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "ks-cookie-consent";
const CHANGE_EVENT = "ks-cookie-consent-change";
const OPEN_EVENT = "ks-open-cookie-settings";
const CONSENT_VERSION = 1;

export interface CookieConsent {
  version: number;
  necessary: true;
  analytics: boolean;
  personalization: boolean;
  savedAt: string;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

// Trên server chưa biết lựa chọn của người dùng nên chưa hiển thị banner.
function getServerSnapshot(): string | null {
  return null;
}

function parseConsent(raw: string): CookieConsent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as CookieConsent;
    return value.version === CONSENT_VERSION ? value : null;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean, personalization: boolean) {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    personalization,
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Trình duyệt chặn lưu trữ: vẫn đóng banner trong phiên hiện tại.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Nút mở lại bảng tùy chọn cookie (dùng ở chân trang). */
export function CookieSettingsButton() {
  return (
    <button type="button" className="ks-cookie-footer-btn" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cài đặt cookie
    </button>
  );
}

export function CookieConsentBanner() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const consent = raw === null ? null : parseConsent(raw);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const open = () => setPrefsOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const showBanner = raw !== null && consent === null && !prefsOpen;

  return (
    <>
      {showBanner && (
        <section className="ks-cookie-banner" role="dialog" aria-modal="false" aria-labelledby="ks-cookie-title" aria-describedby="ks-cookie-desc">
          <div className="ks-cookie-main">
            <div className="ks-cookie-copy">
              <h2 id="ks-cookie-title">Chào mừng bạn đến với K-SPORT!</h2>
              <div id="ks-cookie-desc">
                <p>
                  K-SPORT sử dụng cookie của chính chúng tôi cho các mục đích thiết yếu, thống kê ẩn danh về việc sử dụng website và ghi nhớ lựa chọn của bạn để mang lại trải nghiệm tốt hơn.
                </p>
                <p>
                  Bạn có thể bấm “Chấp nhận tất cả”, từ chối bằng “Chỉ chấp nhận cần thiết” hoặc tự thiết lập tại “Quản lý tùy chọn”.
                </p>
              </div>
            </div>
            <div className="ks-cookie-actions">
              <button type="button" className="ks-cookie-btn is-primary" onClick={() => saveConsent(true, true)}>
                Chấp nhận tất cả
              </button>
              <button type="button" className="ks-cookie-btn is-primary" onClick={() => saveConsent(false, false)}>
                Chỉ chấp nhận cần thiết
              </button>
              <button type="button" className="ks-cookie-btn is-ghost" onClick={() => setPrefsOpen(true)}>
                Quản lý tùy chọn
              </button>
            </div>
          </div>
          <nav className="ks-cookie-links" aria-label="Chính sách pháp lý">
            <Link href="/privacy">Chính sách bảo mật</Link>
            <Link href="/terms">Điều khoản sử dụng</Link>
            <Link href="/cookies">Chính sách cookie</Link>
          </nav>
        </section>
      )}
      {prefsOpen && <CookiePreferences initial={consent} onClose={() => setPrefsOpen(false)} />}
    </>
  );
}

function CookiePreferences({ initial, onClose }: { initial: CookieConsent | null; onClose: () => void }) {
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [personalization, setPersonalization] = useState(initial?.personalization ?? false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const save = (a: boolean, p: boolean) => {
    saveConsent(a, p);
    onClose();
  };

  return (
    <div className="ks-cookie-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="ks-cookie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ks-cookie-pref-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ks-cookie-modal-head">
          <h2 id="ks-cookie-pref-title">Quản lý tùy chọn cookie</h2>
          <button type="button" className="ks-cookie-close" aria-label="Đóng bảng tùy chọn cookie" onClick={onClose}>
            <span aria-hidden="true">✕</span>
          </button>
        </header>
        <p className="ks-cookie-modal-intro">
          Chọn loại cookie bạn cho phép K-SPORT sử dụng. Bạn có thể thay đổi bất cứ lúc nào ở nút “Cài đặt cookie” cuối trang.
        </p>

        <div className="ks-cookie-group">
          <div>
            <h3>Cookie cần thiết</h3>
            <p>Duy trì phiên đăng nhập quản trị, bảo mật và ghi nhớ lựa chọn cookie của bạn. Luôn bật vì website không thể hoạt động thiếu các cookie này.</p>
          </div>
          <span className="ks-cookie-always">Luôn bật</span>
        </div>

        <div className="ks-cookie-group">
          <div>
            <h3 id="ks-cookie-analytics-label">Cookie phân tích</h3>
            <p>Thống kê ẩn danh về lượt truy cập và trang được xem để K-SPORT cải thiện nội dung và hiệu năng.</p>
          </div>
          <label className="ks-cookie-switch">
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} aria-labelledby="ks-cookie-analytics-label" />
            <span className="ks-cookie-switch-track" aria-hidden="true" />
          </label>
        </div>

        <div className="ks-cookie-group">
          <div>
            <h3 id="ks-cookie-personal-label">Cookie cá nhân hóa</h3>
            <p>Ghi nhớ giải đấu, thảm đấu hoặc bộ lọc bạn thường xem để lần sau mở nhanh hơn.</p>
          </div>
          <label className="ks-cookie-switch">
            <input type="checkbox" checked={personalization} onChange={(event) => setPersonalization(event.target.checked)} aria-labelledby="ks-cookie-personal-label" />
            <span className="ks-cookie-switch-track" aria-hidden="true" />
          </label>
        </div>

        <div className="ks-cookie-modal-actions">
          <button type="button" className="ks-cookie-btn is-primary" onClick={() => save(analytics, personalization)}>
            Lưu lựa chọn
          </button>
          <button type="button" className="ks-cookie-btn is-primary" onClick={() => save(true, true)}>
            Chấp nhận tất cả
          </button>
          <button type="button" className="ks-cookie-btn is-ghost" onClick={() => save(false, false)}>
            Chỉ chấp nhận cần thiết
          </button>
        </div>
      </div>
    </div>
  );
}

