import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InternalLayout } from "@/components/portal-ui";
import { HomeCta } from "@/components/home/home-cta";
import { TournamentScoreboard } from "@/components/scoreboard/tournament-scoreboard";
import { getSoftwareRelease } from "@/lib/software-release";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Phần Mềm Quản Lý & Bảng Điểm Điện Tử Giải Karate | K-SPORT",
  description: "Giải pháp công nghệ toàn diện cho giải đấu Karate: Đăng ký đoàn, bốc thăm phân nhánh tự động WKF, bảng điểm điện tử Tatami và tổng hợp kết quả thời gian thực.",
};

export default async function SoftwarePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const softwareRelease = await getSoftwareRelease();
  const params = await searchParams;
  const downloadUnavailable = params.download === "unavailable";
  const requestedOs = typeof params.os === "string" ? params.os : "windows";
  return (
    <InternalLayout>
      {/* 1. Synchronized Sports Hero Banner */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">NỀN TẢNG CÔNG NGHỆ ĐIỀU HÀNH GIẢI ĐẤU KARATE CHUYÊN NGHIỆP</span>
            <h1 className="ks-events-hero-title">
              Phần Mềm Quản Lý & Bảng Điểm K-SPORT
            </h1>
            <p className="ks-events-hero-sub">
              Hệ sinh thái số hóa toàn diện từ khâu đăng ký đoàn, thuật toán bốc thăm WKF, điều phối bàn thư ký thảm đấu đến bảng điểm điện tử LED không dây và công bố kết quả trực tuyến.
            </p>
            <div className="ks-hero-download-actions">
              <a
                href="#download"
                className="ks-btn ks-btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Tải Phần Mềm K-SPORT ({softwareRelease.tag})</span>
              </a>
              <Link href="/contact" className="ks-btn ks-btn-outline-white">
                <span>Tư Vấn Triển Khai Giải</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Metrics Row (Synchronized 4-card stats) */}
      <section className="ks-software-stats-section">
        <div className="ks-section-container">
          <div className="ks-events-stats-row">
            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number" style={{ fontSize: "20px" }}>Quy Chuẩn WKF</span>
                <span className="ks-stat-label">Áp dụng luật Kumite & Kata mới nhất</span>
              </div>
            </div>

            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap live">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number text-live" style={{ fontSize: "20px" }}>100% Không Dây</span>
                <span className="ks-stat-label">Đồng bộ Laptop bàn thư ký & LED sàn</span>
              </div>
            </div>

            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap upcoming">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number text-upcoming" style={{ fontSize: "20px" }}>Bốc Thăm 1-Click</span>
                <span className="ks-stat-label">Tự động phân nhánh & tách đơn vị</span>
              </div>
            </div>

            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap ended">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number" style={{ fontSize: "20px" }}>Tra Cứu Lịch Đấu</span>
                <span className="ks-stat-label">Tra cứu giờ & thảm đấu trên laptop</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Scoreboard Showcase */}
      <section className="ks-software-demo-section" style={{ padding: "64px 0 80px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div className="ks-section-container">
          <div className="ks-section-head" style={{ marginBottom: "32px", textAlign: "center", display: "block" }}>
            <span className="ks-eyebrow-tag">TRẢI NGHIỆM TRỰC QUAN TRÊN TRÌNH DUYỆT</span>
            <h2 className="ks-section-title" style={{ margin: "8px auto 14px", fontFamily: "'Barlow Condensed', Arial, sans-serif", fontSize: "clamp(30px, 3.4vw, 44px)", textTransform: "uppercase", color: "#0f172a" }}>
              Bảng Điểm Điện Tử Tatami K-SPORT
            </h2>
            <p className="ks-section-sub" style={{ margin: "0 auto", maxWidth: "760px", color: "#64748b", fontSize: "16px", lineHeight: "1.6" }}>
              Mô phỏng bảng hiển thị thi đấu thực tế trên thảm đấu (tỉ lệ chuẩn 16:9). Bạn có thể bấm chọn thể thức <strong>Kumite (Đối kháng)</strong> hoặc <strong>Kata (Quyền)</strong>, đếm ngược thời gian, cộng điểm Aka/Ao và bật đèn cảnh cáo Warning (C1–H).
            </p>
          </div>

          <TournamentScoreboard interactive={true} />
        </div>
      </section>

      {/* 4. Core Software Modules (6 Modular Cards) */}
      <section className="ks-software-modules-section" style={{ padding: "80px 0", background: "#ffffff" }}>
        <div className="ks-section-container">
          <div className="ks-section-head" style={{ textAlign: "center", marginBottom: "48px", display: "block" }}>
            <span className="ks-eyebrow-tag">KIẾN TRÚC TÍNH NĂNG TOÀN DIỆN</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', Arial, sans-serif", fontSize: "clamp(32px, 3.6vw, 46px)", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", margin: "8px 0 14px" }}>
              6 Phân Hệ Tính Năng Cốt Lõi Của K-SPORT
            </h2>
            <p style={{ maxWidth: "740px", margin: "0 auto", fontSize: "16px", color: "#64748b", lineHeight: 1.6 }}>
              Được thiết kế và hoàn thiện cùng các trọng tài quốc tế và ban điều hành giải đấu chuyên nghiệp, đảm bảo tính chuẩn xác và tốc độ vận hành cao nhất.
            </p>
          </div>

          <div className="ks-modules-grid">
            {/* Module 1 */}
            <article className="ks-module-card">
              <div className="ks-module-head">
                <span className="ks-module-num">01</span>
                <span className="ks-module-badge">HỒ SƠ ĐOÀN</span>
              </div>
              <h3 className="ks-module-title">Cổng Đăng Ký & Quản Lý Vận Động Viên</h3>
              <p className="ks-module-desc">
                Tiếp nhận hồ sơ thi đấu trực tuyến từ các câu lạc bộ, tự động kiểm tra năm sinh, giới hạn độ tuổi và hạng cân thi đấu. Cấp mã định danh duy nhất (VIE-ID) và in thẻ vận động viên có ảnh sắc nét.
              </p>
              <ul className="ks-module-points">
                <li>Nhập danh sách nhanh từ Excel chỉ trong 30 giây</li>
                <li>Tự động phân nhóm tuổi theo quy chế giải</li>
                <li>Kiểm soát cân nặng và trạng thái kiểm tra y tế</li>
              </ul>
            </article>

            {/* Module 2 */}
            <article className="ks-module-card">
              <div className="ks-module-head">
                <span className="ks-module-num">02</span>
                <span className="ks-module-badge">BỐC THĂM WKF</span>
              </div>
              <h3 className="ks-module-title">Thuật Toán Bốc Thăm & Phân Nhánh Tự Động</h3>
              <p className="ks-module-desc">
                Bốc thăm phân nhánh hoàn toàn tự động, minh bạch và tuân thủ nguyên tắc bốc thăm của Liên đoàn Karate Thế giới (WKF). Hỗ trợ tách hạt giống số 1–4 và tách các vận động viên cùng một đơn vị.
              </p>
              <ul className="ks-module-points">
                <li>Sơ đồ đấu loại trực tiếp (Single Elimination)</li>
                <li>Hệ thống vòng vớt tranh HCĐ (Repechage WKF)</li>
                <li>Thi đấu vòng tròn tính điểm cho các nội dung ít VĐV</li>
              </ul>
            </article>

            {/* Module 3 */}
            <article className="ks-module-card">
              <div className="ks-module-head">
                <span className="ks-module-num">03</span>
                <span className="ks-module-badge">THẢM ĐẤU LED</span>
              </div>
              <h3 className="ks-module-title">Bàn Thư Ký & Bảng Điểm Điện Tử LED</h3>
              <p className="ks-module-desc">
                Bảng điều khiển chấm điểm trực quan cho thư ký thảm đấu vận hành trực tiếp trên máy tính laptop. Đồng bộ theo thời gian thực lên màn hình TV hoặc màn hình LED kích thước lớn tại nhà thi đấu.
              </p>
              <ul className="ks-module-points">
                <li>Hiển thị góc đỏ (Aka) và góc xanh (Ao) chuẩn màu</li>
                <li>Bộ đếm giờ thi đấu chuẩn xác đến 0.1 giây</li>
                <li>Hệ thống cảnh báo lỗi C1, C2, C3, HC, Hansoku</li>
              </ul>
            </article>

            {/* Module 4 */}
            <article className="ks-module-card">
              <div className="ks-module-head">
                <span className="ks-module-num">04</span>
                <span className="ks-module-badge">CHẤM QUYỀN KATA</span>
              </div>
              <h3 className="ks-module-title">Trọng Tài Chấm Quyền Kata Điện Tử</h3>
              <p className="ks-module-desc">
                Giao diện nhập điểm độc lập cho 5 hoặc 7 giám định viên. Hệ thống tự động loại bỏ điểm số cao nhất và thấp nhất, tính điểm kỹ thuật và thể lực theo đúng công thức chuẩn của WKF.
              </p>
              <ul className="ks-module-points">
                <li>Hỗ trợ thể thức đấu quyền cá nhân và đồng đội</li>
                <li>Hiển thị tên bài quyền (Kata) chính thức đã đăng ký</li>
                <li>Tính tổng điểm và xếp hạng vào vòng tiếp theo tức thì</li>
              </ul>
            </article>

            {/* Module 5 */}
            <article className="ks-module-card">
              <div className="ks-module-head">
                <span className="ks-module-num">05</span>
                <span className="ks-module-badge">ĐIỀU PHỐI TATAMI</span>
              </div>
              <h3 className="ks-module-title">Thẻ Thi Đấu Số Hóa & Điều Phối Thảm</h3>
              <p className="ks-module-desc">
                Mỗi VĐV được cấp thẻ thi đấu số hóa. Ban tổ chức và các đoàn thi đấu tra cứu trực tiếp trên hệ thống laptop để nắm bắt trận đấu tiếp theo, thảm đấu, số thứ tự gọi trận và trang phục thi đấu.
              </p>
              <ul className="ks-module-points">
                <li>Giảm thiểu tối đa tình trạng nhầm thảm, trễ giờ thi đấu</li>
                <li>Theo dõi tiến độ các thảm đấu song song theo thời gian thực</li>
                <li>Cập nhật tình trạng hoãn trận, đổi thảm ngay lập tức</li>
              </ul>
            </article>

            {/* Module 6 */}
            <article className="ks-module-card">
              <div className="ks-module-head">
                <span className="ks-module-num">06</span>
                <span className="ks-module-badge">KẾT QUẢ & BÁO CÁO</span>
              </div>
              <h3 className="ks-module-title">Biên Bản Trận Đấu & Bảng Tổng Sắp</h3>
              <p className="ks-module-desc">
                Tự động tạo biên bản thi đấu có chữ ký trọng tài, kết quả từng trận và bảng tổng sắp huy chương toàn đoàn (Vàng, Bạc, Đồng) ngay sau khi trận chung kết cuối cùng kết thúc.
              </p>
              <ul className="ks-module-points">
                <li>Xuất file PDF biên bản thi đấu chuẩn thể thức</li>
                <li>Xuất file Excel tổng hợp điểm số và kết quả toàn giải</li>
                <li>Đồng bộ kết quả lên website công khai cho khán giả</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 5. 4-Step Tournament Workflow Pipeline */}
      <section className="ks-software-workflow-section" style={{ padding: "80px 0", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div className="ks-section-container">
          <div className="ks-section-head" style={{ textAlign: "center", marginBottom: "48px", display: "block" }}>
            <span className="ks-eyebrow-tag">QUY TRÌNH VẬN HÀNH TIÊU CHUẨN</span>
            <h2 style={{ fontFamily: "'Barlow Condensed', Arial, sans-serif", fontSize: "clamp(30px, 3.4vw, 44px)", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", margin: "8px 0 14px" }}>
              Vận Hành Giải Đấu Khép Kín Trong 4 Bước
            </h2>
            <p style={{ maxWidth: "700px", margin: "0 auto", fontSize: "16px", color: "#64748b", lineHeight: 1.6 }}>
              Tiết kiệm đến 80% thời gian xử lý thủ công và giấy tờ cho ban tổ chức giải.
            </p>
          </div>

          <div className="ks-workflow-steps-grid">
            <div className="ks-workflow-step">
              <div className="ks-step-number">01</div>
              <h3 className="ks-step-title">Tiếp Nhận Đăng Ký</h3>
              <p className="ks-step-desc">
                Nhập danh sách VĐV từ các câu lạc bộ, tự động kiểm tra hợp lệ nhóm tuổi, hạng cân và in thẻ thi đấu QR.
              </p>
            </div>

            <div className="ks-workflow-step">
              <div className="ks-step-number">02</div>
              <h3 className="ks-step-title">Bốc Thăm & Xếp Lịch</h3>
              <p className="ks-step-desc">
                Thuật toán bốc thăm WKF chia nhánh, tách hạt giống và tự động phân bổ thứ tự trận lên từng thảm Tatami.
              </p>
            </div>

            <div className="ks-workflow-step">
              <div className="ks-step-number">03</div>
              <h3 className="ks-step-title">Điều Hành Thảm Đấu</h3>
              <p className="ks-step-desc">
                Bàn thư ký bấm điểm trực tiếp trên laptop, bảng điểm LED sàn đấu hiển thị tức thì cho VĐV, trọng tài và khán giả.
              </p>
            </div>

            <div className="ks-workflow-step">
              <div className="ks-step-number">04</div>
              <h3 className="ks-step-title">Tổng Kết Huy Chương</h3>
              <p className="ks-step-desc">
                Tự động tính bảng tổng sắp huy chương toàn đoàn, in biên bản trao giải và đồng bộ dữ liệu lên website K-SPORT.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Hardware & Compatibility Requirements */}
      <section className="ks-software-hardware-section" style={{ padding: "72px 0", background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
        <div className="ks-section-container">
          <div className="ks-hardware-card">
            <div className="ks-hardware-head">
              <span className="ks-eyebrow-tag">CHUẨN HÓA ĐỒNG BỘ LAPTOP</span>
              <h2 style={{ fontFamily: "'Barlow Condensed', Arial, sans-serif", fontSize: "clamp(26px, 2.8vw, 36px)", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", margin: "8px 0 10px" }}>
                Yêu Cầu Phần Cứng Linh Hoạt & Dễ Triển Khai
              </h2>
              <p style={{ fontSize: "15px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                Toàn bộ hệ thống được tối ưu hóa để vận hành 100% trên các dòng máy tính laptop qua mạng nội bộ LAN / Wi-Fi ngay cả khi không có Internet.
              </p>
            </div>

            <div className="ks-hardware-grid">
              <div className="ks-hw-item">
                <div className="ks-hw-icon">💻</div>
                <div className="ks-hw-body">
                  <strong>Laptop Máy Chủ Ban Tổ Chức</strong>
                  <p>Laptop Windows hoặc MacBook tiêu chuẩn chạy phần mềm K-SPORT điều phối bốc thăm, xếp lịch và tổng hợp kết quả.</p>
                </div>
              </div>

              <div className="ks-hw-item">
                <div className="ks-hw-icon">💻</div>
                <div className="ks-hw-body">
                  <strong>Laptop Bàn Thư Ký Thảm</strong>
                  <p>Máy tính laptop (Windows, macOS hoặc Linux) đặt tại bàn thư ký mỗi thảm để nhập điểm, bấm giờ và điều hành trận.</p>
                </div>
              </div>

              <div className="ks-hw-item">
                <div className="ks-hw-icon">📺</div>
                <div className="ks-hw-body">
                  <strong>Bảng Điểm LED Sàn Đấu</strong>
                  <p>Smart TV từ 43–65 inch hoặc màn hình LED P3/P4 kết nối qua HDMI hoặc Wi-Fi từ laptop thảm.</p>
                </div>
              </div>

              <div className="ks-hw-item">
                <div className="ks-hw-icon">🖨️</div>
                <div className="ks-hw-body">
                  <strong>Máy In Biên Bản</strong>
                  <p>Máy in laser hoặc máy in văn phòng khổ A4 thông thường kết nối laptop để in kết quả và chứng nhận.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Download & Release Hub Section */}
      <section id="download" className="ks-software-download-section">
        <div className="ks-section-container">
          <div className="ks-download-hub-card">
            {downloadUnavailable && (
              <div className="ks-download-alert" role="alert">
                <strong>Chưa thể tải bản cài đặt {requestedOs === "mac" ? "macOS" : requestedOs === "linux" ? "Linux" : "Windows"}.</strong>
                <span>Máy chủ phân phối đang không phản hồi. Vui lòng thử lại sau hoặc liên hệ K-SPORT để nhận bản cài đặt chính thức.</span>
                <Link href="/contact">Liên hệ hỗ trợ <span aria-hidden="true">→</span></Link>
              </div>
            )}
            <div className="ks-download-hub-header">
              <span className="ks-eyebrow-tag">HỆ THỐNG PHÁT HÀNH CHÍNH THỨC K-SPORT</span>
              <h2 className="ks-download-hub-title">
                Chọn Hệ Điều Hành Để Tải Phần Mềm K-SPORT
              </h2>
              <p className="ks-download-hub-sub">
                Phiên bản {softwareRelease.tag} (Mới nhất) — Tương thích đa nền tảng, thiết kế chuyên biệt cho công tác thư ký, bốc thăm và bảng điểm LED tại sàn đấu Karate.
              </p>
            </div>

            <div className="ks-download-cards-grid">
              {/* Windows Card */}
              <div className="ks-dl-platform-card featured">
                <div className="ks-dl-card-badge win">BẢN CÀI ĐẶT WINDOWS (KHUYÊN DÙNG)</div>
                <div className="ks-dl-icon-row">
                  <div className="ks-dl-os-icon win">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="ks-dl-platform-title">K-SPORT for Windows</h3>
                    <span className="ks-dl-version">Phiên bản {softwareRelease.tag} · Setup .exe (92 MB)</span>
                  </div>
                </div>
                <p className="ks-dl-desc">
                  Tương thích hoàn hảo Windows 10 & 11 (64-bit). Khởi chạy máy chủ thảm đấu, xuất màn hình LED phụ và bảng điểm không dây chuẩn WKF.
                </p>
                <a
                  href="/api/download?os=windows"
                  className="ks-dl-action-btn primary"
                  download
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Tải Bản Cài Đặt Windows (.exe)</span>
                </a>
              </div>

              {/* macOS Card */}
              <div className="ks-dl-platform-card">
                <div className="ks-dl-card-badge mac">MACOS (APPLE SILICON & INTEL)</div>
                <div className="ks-dl-icon-row">
                  <div className="ks-dl-os-icon mac">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.17.65-2.83 1.42-.58.67-1.06 1.74-.98 2.81 1.07.08 2.19-.61 2.8-1.36z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="ks-dl-platform-title">K-SPORT for Mac</h3>
                    <span className="ks-dl-version">Phiên bản {softwareRelease.tag} · File .dmg (122 MB)</span>
                  </div>
                </div>
                <p className="ks-dl-desc">
                  Hỗ trợ MacBook, Mac mini, iMac chạy chip Apple Silicon (M1/M2/M3/M4) và Intel. Kéo thả vào Applications để sử dụng ngay.
                </p>
                <a
                  href="/api/download?os=mac"
                  className="ks-dl-action-btn secondary"
                  download
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Tải Bản Cài Đặt macOS (.dmg)</span>
                </a>
              </div>

              {/* Linux Card */}
              <div className="ks-dl-platform-card">
                <div className="ks-dl-card-badge">LINUX (STANDALONE)</div>
                <div className="ks-dl-icon-row">
                  <div className="ks-dl-os-icon linux" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <Image
                      src="/images/linux-tux.jpg"
                      alt="Linux Tux Mascot"
                      width={40}
                      height={44}
                      className="ks-tux-img"
                    />
                  </div>
                  <div>
                    <h3 className="ks-dl-platform-title">K-SPORT for Linux</h3>
                    <span className="ks-dl-version">Phiên bản {softwareRelease.tag} · .AppImage (131 MB)</span>
                  </div>
                </div>
                <p className="ks-dl-desc">
                  Gói thực thi độc lập (Standalone) không cần cài đặt cho Ubuntu 20.04+, Debian và các bản phân phối Linux phổ biến.
                </p>
                <a
                  href="/api/download?os=linux"
                  className="ks-dl-action-btn secondary"
                  download
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Tải Bản Linux (.AppImage)</span>
                </a>
              </div>
            </div>

            {/* Version Update Note */}
            <div className="ks-dl-note-box">
              <span className="ks-dl-note-icon">💡</span>
              <p>
                <strong>Cơ chế tự động cập nhật:</strong> Khi cài đặt K-SPORT, mỗi khi có phiên bản mới cập nhật điều lệ WKF, phần mềm sẽ tự động nhận diện và hiển thị thông báo nâng cấp chỉ với 1 click ngay trong ứng dụng mà không cần phải tải lại thủ công.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Conversion CTA Banner - Reusing perfected Home CTA */}
      <HomeCta />
    </InternalLayout>
  );
}
