import Link from "next/link";
import Image from "next/image";

export function HomeCta() {
  return (
    <section className="ks-cta-section" aria-label="Kêu gọi hợp tác và tổ chức giải">
      <div className="ks-section-container">
        <div className="ks-cta-card">
          <div className="ks-cta-media">
            <Image
              src="/images/karate-venue.png"
              alt="Nhà thi đấu Karate K-SPORT"
              fill
              className="ks-cta-bg-img"
              sizes="(max-width: 960px) 100vw, 50vw"
            />
            <div className="ks-cta-media-overlay" />
          </div>

          <div className="ks-cta-content">
            <span className="ks-cta-tag">ĐỒNG HÀNH CÙNG GIẢI ĐẤU CỦA BẠN</span>
            <h2 className="ks-cta-title">
              Sẵn Sàng Nâng Tầm <br className="ks-cta-br" />
              <span className="ks-nowrap-phrase">Công tác Tổ chức</span> Giải Karate?
            </h2>
            <p className="ks-cta-desc">
              Từ giải phong trào các câu lạc bộ đến giải vô địch trẻ và cúp quốc gia — K-SPORT mang đến giải pháp phần mềm toàn diện, minh bạch và chính xác tuyệt đối.
            </p>

            <div className="ks-cta-features">
              <div className="ks-cta-feat-item">
                <span className="ks-check-icon">✓</span>
                <span>Hỗ trợ kỹ thuật & nhân sự trực tiếp tại sàn đấu</span>
              </div>
              <div className="ks-cta-feat-item">
                <span className="ks-check-icon">✓</span>
                <span>Tùy biến thể thức bốc thăm theo điều lệ từng giải</span>
              </div>
              <div className="ks-cta-feat-item">
                <span className="ks-check-icon">✓</span>
                <span>Xuất biên bản, chứng nhận và video quay chậm</span>
              </div>
            </div>

            <div className="ks-cta-contact-direct">
              <span className="ks-cta-contact-label">Hotline & Zalo hỗ trợ giải đấu:</span>
              <a href="https://zalo.me/0336440523" target="_blank" rel="noreferrer" className="ks-cta-hotline-link">
                0336440523 (Zalo)
              </a>
            </div>

            <div className="ks-cta-actions">
              <Link href="/contact" className="ks-btn ks-btn-primary">
                <span>Liên Hệ Tư Vấn Tổ Chức Giải</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="https://zalo.me/0336440523" target="_blank" rel="noreferrer" className="ks-btn ks-btn-outline-white">
                <span>Nhắn Zalo Ngay</span>
              </a>
              <a href="mailto:lienhe@k-sport.net" className="ks-btn ks-btn-outline-white">
                <span>lienhe@k-sport.net</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
