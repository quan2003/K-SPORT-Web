import type { Metadata } from "next";
import Link from "next/link";
import { InternalLayout } from "@/components/portal-ui";
import { ContactForm } from "@/components/contact-form";
import { HomeCta } from "@/components/home/home-cta";

export const metadata: Metadata = {
  title: "Liên Hệ & Tư Vấn Triển Khai Phần Mềm Karate | K-SPORT",
  description:
    "Liên hệ K-SPORT để nhận tư vấn triển khai phần mềm quản lý thi đấu Karate, cấu hình bảng điểm điện tử Tatami, bốc thăm phân nhánh và cử chuyên viên kỹ thuật thảm đấu.",
};

export default function ContactPage() {
  return (
    <InternalLayout>
      {/* 1. Synchronized Sports Hero Banner */}
      <section className="ks-events-hero-section">
        <div className="ks-section-container">
          <div className="ks-events-hero-content">
            <span className="ks-eyebrow-tag">TRUNG TÂM TƯ VẤN & HỖ TRỢ TRIỂN KHAI K-SPORT</span>
            <h1 className="ks-events-hero-title">
              Liên Hệ & Tư Vấn Tổ Chức Giải
            </h1>
            <p className="ks-events-hero-sub">
              Đồng hành cùng Ban tổ chức, Liên đoàn và các Câu lạc bộ Karate trên toàn quốc — Khảo sát điều lệ, tư vấn bốc thăm xếp lịch và điều phối kỹ thuật thảm đấu trực tiếp.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Quick Metrics Row (Synchronized 4-card stats) */}
      <section className="ks-contact-stats-section">
        <div className="ks-section-container">
          <div className="ks-events-stats-row">
            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number" style={{ fontSize: "20px" }}>0336440523</span>
                <span className="ks-stat-label">Hotline & Zalo hỗ trợ kỹ thuật giải</span>
              </div>
            </div>

            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap upcoming">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number" style={{ fontSize: "17px", letterSpacing: "0" }}>lienhe@k-sport.net</span>
                <span className="ks-stat-label">Tiếp nhận hồ sơ & điều lệ thi đấu</span>
              </div>
            </div>

            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap live">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number">&lt; 15 Phút</span>
                <span className="ks-stat-label">Thời gian phản hồi nhanh qua Zalo</span>
              </div>
            </div>

            <div className="ks-event-stat-card">
              <div className="ks-stat-icon-wrap completed">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-number" style={{ fontSize: "20px" }}>Toàn Quốc</span>
                <span className="ks-stat-label">Sẵn sàng triển khai tại mọi tỉnh thành</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Direct Contact Channels Cards */}
      <section className="ks-contact-channels-section">
        <div className="ks-section-container">
          <div className="ks-channels-header">
            <span className="ks-eyebrow-tag">KÊNH KẾT NỐI TRỰC TIẾP</span>
            <h2 className="ks-channels-title">Trao Đổi Trực Tiếp Cùng Đội Ngũ Chuyên Môn</h2>
            <p className="ks-channels-desc">
              Tùy theo nhu cầu điều hành, ban tổ chức có thể lựa chọn kênh hỗ trợ nhanh nhất dưới đây.
            </p>
          </div>

          <div className="ks-channels-grid">
            <div className="ks-channel-card">
              <div className="ks-channel-badge hot">HOTLINE & ZALO 24/7</div>
              <h3 className="ks-channel-name">Tư Vấn Bốc Thăm & Điều Lệ</h3>
              <p className="ks-channel-sub">Dành cho Trưởng ban chuyên môn & Thư ký giải</p>
              <p className="ks-channel-text">
                Trao đổi nhanh phương án chia bảng Kata, chia nhánh Kumite, nguyên tắc hạt giống tránh gặp sớm cùng đơn vị và cách thiết lập biên bản thi đấu chuẩn.
              </p>
              <a
                href="https://zalo.me/0336440523"
                target="_blank"
                rel="noreferrer"
                className="ks-channel-action-btn"
              >
                <span>Nhắn Zalo: 0336440523</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>

            <div className="ks-channel-card">
              <div className="ks-channel-badge mail">EMAIL CHUYÊN MÔN</div>
              <h3 className="ks-channel-name">Gửi File Điều Lệ & Danh Sách Đoàn</h3>
              <p className="ks-channel-sub">Dành cho Ban tổ chức giải & Liên đoàn</p>
              <p className="ks-channel-text">
                Tiếp nhận danh sách VĐV dạng Excel, điều lệ chính thức có dấu đỏ để kiểm tra phân hạng lứa tuổi, số lượng nội dung và khởi tạo hệ thống giải trước ngày thi đấu.
              </p>
              <a
                href="mailto:lienhe@k-sport.net"
                className="ks-channel-action-btn secondary"
              >
                <span>Gửi Email: lienhe@k-sport.net</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>

            <div className="ks-channel-card">
              <div className="ks-channel-badge tech">KỸ THUẬT SÀN ĐẤU</div>
              <h3 className="ks-channel-name">Hỗ Trợ Màn Hình LED & Thiết Bị</h3>
              <p className="ks-channel-sub">Dành cho Đội ngũ thư ký thảm & Vận hành</p>
              <p className="ks-channel-text">
                Tư vấn kết nối mạng nội bộ LAN/Wi-Fi, cấu hình màn hình hiển thị điểm số Tatami, kết nối hệ thống máy tính laptop bàn thư ký và camera quay chậm video review.
              </p>
              <Link
                href="/software"
                className="ks-channel-action-btn secondary"
              >
                <span>Xem Mô Hình Phần Mềm & Bảng Điểm</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main 2-Column Section (Workflow / Benefits + Contact Form) */}
      <section className="ks-contact-main-section">
        <div className="ks-section-container">
          <div className="ks-contact-layout-grid">
            {/* Left Column: Procedures & Commitments */}
            <div className="ks-contact-info-col">
              <div className="ks-info-box">
                <span className="ks-eyebrow-tag">QUY TRÌNH HỢP TÁC</span>
                <h3 className="ks-info-box-title">3 Bước Triển Khai Giải Đấu Cùng K-SPORT</h3>
                <div className="ks-process-steps-list">
                  <div className="ks-process-step-item">
                    <div className="ks-process-num">01</div>
                    <div className="ks-process-text">
                      <strong>Tiếp nhận điều lệ & Chuẩn hóa danh sách đoàn</strong>
                      <p>K-SPORT nhận file danh sách VĐV, lọc trùng họ tên, phân nhóm đúng lứa tuổi và các hạng cân thi đấu theo điều lệ ban hành.</p>
                    </div>
                  </div>

                  <div className="ks-process-step-item">
                    <div className="ks-process-num">02</div>
                    <div className="ks-process-text">
                      <strong>Bốc thăm phân nhánh & In ấn tài liệu chuyên môn</strong>
                      <p>Hệ thống tự động xếp hạt giống, chia nhánh tránh chạm sớm giữa các VĐV cùng đơn vị, sẵn sàng in sơ đồ thi đấu và biên bản chấm điểm.</p>
                    </div>
                  </div>

                  <div className="ks-process-step-item">
                    <div className="ks-process-num">03</div>
                    <div className="ks-process-text">
                      <strong>Vận hành thảm đấu & Công bố kết quả trực tuyến</strong>
                      <p>Bảng điểm LED cập nhật từng đòn đánh theo thời gian thực, bàn thư ký nhập điểm trực tiếp qua laptop, xuất báo cáo huy chương ngay khi kết thúc giải.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ks-info-box highlight-box">
                <span className="ks-eyebrow-tag" style={{ color: "#d50b27" }}>CAM KẾT DỊCH VỤ</span>
                <h3 className="ks-info-box-title">Đồng Hành Toàn Diện Tại Nhà Thi Đấu</h3>
                <ul className="ks-check-bullet-list">
                  <li>
                    <span className="ks-bullet-icon">✓</span>
                    <div>
                      <strong>Cử chuyên viên kỹ thuật trực tiếp</strong>
                      <p>Hỗ trợ bàn thư ký và giải quyết mọi phát sinh trong suốt các buổi thi đấu.</p>
                    </div>
                  </li>
                  <li>
                    <span className="ks-bullet-icon">✓</span>
                    <div>
                      <strong>Vận hành hoàn toàn không cần Internet</strong>
                      <p>Mạng nội bộ độc lập bảo đảm bảng điểm mượt mà, không gián đoạn tín hiệu.</p>
                    </div>
                  </li>
                  <li>
                    <span className="ks-bullet-icon">✓</span>
                    <div>
                      <strong>Minh bạch & Dữ liệu chuẩn xác</strong>
                      <p>Lưu vết toàn bộ diễn biến điểm số, lỗi phạt và xuất biên bản ký xác nhận tức thì.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Upgraded Interactive Contact Form */}
            <div className="ks-contact-form-col">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section (Câu hỏi thường gặp) */}
      <section className="ks-contact-faq-section">
        <div className="ks-section-container">
          <div className="ks-faq-head">
            <span className="ks-eyebrow-tag">GIẢI ĐÁP THẮC MẮC</span>
            <h2 className="ks-faq-title">Câu Hỏi Thường Gặp Về Triển Khai K-SPORT</h2>
            <p className="ks-faq-sub">
              Những băn khoăn phổ biến nhất của Ban tổ chức khi lần đầu đưa công nghệ vào điều hành giải Karate.
            </p>
          </div>

          <div className="ks-faq-accordion-list">
            <details className="ks-faq-item" open>
              <summary className="ks-faq-summary">
                <span>Nhà thi đấu không có đường truyền Internet thì K-SPORT có hoạt động được không?</span>
                <span className="ks-faq-chevron" aria-hidden="true">+</span>
              </summary>
              <div className="ks-faq-content">
                <p>
                  <strong>Hoàn toàn hoạt động ổn định 100%.</strong> Hệ thống K-SPORT được thiết kế chuyên biệt để vận hành qua mạng nội bộ LAN / Wi-Fi cục bộ tại nhà thi đấu giữa máy tính laptop chủ BTC, bảng điểm điện tử LED và các máy tính laptop bàn thư ký tại thảm mà không cần bất kỳ kết nối Internet nào ra bên ngoài. Dữ liệu sau đó có thể đồng bộ lên cổng thông tin công cộng khi có mạng.
                </p>
              </div>
            </details>

            <details className="ks-faq-item">
              <summary className="ks-faq-summary">
                <span>Ban tổ chức cần chuẩn bị những thiết bị phần cứng gì?</span>
                <span className="ks-faq-chevron" aria-hidden="true">+</span>
              </summary>
              <div className="ks-faq-content">
                <p>
                  Ban tổ chức chỉ cần chuẩn bị: các máy tính laptop cho bàn thư ký thảm đấu và màn hình TV hoặc màn hình LED tại mỗi thảm (kết nối HDMI tiêu chuẩn). Toàn bộ thao tác chấm điểm và điều hành đều thực hiện trực tiếp trên máy tính laptop (hỗ trợ Windows, macOS và Linux). Nếu ban tổ chức có nhu cầu trọn gói, K-SPORT có thể hỗ trợ cung cấp toàn bộ thiết bị laptop và màn hình đến tận địa điểm thi đấu.
                </p>
              </div>
            </details>

            <details className="ks-faq-item">
              <summary className="ks-faq-summary">
                <span>Phần mềm có cập nhật theo luật thi đấu mới nhất của Liên đoàn Karate Thế giới (WKF) không?</span>
                <span className="ks-faq-chevron" aria-hidden="true">+</span>
              </summary>
              <div className="ks-faq-content">
                <p>
                  K-SPORT luôn cập nhật kịp thời các sửa đổi bổ sung của WKF: cơ chế tính điểm Ippon/Waza-ari, hệ thống cảnh báo Chui và Hansoku-Chui, thể thức chấm điểm Kata vòng tròn/chia bảng và luật thi đấu lứa tuổi thiếu nhi, thanh thiếu niên đặc thù tại các giải phong trào và giải trẻ Việt Nam.
                </p>
              </div>
            </details>

            <details className="ks-faq-item">
              <summary className="ks-faq-summary">
                <span>Thời gian chuẩn bị trước giải đấu cần bao lâu?</span>
                <span className="ks-faq-chevron" aria-hidden="true">+</span>
              </summary>
              <div className="ks-faq-content">
                <p>
                  Thông thường, ban tổ chức chỉ cần gửi điều lệ và danh sách VĐV sơ bộ trước ngày thi đấu từ 3 đến 5 ngày. Đội ngũ K-SPORT sẽ tiến hành chuẩn hóa dữ liệu, thiết lập cây nhánh bốc thăm và kiểm tra kịch bản thi đấu. Tại ngày diễn ra giải, chuyên viên kỹ thuật sẽ có mặt trước giờ khai mạc 2 tiếng để kiểm tra toàn bộ màn hình LED và kết nối mạng nội bộ.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 6. Unified Home CTA */}
      <HomeCta />
    </InternalLayout>
  );
}
