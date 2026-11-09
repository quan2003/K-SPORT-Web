import Link from "next/link";
import { TournamentScoreboard } from "@/components/scoreboard/tournament-scoreboard";

export function HomeSoftware() {
  return (
    <section className="ks-software-section" aria-label="Giới thiệu phần mềm K-SPORT">
      <div className="ks-software-glow" />
      <div className="ks-section-container">
        {/* Section Header */}
        <div className="ks-software-head">
          <span className="ks-tech-badge">
            <span className="ks-pulse-dot" />
            HỆ SINH THÁI CÔNG NGHỆ THỂ THAO
          </span>
          <h2 className="ks-software-title">
            Phần Mềm Điều Hành Giải Đấu Karate Chuẩn Quốc Tế
          </h2>
          <p className="ks-software-sub">
            Giao diện điều khiển bảng điểm điện tử mô phỏng chính xác hệ thống K-SPORT đang triển khai tại các giải vô địch Karate trên toàn quốc.
          </p>
        </div>

        {/* 4 Feature Pillars Grid */}
        <div className="ks-features-grid">
          <div className="ks-feature-card">
            <div className="ks-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <h3 className="ks-feature-title">Đăng Ký & Thẻ VĐV Số Hóa</h3>
            <p className="ks-feature-desc">
              Ban tổ chức nhập dữ liệu đoàn nhanh chóng, hệ thống tự động sinh thẻ VĐV số hóa tra cứu lịch đấu, thảm đấu và góc đai Aka/Ao trực tiếp trên máy tính laptop.
            </p>
            <span className="ks-feature-tag">Tiết kiệm 80% thời gian điểm danh</span>
          </div>

          <div className="ks-feature-card">
            <div className="ks-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
                <path d="M12 3v12" />
                <path d="M20 21H4" />
              </svg>
            </div>
            <h3 className="ks-feature-title">Bốc Thăm & Nhánh Đấu Chuẩn WKF</h3>
            <p className="ks-feature-desc">
              Thuật toán bốc thăm tự động phân nhánh loại trực tiếp, tránh cùng đơn vị ở vòng đầu, hỗ trợ xếp hạt giống và nhánh vớt (Repechage) chuẩn xác tuyệt đối.
            </p>
            <span className="ks-feature-tag">Minh bạch & chuẩn quy chế WKF</span>
          </div>

          <div className="ks-feature-card">
            <div className="ks-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="ks-feature-title">Bảng Điểm Điện Tử Tatami LED</h3>
            <p className="ks-feature-desc">
              Hỗ trợ đầy đủ thể thức Kumite (bấm điểm, tính giờ đếm ngược, lỗi C1–H) và Kata (Aka/Ao, đơn vị), xuất màn hình lớn chuẩn tỉ lệ 16:9 sắc nét.
            </p>
            <span className="ks-feature-tag">Độ trễ thời gian thực &lt; 0.5s</span>
          </div>

          <div className="ks-feature-card">
            <div className="ks-feature-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <h3 className="ks-feature-title">Xếp Hạng & Báo Cáo Tức Thì</h3>
            <p className="ks-feature-desc">
              Tự động cập nhật bảng tổng sắp huy chương toàn đoàn (Nhất, Nhì, Ba), xuất biên bản thi đấu PDF có mã xác thực và in chứng nhận giải đấu ngay tại bàn thư ký.
            </p>
            <span className="ks-feature-tag">Xuất biên bản & chứng nhận tức thì</span>
          </div>
        </div>

        {/* Live Interactive Tournament Scoreboard */}
        <div className="ks-scoreboard-wrapper-section">
          <TournamentScoreboard interactive={true} />
        </div>

        {/* CTA Banner inside software section */}
        <div className="ks-software-actions" style={{ marginTop: "48px" }}>
          <Link href="/software" className="ks-btn ks-btn-primary">
            <span>Tìm Hiểu Toàn Bộ Tính Năng Phần Mềm</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/contact" className="ks-btn ks-btn-outline">
            <span>Yêu Cầu Demo & Báo Giá</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
