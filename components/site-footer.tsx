import Image from "next/image";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { SOFTWARE_RELEASE } from "@/lib/software-release";
import { getSponsorsStore } from "@/lib/admin-store";

export function SiteFooter() {
  const allSponsors = getSponsorsStore();
  const footerSponsors = allSponsors.filter((s) => s.isActive && s.placements?.includes("footer"));
  return (
    <footer className="ks-site-footer" aria-label="Chân trang K-SPORT">
      {/* Top Banner / Trust Bar in Footer */}
      <div className="ks-footer-trust-bar">
        <div className="ks-footer-container">
          <div className="ks-trust-item">
            <div>
              <strong>Chuẩn Quy Chế WKF</strong>
              <span>Áp dụng quy tắc thi đấu Kumite & Kata quốc tế</span>
            </div>
          </div>
          <div className="ks-trust-item">
            <div>
              <strong>Bảng Điểm Thời Gian Thực</strong>
              <span>Đồng bộ máy tính bảng & màn hình LED sàn đấu</span>
            </div>
          </div>
          <div className="ks-trust-item">
            <div>
              <strong>Bảo Mật Dữ Liệu</strong>
              <span>Minh bạch sơ đồ bốc thăm & điểm số các đoàn</span>
            </div>
          </div>
          <div className="ks-trust-item">
            <div>
              <strong>Hỗ Trợ Kỹ Thuật 24/7</strong>
              <span>Hotline & Zalo: 0336 440 523</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer */}
      <div className="ks-footer-main">
        <div className="ks-footer-container">
          <div className="ks-footer-grid">
            {/* Col 1: Brand & Intro */}
            <div className="ks-footer-col ks-brand-col">
              <Link href="/" className="ks-footer-logo-link" aria-label="K-SPORT Trang chủ">
                <Image
                  src="/images/logo-footer-update.png"
                  alt="K-SPORT Karate Portal"
                  width={240}
                  height={80}
                  className="ks-footer-logo-img"
                />
              </Link>
              <p className="ks-footer-bio">
                Cổng thông tin và nền tảng phần mềm quản lý, điều hành giải đấu Karate chuyên nghiệp tại Việt Nam. Kết nối ban tổ chức, tổ trọng tài, võ sinh và khán giả trong một nhịp đấu.
              </p>
              <div className="ks-footer-social-links" aria-label="Mạng xã hội và liên hệ">
                <a
                  href="https://www.facebook.com/profile.php?id=61581419480925"
                  target="_blank"
                  rel="noreferrer"
                  className="ks-social-btn fb"
                  aria-label="Facebook K-SPORT"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="mailto:lienhe@k-sport.net"
                  className="ks-social-btn mail"
                  aria-label="Email K-SPORT"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </a>
                <a
                  href="https://zalo.me/0336440523"
                  target="_blank"
                  rel="noreferrer"
                  className="ks-zalo-pill"
                  aria-label="Zalo Hỗ trợ"
                >
                  <span>Zalo: <strong>0336 440 523</strong></span>
                </a>
              </div>
            </div>

            {/* Col 2: Giải Đấu & Thi Đấu */}
            <div className="ks-footer-col">
              <h4 className="ks-footer-heading">Hệ Thống Giải Đấu</h4>
              <ul className="ks-footer-links">
                <li><Link href="/events">Danh sách giải toàn quốc</Link></li>
                <li><Link href="/schedule">Lịch thi đấu các thảm</Link></li>
                <li><Link href="/results">Kết quả thi đấu chi tiết</Link></li>
                <li><Link href="/ranking">Bảng xếp hạng vận động viên</Link></li>
                <li><Link href="/athletes">Hồ sơ võ sĩ & Thẻ VĐV QR</Link></li>
              </ul>
            </div>

            {/* Col 3: Phần Mềm & Tính Năng */}
            <div className="ks-footer-col">
              <h4 className="ks-footer-heading">Phần Mềm K-SPORT</h4>
              <ul className="ks-footer-links">
                <li><Link href="/software">Tổng quan nền tảng điều hành</Link></li>
                <li>
                  <Link
                    href="/software#download"
                    className="ks-footer-download-link"
                    style={{ color: "#d50b27", fontWeight: 700 }}
                  >
                    ⬇ Tải phần mềm ({SOFTWARE_RELEASE.tag})
                  </Link>
                </li>
                <li><Link href="/software">Bốc thăm phân nhánh tự động</Link></li>
                <li><Link href="/software">Bảng điểm điện tử Tatami LED</Link></li>
                <li><Link href="/pricing">Bảng giá triển khai & Thiết bị</Link></li>
                <li><Link href="/contact">Đăng ký trải nghiệm demo</Link></li>
              </ul>
            </div>

            {/* Col 4: Hỗ Trợ & Pháp Lý */}
            <div className="ks-footer-col">
              <h4 className="ks-footer-heading">Hỗ Trợ & Thông Tin</h4>
              <ul className="ks-footer-links">
                <li><Link href="/news">Tin tức & Hoạt động chuyên môn</Link></li>
                <li><Link href="/contact">Liên hệ tư vấn giải đấu</Link></li>
                <li><Link href="/privacy">Chính sách bảo mật thông tin</Link></li>
                <li><Link href="/terms">Điều khoản sử dụng dịch vụ</Link></li>
                <li><Link href="/cookies">Chính sách cookie & theo dõi</Link></li>
                <li><Link href="/admin">Cổng quản trị Ban Tổ Chức</Link></li>
              </ul>
              <div className="ks-footer-contact-box">
                <span className="ks-contact-label">Email hỗ trợ 24/7:</span>
                <a href="mailto:lienhe@k-sport.net" className="ks-contact-email">lienhe@k-sport.net</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Footer Sponsors & Equipment Brands Strip */}
      {footerSponsors.length > 0 && (
        <div className="ks-footer-sponsors-strip">
          <div className="ks-footer-container">
            <div className="ks-footer-sponsors-inner">
              <div className="ks-footer-sponsors-logos">
                {footerSponsors.map((s) => (
                  <a
                    key={s.id}
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ks-footer-sponsor-item"
                    title={`${s.name} — ${s.category}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logo} alt={s.name} className="ks-footer-sponsor-img" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Copyright Bar */}
      <div className="ks-footer-bottom">
        <div className="ks-footer-container">
          <div className="ks-bottom-inner">
            <span className="ks-copyright">
              © 2026 K-SPORT. Nền tảng quản lý & số hóa giải đấu Karate Việt Nam. Tất cả quyền được bảo lưu.
            </span>
            <div className="ks-bottom-nav">
              <Link href="/privacy">Bảo mật</Link>
              <span className="dot">·</span>
              <Link href="/terms">Điều khoản</Link>
              <span className="dot">·</span>
              <CookieSettingsButton />
              <span className="dot">·</span>
              <Link href="/contact">Trợ giúp</Link>
            </div>
            <a href="#top" className="ks-back-to-top" aria-label="Cuộn lên đầu trang">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
