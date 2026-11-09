import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { LegalShell, type LegalTocItem } from "@/components/legal-shell";
import { CookieSettingsButton } from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "Chính sách Cookie & Công nghệ theo dõi | K-SPORT Karate Tournament Platform",
  description: "Thông tin chi tiết về các loại cookie, mục đích sử dụng và cách quản lý tùy chọn cookie trên hệ thống K-SPORT theo chuẩn minh bạch quốc tế WKF.",
};

const cookiesToc: LegalTocItem[] = [
  { id: "cookie-intro", num: "01", title: "Cookie là gì?" },
  { id: "cookie-table", num: "02", title: "Bảng kê chi tiết" },
  { id: "cookie-necessary", num: "03", title: "Cookie cần thiết" },
  { id: "cookie-analytics", num: "04", title: "Cookie phân tích" },
  { id: "cookie-preferences", num: "05", title: "Cookie tiện ích" },
  { id: "cookie-manage", num: "06", title: "Quản lý tùy chọn" },
  { id: "cookie-browser", num: "07", title: "Cài đặt trình duyệt" },
  { id: "cookie-contact", num: "08", title: "Hỗ trợ kỹ thuật" },
];

export default function CookiesPage() {
  return (
    <InternalLayout>
      <LegalShell
        title="Chính Sách Cookie & Công Nghệ Theo Dõi"
        docSubtitle="Thông tin minh bạch và chi tiết về việc sử dụng cookie, lưu trữ dữ liệu cục bộ và quyền kiểm soát của bạn khi truy cập K-SPORT theo quy chuẩn quốc tế WKF."
        version="2026.1"
        effectiveDate="Tháng 01/2026"
        toc={cookiesToc}
      >
        {/* Chapter 01 */}
        <section id="cookie-intro" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 01</span>
            <h2 className="ks-legal-sec-title">Khái niệm Cookie & Nguyên tắc minh bạch của K-SPORT</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Cookie là những tệp văn bản nhỏ được lưu trữ trên trình duyệt hoặc thiết bị máy tính của bạn khi bạn truy cập một website. Cookie cho phép website nhận diện thiết bị của bạn trong những lần truy cập tiếp theo, ghi nhớ các tùy chọn cá nhân và hỗ trợ việc vận hành an toàn.
            </p>
            <p>
              Tuân theo thông lệ tốt nhất của Liên đoàn Karate Thế giới (WKF) và Ủy ban Olympic Quốc tế (IOC), <strong>K-SPORT cam kết tôn trọng quyền riêng tư tối đa của người dùng</strong>: Chúng tôi chỉ sử dụng cookie cho các mục đích kỹ thuật thiết yếu, thống kê truy cập ẩn danh phục vụ ổn định đường truyền thi đấu, và hoàn toàn <strong>KHÔNG</strong> sử dụng cookie cho mạng lưới quảng cáo theo dõi bên thứ ba.
            </p>
          </div>
        </section>

        {/* Chapter 02 */}
        <section id="cookie-table" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 02</span>
            <h2 className="ks-legal-sec-title">Bảng kê chi tiết các Cookie được sử dụng trên K-SPORT</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Dưới đây là danh sách chi tiết các cookie và dữ liệu lưu trữ cục bộ (Local Storage) mà hệ thống K-SPORT có thể sử dụng trong quá trình bạn truy cập:
            </p>

            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Tên Cookie</th>
                    <th>Nhà cung cấp</th>
                    <th>Mục đích sử dụng</th>
                    <th>Thời hạn</th>
                    <th>Phân loại</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>ks_cookie_consent</code></td>
                    <td>k-sport.net</td>
                    <td>Lưu trạng thái chấp thuận cookie của bạn (Cần thiết, Phân tích, Tùy chọn).</td>
                    <td>12 tháng</td>
                    <td><span className="legal-badge-pill required">Bắt buộc</span></td>
                  </tr>
                  <tr>
                    <td><code>ks_session</code></td>
                    <td>k-sport.net</td>
                    <td>Duy trì phiên làm việc bảo mật cho cán bộ Ban tổ chức và Trọng tài bàn thảm.</td>
                    <td>Phiên (Session)</td>
                    <td><span className="legal-badge-pill required">Bắt buộc</span></td>
                  </tr>
                  <tr>
                    <td><code>ks_csrf_token</code></td>
                    <td>k-sport.net</td>
                    <td>Bảo vệ hệ thống chống lại các cuộc tấn công giả mạo yêu cầu chéo trang.</td>
                    <td>Phiên (Session)</td>
                    <td><span className="legal-badge-pill required">Bắt buộc</span></td>
                  </tr>
                  <tr>
                    <td><code>ks_tatami_view</code></td>
                    <td>k-sport.net</td>
                    <td>Ghi nhớ chế độ hiển thị ưa thích của bạn (Dạng Thẻ trận đấu hay Dạng Bảng).</td>
                    <td>6 tháng</td>
                    <td><span className="legal-badge-pill optional">Tiện ích</span></td>
                  </tr>
                  <tr>
                    <td><code>ks_active_tatami</code></td>
                    <td>k-sport.net</td>
                    <td>Ghi nhớ thảm đấu bạn đang chọn theo dõi gần nhất (Thảm 1, Thảm 2, Thảm 3).</td>
                    <td>30 ngày</td>
                    <td><span className="legal-badge-pill optional">Tiện ích</span></td>
                  </tr>
                  <tr>
                    <td><code>ks_perf_timing</code></td>
                    <td>k-sport.net</td>
                    <td>Đo lường thời gian tải dữ liệu thảm đấu ẩn danh để tối ưu đường truyền nhà thi đấu.</td>
                    <td>7 ngày</td>
                    <td><span className="legal-badge-pill optional">Phân tích</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Chapter 03 */}
        <section id="cookie-necessary" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 03</span>
            <h2 className="ks-legal-sec-title">Cookie cần thiết (Strictly Necessary Cookies)</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Đây là các cookie cốt lõi không thể thiếu để website hoạt động ổn định và an toàn:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bảo mật & Toàn vẹn hệ thống:</strong> Giúp xác thực phiên đăng nhập của Ban thư ký, ngăn chặn việc can thiệp trái phép vào dữ liệu điểm số từ bên ngoài.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Ghi nhớ quyền riêng tư:</strong> Lưu lại lựa chọn đồng ý hoặc từ chối của bạn đối với các loại cookie khác để chúng tôi không làm phiền bạn với banner thông báo ở mỗi trang.</span>
              </li>
            </ul>
            <p>
              <em>Lưu ý:</em> Bạn không thể vô hiệu hóa nhóm cookie này trong hệ thống tùy chọn của K-SPORT vì website sẽ không thể vận hành bình thường nếu thiếu chúng.
            </p>
          </div>
        </section>

        {/* Chapter 04 */}
        <section id="cookie-analytics" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 04</span>
            <h2 className="ks-legal-sec-title">Cookie phân tích & Đo lường hiệu năng (Analytics Cookies)</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Nhóm cookie này giúp chúng tôi hiểu cách khán giả và các đoàn thể thao tương tác với website giải đấu:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Đo lường tải trọng thảm đấu:</strong> Thống kê số lượng người đang theo dõi trực tiếp từng thảm Tatami để bộ phận kỹ thuật chủ động nâng cấp băng thông mạng trong giờ cao điểm trận chung kết.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Thống kê ẩn danh hoàn toàn:</strong> Dữ liệu được tổng hợp dưới dạng số liệu thống kê chung (như số lượt xem trận, thời gian phản hồi máy chủ), không thu thập danh tính cá nhân của người xem.</span>
              </li>
            </ul>
            <p>
              Nhóm cookie này chỉ được kích hoạt khi bạn bấm <strong>&ldquo;Chấp nhận tất cả&rdquo;</strong> hoặc chủ động bật trong mục <strong>&ldquo;Quản lý tùy chọn&rdquo;</strong>.
            </p>
          </div>
        </section>

        {/* Chapter 05 */}
        <section id="cookie-preferences" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 05</span>
            <h2 className="ks-legal-sec-title">Cookie tiện ích & Trải nghiệm cá nhân (Preferences Cookies)</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Nhóm cookie này giúp cá nhân hóa giao diện phù hợp với nhu cầu theo dõi của bạn:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bộ lọc thảm đấu yêu thích:</strong> Ghi nhớ thảm đấu bạn đang tập trung quan sát (ví dụ: Huấn luyện viên chỉ theo dõi Thảm 2) để tự động mở lại đúng thảm đó khi bạn tải lại trang.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Định dạng bảng điểm:</strong> Ghi nhớ bạn thích xem lịch đấu dạng Thẻ thể thao (Cards) hay Dạng bảng chi tiết (Table view) để hiển thị đồng nhất trên các trang tiếp theo.</span>
              </li>
            </ul>
            <p>
              Bạn có thể tự do bật hoặc tắt nhóm cookie này bất cứ lúc nào mà không làm ảnh hưởng đến việc xem thông tin trận đấu cơ bản.
            </p>
          </div>
        </section>

        {/* Chapter 06 */}
        <section id="cookie-manage" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 06</span>
            <h2 className="ks-legal-sec-title">Quản lý và Tùy chỉnh Cookie trực tiếp trên K-SPORT</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Bạn có toàn quyền kiểm soát các cookie được lưu trên thiết bị của mình. Bấm vào nút dưới đây để mở bảng tùy chọn và thay đổi cài đặt cookie bất kỳ lúc nào:
            </p>

            <div style={{ marginTop: "20px", marginBottom: "20px" }}>
              <CookieSettingsButton />
            </div>

            <div className="ks-legal-callout">
              <h4 className="ks-legal-callout-title">
                <span aria-hidden="true">⚙️</span> Thay đổi có hiệu lực tức thì
              </h4>
              <p className="ks-legal-callout-text">
                Khi bạn tắt một nhóm cookie, hệ thống sẽ tự động ngừng sử dụng và xóa bỏ các cookie liên quan khỏi trình duyệt của bạn ngay trong phiên truy cập tiếp theo.
              </p>
            </div>
          </div>
        </section>

        {/* Chapter 07 */}
        <section id="cookie-browser" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 07</span>
            <h2 className="ks-legal-sec-title">Hướng dẫn quản lý & xóa Cookie trên trình duyệt máy tính</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Ngoài công cụ cài đặt của K-SPORT, hầu hết các trình duyệt web trên máy tính (laptop/desktop) đều cho phép bạn kiểm tra, chặn hoặc xóa cookie thông qua phần Cài đặt của trình duyệt:
            </p>

            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">🌐 Google Chrome</h4>
                <p className="ks-legal-card-desc">
                  Cài đặt (Settings) → Quyền riêng tư và bảo mật (Privacy and security) → Cookie của bên thứ ba → Xem tất cả dữ liệu và quyền của trang web.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">🌐 Microsoft Edge</h4>
                <p className="ks-legal-card-desc">
                  Cài đặt (Settings) → Cookie và quyền của trang web (Cookies and site permissions) → Quản lý và xóa cookie và dữ liệu trang web.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">🌐 Mozilla Firefox</h4>
                <p className="ks-legal-card-desc">
                  Cài đặt (Settings) → Quyền riêng tư & Bảo mật (Privacy & Security) → Cookie và Dữ liệu trang web (Cookies and Site Data).
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">🌐 Apple Safari (macOS)</h4>
                <p className="ks-legal-card-desc">
                  Tùy chọn (Preferences) → Quyền riêng tư (Privacy) → Quản lý dữ liệu trang web (Manage Website Data).
                </p>
              </div>
            </div>

            <p style={{ marginTop: "16px" }}>
              <em>Lưu ý kỹ thuật:</em> Nếu bạn chặn toàn bộ cookie (bao gồm cả cookie cần thiết) trong trình duyệt, một số tính năng điều hành hoặc đăng nhập quản trị giải trên K-SPORT có thể không hoạt động chính xác.
            </p>
          </div>
        </section>

        {/* Chapter 08 */}
        <section id="cookie-contact" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 08</span>
            <h2 className="ks-legal-sec-title">Bộ phận hỗ trợ kỹ thuật & An toàn thông tin</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ thêm về chính sách cookie của K-SPORT, xin vui lòng liên hệ bộ phận hỗ trợ kỹ thuật:
            </p>
            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">📞 Hỗ Trợ Kỹ Thuật Hệ Thống</h4>
                <p className="ks-legal-card-desc">
                  <strong style={{ fontSize: "16px", color: "#073b7a" }}>0336 440 523</strong> (Hotline / Zalo)
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">✉️ Email Tiếp Nhận Kỹ Thuật</h4>
                <p className="ks-legal-card-desc">
                  <strong style={{ fontSize: "16px", color: "#073b7a" }}>lienhe@k-sport.net</strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      </LegalShell>
    </InternalLayout>
  );
}
