"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { SOFTWARE_RELEASE } from "@/lib/software-release";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function detectClientOs(): "windows" | "mac" | "linux" {
  if (typeof window === "undefined") return "windows";
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") && !ua.includes("android")) return "linux";
  return "windows";
}

export function DownloadModal({ isOpen, onClose }: DownloadModalProps) {
  const mounted = useMounted();
  const [detectedOs] = useState<"windows" | "mac" | "linux">(detectClientOs);
  const [selectedOs, setSelectedOs] = useState<"windows" | "mac" | "linux">(detectClientOs);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="ks-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ks-dl-modal-title"
    >
      <div className="ks-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button
          type="button"
          className="ks-modal-close-btn"
          onClick={onClose}
          aria-label="Đóng hộp thoại tải phần mềm"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="ks-modal-head">
          <div className="ks-modal-badge-row">
            <span className="ks-modal-eyebrow">HỆ THỐNG PHÁT HÀNH CHÍNH THỨC K-SPORT</span>
            <span className="ks-modal-ver-pill">Phiên bản {SOFTWARE_RELEASE.tag} (Mới nhất)</span>
          </div>
          <h2 id="ks-dl-modal-title" className="ks-modal-title">
            Tải Phần Mềm Quản Lý & Bảng Điểm K-SPORT
          </h2>
          <p className="ks-modal-sub">
            Vui lòng chọn hệ điều hành của thiết bị bạn sử dụng để tải bản cài đặt tương thích nhất:
          </p>
        </div>

        {/* OS Platform Selector Cards */}
        <div className="ks-modal-platforms-grid">
          {SOFTWARE_RELEASE.platforms.map((p) => {
            const isDetected = detectedOs === p.id;
            const isSelected = selectedOs === p.id;

            return (
              <div
                key={p.id}
                className={`ks-modal-os-card ${isSelected ? "is-selected" : ""} ${p.recommended ? "is-recommended" : ""}`}
                onClick={() => setSelectedOs(p.id as "windows" | "mac" | "linux")}
              >
                {/* Platform Badge */}
                <div className="ks-os-card-top">
                  <span className={`ks-os-badge ${p.id}`}>
                    {p.badge}
                  </span>
                  {isDetected && (
                    <span className="ks-os-detected-badge" title="Hệ điều hành thiết bị của bạn">
                      ✓ Thiết bị của bạn
                    </span>
                  )}
                </div>

                {/* OS Header */}
                <div className="ks-os-info-row">
                  <div className={`ks-os-icon-box ${p.id}`}>
                    {p.id === "windows" && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                      </svg>
                    )}
                    {p.id === "mac" && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.17.65-2.83 1.42-.58.67-1.06 1.74-.98 2.81 1.07.08 2.19-.61 2.8-1.36z" />
                      </svg>
                    )}
                    {p.id === "linux" && (
                      <Image
                        src="/images/linux-tux.jpg"
                        alt="Linux Tux Mascot"
                        width={36}
                        height={40}
                        className="ks-tux-img"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="ks-os-card-title">{p.fullName}</h3>
                    <span className="ks-os-spec-tag">{p.fileType} · {p.size}</span>
                  </div>
                </div>

                {/* OS Description */}
                <p className="ks-os-desc">{p.desc}</p>
                <div className="ks-os-req">
                  <strong>Yêu cầu:</strong> {p.osRequirement}
                </div>

                {/* Direct Download Action Button */}
                <a
                  href={p.downloadUrl}
                  className={`ks-os-dl-btn ${p.recommended ? "is-primary" : ""}`}
                  download
                  onClick={onClose}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Tải Về Cho {p.name}</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Modal Features Bar */}
        <div className="ks-modal-guarantees">
          <div className="ks-guarantee-item">
            <span className="ks-guarantee-icon">🔄</span>
            <div>
              <strong>Tự động nhận diện bản cập nhật</strong>
              <p>Phần mềm tự động kiểm tra phiên bản mới theo điều lệ WKF mỗi khi mở máy.</p>
            </div>
          </div>

          <div className="ks-guarantee-item">
            <span className="ks-guarantee-icon">📶</span>
            <div>
              <strong>Vận hành 100% không cần Internet</strong>
              <p>Mạng LAN / Wi-Fi nội bộ tại nhà thi đấu kết nối bảng điểm LED & laptop bàn thư ký không bị trễ.</p>
            </div>
          </div>

          <div className="ks-guarantee-item">
            <span className="ks-guarantee-icon">🔒</span>
            <div>
              <strong>Bảo mật & Minh bạch</strong>
              <p>Bản cài đặt chính thức từ K-SPORT, lưu vết điểm số & xuất biên bản ký xác nhận tức thì.</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="ks-modal-foot">
          <Link href="/software" className="ks-modal-foot-link" onClick={onClose}>
            <span>Tìm hiểu chi tiết tính năng phần mềm & mô hình kết nối thảm đấu</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
