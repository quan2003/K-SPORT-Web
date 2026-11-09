import type { Metadata } from "next";
import Link from "next/link";
import { InternalLayout } from "@/components/portal-ui";
import { LegalShell, type LegalTocItem } from "@/components/legal-shell";
import { CookieSettingsButton } from "@/components/cookie-consent";

export const metadata: Metadata = {
  title: "Chính sách bảo mật dữ liệu | K-SPORT Karate Tournament Platform",
  description: "Quy chuẩn thu thập, xử lý và bảo vệ dữ liệu thi đấu, hồ sơ vận động viên và thẻ định danh số hóa trên hệ thống K-SPORT theo Nghị định 13/2023/NĐ-CP và hướng dẫn WKF.",
};

const privacyToc: LegalTocItem[] = [
  { id: "privacy-controller", num: "01", title: "Đơn vị & Phạm vi áp dụng" },
  { id: "privacy-data-types", num: "02", title: "Các nhóm dữ liệu thu thập" },
  { id: "privacy-purpose", num: "03", title: "Mục đích & Cơ sở pháp lý" },
  { id: "privacy-transparency", num: "04", title: "Công khai vs Bảo mật" },
  { id: "privacy-minors", num: "05", title: "Bảo vệ VĐV trẻ em" },
  { id: "privacy-qr-pass", num: "06", title: "Thẻ VĐV & Mã QR" },
  { id: "privacy-security", num: "07", title: "An ninh & Audit Log" },
  { id: "privacy-cookies", num: "08", title: "Chính sách cookie" },
  { id: "privacy-rights", num: "09", title: "Quyền chủ thể dữ liệu" },
  { id: "privacy-retention", num: "10", title: "Thời hạn lưu trữ" },
  { id: "privacy-support", num: "11", title: "Liên hệ & Tiếp nhận" },
];

export default function PrivacyPage() {
  return (
    <InternalLayout>
      <LegalShell
        title="Chính Sách Bảo Mật Dữ Liệu"
        docSubtitle="Quy chuẩn toàn diện về thu thập, xử lý và bảo vệ dữ liệu cá nhân, thành tích thi đấu và thẻ số hóa trên Hệ thống Quản lý Giải đấu K-SPORT theo Nghị định 13/2023/NĐ-CP và WKF."
        version="2026.1"
        effectiveDate="Tháng 01/2026"
        toc={privacyToc}
      >
        {/* Chapter 01 */}
        <section id="privacy-controller" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 01</span>
            <h2 className="ks-legal-sec-title">Đơn vị kiểm soát dữ liệu & Phạm vi áp dụng</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Hệ thống Quản lý và Điều hành Giải đấu Karate <strong>K-SPORT</strong> là nền tảng số hóa chuyên dụng phục vụ công tác bốc thăm phân nhánh, điều phối thảm đấu Tatami, chấm điểm điện tử và công bố kết quả trực tuyến cho các giải đấu Karate phong trào và thành tích cao tại Việt Nam.
            </p>
            <p>
              K-SPORT cam kết tuân thủ nghiêm ngặt các quy định pháp luật hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam, đặc biệt là <strong>Nghị định số 13/2023/NĐ-CP</strong> về Bảo vệ dữ liệu cá nhân, Luật Thể dục, Thể thao và các quy chuẩn hướng dẫn về an toàn dữ liệu của <strong>Liên đoàn Karate Thế giới (WKF)</strong> cùng <strong>Ủy ban Olympic Quốc tế (IOC)</strong>.
            </p>
            <p>
              Chính sách này áp dụng đối với tất cả các đối tượng tham gia hoặc tương tác với nền tảng, bao gồm: Ban tổ chức giải đấu, Ban trọng tài, Huấn luyện viên, Trưởng đoàn, Vận động viên (VĐV), Câu lạc bộ Karate trực thuộc và Người dùng truy cập cổng thông tin công khai.
            </p>
          </div>
        </section>

        {/* Chapter 02 */}
        <section id="privacy-data-types" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 02</span>
            <h2 className="ks-legal-sec-title">Các nhóm dữ liệu thu thập & xử lý</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Để phục vụ việc tổ chức giải đấu một cách công bằng, chính xác và minh bạch, K-SPORT thu thập và xử lý các nhóm thông tin chuyên môn thể thao sau:
            </p>

            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  Hồ sơ Vận động viên
                </h4>
                <p className="ks-legal-card-desc">
                  Họ và tên, giới tính, năm sinh/nhóm tuổi thi đấu (U10, U12, U14, U16, U18, U21, Vô địch), đơn vị/câu lạc bộ đại diện, ảnh thẻ thi đấu, cấp đai và nội dung đăng ký (Kata/Kumite).
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">⏱️</span> Dữ liệu điều hành trận đấu
                </h4>
                <p className="ks-legal-card-desc">
                  Thứ tự trận, số thảm Tatami, phân bổ góc đai Aka (Đỏ) / Ao (Xanh), thời gian thi đấu dự kiến, thời gian vào thảm thực tế.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">🏆</span> Kết quả & Điểm số chuyên môn
                </h4>
                <p className="ks-legal-card-desc">
                  Điểm kỹ thuật Kumite (Yuko, Waza-ari, Ippon), mức cảnh cáo/thẻ phạt (Chui, Hansoku Chui, Hansoku, Kiken, Shikaku), điểm biểu diễn Kata theo thang điểm WKF, kết quả thắng/thua, huy chương và điểm xếp hạng toàn đoàn.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">📋</span> Dữ liệu nhân sự điều hành
                </h4>
                <p className="ks-legal-card-desc">
                  Danh sách Tổ trọng tài chính, Trọng tài góc, Giám sát bàn thư ký, tài khoản kỹ thuật quản trị thảm đấu.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">💻</span> Dữ liệu nhật ký máy trạm
                </h4>
                <p className="ks-legal-card-desc">
                  Địa chỉ IP, chuỗi tác tử người dùng (User-Agent), thời gian ghi nhận điểm từ bàn điều hành thảm đấu để phục vụ an ninh và đối soát kết quả.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">⚙️</span> Dữ liệu tùy chọn tương tác
                </h4>
                <p className="ks-legal-card-desc">
                  Tùy chọn lọc thảm đấu, chế độ xem bảng điểm/thẻ trận, và trạng thái chấp thuận cookie được lưu trữ cục bộ trên trình duyệt người dùng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 03 */}
        <section id="privacy-purpose" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 03</span>
            <h2 className="ks-legal-sec-title">Mục đích xử lý dữ liệu & Cơ sở pháp lý</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT thu thập và xử lý dữ liệu cho các mục đích chính đáng, minh bạch và gắn liền với nghiệp vụ tổ chức thi đấu thể thao:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bốc thăm phân nhánh tự động:</strong> Chia sơ đồ thi đấu (Brackets) theo thuật toán WKF, bảo đảm tính công bằng và tuân thủ nguyên tắc tránh cùng đơn vị ở vòng ngoài.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Điều phối tiến độ thảm Tatami:</strong> Hỗ trợ bàn thư ký gọi tên VĐV vào thảm đúng giờ và đồng bộ dữ liệu trận đấu lên màn hình LED.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Chấm điểm điện tử thời gian thực:</strong> Lưu trữ dữ liệu đối đầu và xuất biên bản thi đấu chính thức có xác nhận của Ban trọng tài.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Công bố công khai kết quả & thành tích:</strong> Cập nhật tức thì bảng tổng sắp huy chương, thứ tự trận và bảng xếp hạng niên độ cho cộng đồng võ thuật.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Cấp phát Thẻ thi đấu số hóa (Athlete Pass):</strong> Tích hợp mã định danh QR để kiểm soát danh tính và quyền vào khu vực thảm đấu.</span>
              </li>
            </ul>
            <p>
              <strong>Cơ sở pháp lý:</strong> Việc xử lý dữ liệu được thực hiện căn cứ trên sự đồng ý của VĐV/Đoàn thể thao khi đăng ký thi đấu, thực hiện nghĩa vụ hợp đồng dịch vụ số hóa giải đấu với Ban tổ chức, và đáp ứng yêu cầu công khai minh bạch kết quả thể thao theo Luật Thể dục, Thể thao.
            </p>
          </div>
        </section>

        {/* Chapter 04 */}
        <section id="privacy-transparency" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 04</span>
            <h2 className="ks-legal-sec-title">Ranh giới minh bạch: Dữ liệu công khai vs Dữ liệu bảo mật nghiêm ngặt</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT phân định ranh giới rõ ràng giữa dữ liệu phục vụ mục đích công khai chuyên môn thể thao và dữ liệu nhạy cảm cần được bảo mật tuyệt đối:
            </p>

            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Hạng mục thông tin</th>
                    <th>Trạng thái hiển thị</th>
                    <th>Mục đích sử dụng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Họ tên, Đơn vị/CLB, Hạng cân, Nội dung thi đấu</strong></td>
                    <td><span className="legal-badge-pill required">Công khai</span></td>
                    <td>Hiển thị trên bảng thi đấu, màn hình LED thảm và bảng kết quả trực tuyến.</td>
                  </tr>
                  <tr>
                    <td><strong>Điểm số, Kết quả trận đấu, Huy chương, Thứ hạng</strong></td>
                    <td><span className="legal-badge-pill required">Công khai</span></td>
                    <td>Minh bạch kết quả thi đấu chuyên môn thể thao theo chuẩn WKF.</td>
                  </tr>
                  <tr>
                    <td><strong>Ảnh đại diện trên Thẻ thi đấu số</strong></td>
                    <td><span className="legal-badge-pill required">Công khai</span></td>
                    <td>Đối chiếu nhận diện VĐV tại bàn cân và cửa vào thảm đấu.</td>
                  </tr>
                  <tr>
                    <td><strong>Số Căn cước công dân (CCCD) / Hộ chiếu / Định danh cá nhân</strong></td>
                    <td><span className="legal-badge-pill optional">Bảo mật tuyệt đối</span></td>
                    <td>Chỉ dùng kiểm tra tư cách hợp lệ vòng hồ sơ của Ban tổ chức. Không bao giờ hiển thị công khai.</td>
                  </tr>
                  <tr>
                    <td><strong>Ngày tháng năm sinh chi tiết của trẻ em</strong></td>
                    <td><span className="legal-badge-pill optional">Bảo mật tuyệt đối</span></td>
                    <td>Chỉ hiển thị nhóm tuổi thi đấu (VD: Kumite Nam U14). Giữ kín ngày sinh cụ thể.</td>
                  </tr>
                  <tr>
                    <td><strong>Số điện thoại, Địa chỉ cư trú, Hồ sơ y tế</strong></td>
                    <td><span className="legal-badge-pill optional">Bảo mật tuyệt đối</span></td>
                    <td>Chỉ lưu trữ nội bộ Ban y tế và Ban tổ chức giải. Tuyệt đối không xuất bản.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="ks-legal-callout">
              <h4 className="ks-legal-callout-title">
                <span aria-hidden="true">🛡️</span> Cam kết liêm chính dữ liệu K-SPORT
              </h4>
              <p className="ks-legal-callout-text">
                K-SPORT cam kết không bán, không cho thuê, không trao đổi và không chuyển giao dữ liệu cá nhân của Vận động viên, Huấn luyện viên cho bất kỳ bên thứ ba nào vì mục đích tiếp thị, quảng cáo hay tài chính thương mại.
              </p>
            </div>
          </div>
        </section>

        {/* Chapter 05 */}
        <section id="privacy-minors" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 05</span>
            <h2 className="ks-legal-sec-title">Bảo vệ dữ liệu Vận động viên Vị thành niên & Thiếu nhi</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Phong trào Karate có tỉ lệ tham gia rất lớn của các lứa tuổi thanh thiếu nhi (U8, U10, U12, U14, U16). K-SPORT đặt quyền lợi và sự an toàn của trẻ em làm ưu tiên cao nhất, tuân thủ Luật Trẻ em Việt Nam và Hướng dẫn An toàn Vận động viên Trẻ của Ủy ban Olympic Quốc tế (IOC Safeguarding Youth Athletes):
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Cơ chế đăng ký qua người đại diện:</strong> Hồ sơ của VĐV dưới 16 tuổi bắt buộc phải được đăng ký và xác nhận thông qua Huấn luyện viên trưởng, Trưởng đoàn được ủy quyền hợp pháp hoặc Cha/Mẹ/Người giám hộ.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bảo vệ quyền riêng tư định danh:</strong> Trên các giao diện công cộng, hệ thống chỉ hiển thị họ tên, câu lạc bộ và nhóm tuổi thi đấu; toàn bộ địa chỉ gia đình, trường học, số liên lạc cá nhân đều được ẩn hoàn toàn.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Kiểm soát hình ảnh thi đấu:</strong> Ảnh thẻ VĐV phục vụ mục đích duy nhất là kiểm tra đúng người vào thảm đấu. Phụ huynh hoặc đoàn thể thao có quyền yêu cầu thay thế hoặc điều chỉnh ảnh hồ sơ nếu phát hiện sai sót.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 06 */}
        <section id="privacy-qr-pass" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 06</span>
            <h2 className="ks-legal-sec-title">Thẻ thi đấu số hóa & Mã định danh QR Code</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Mỗi VĐV tham gia giải đấu được cấp một Thẻ thi đấu số (Athlete Pass) chứa mã định danh duy nhất (Unique Athlete Identifier). Cơ chế vận hành của mã QR được thiết kế tuân thủ nghiêm ngặt nguyên tắc bảo mật tối thiểu:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Mã QR là khóa tra cứu công khai (Public Lookup Key):</strong> Khi quét mã QR bằng điện thoại hoặc đầu đọc tại nhà thi đấu, hệ thống sẽ mở trang thông tin lịch đấu công khai của VĐV đó trên cổng K-SPORT.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Không chứa thông tin mật:</strong> Bản thân chuỗi mã QR không chứa số CCCD, dữ liệu sinh trắc học hay bất kỳ thông tin nhạy cảm nào.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Hỗ trợ điều phối tức thì:</strong> Giao diện hiển thị trạng thái trận sắp đấu, số thảm Tatami và góc đai quy định (Aka hoặc Ao), giúp VĐV và Huấn luyện viên chủ động chuẩn bị trang phục thi đấu đạt chuẩn WKF tại khu vực khởi động.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 07 */}
        <section id="privacy-security" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 07</span>
            <h2 className="ks-legal-sec-title">Biện pháp an toàn, Lưu trữ & Nhật ký Audit Log</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT áp dụng các tiêu chuẩn an toàn kỹ thuật cao cấp nhằm bảo vệ toàn vẹn dữ liệu thi đấu trước các rủi ro can thiệp kết quả hoặc rò rỉ thông tin:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Mã hóa đường truyền dữ liệu:</strong> Toàn bộ dữ liệu trao đổi giữa máy chủ K-SPORT và các trạm máy chấm điểm thảm đấu đều được mã hóa bằng giao thức TLS/HTTPS 256-bit chuẩn công nghiệp.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Khả năng vận hành ngoại tuyến (Offline & Local LAN):</strong> Phần mềm tại nhà thi đấu được thiết kế để có thể vận hành độc lập qua mạng nội bộ LAN, đảm bảo giải đấu diễn ra liên tục, an toàn ngay cả khi đường truyền Internet diện rộng gặp sự cố.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Hệ thống Audit Log chống gian lận kết quả:</strong> Mọi thao tác nhập điểm, bấm giờ, cộng/trừ lỗi phạt hay điều chỉnh danh sách thi đấu của Bàn thư ký đều được ghi lại trong nhật ký kiểm toán hệ thống với dấu thời gian chính xác đến từng mili-giây, danh tính tài khoản thực hiện và địa chỉ trạm máy.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Phân quyền truy cập đa cấp:</strong> Chỉ các tài khoản được Ban tổ chức chỉ định chính thức mới có quyền bốc thăm, điều phối thảm hoặc xác nhận kết quả chung cuộc.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 08 */}
        <section id="privacy-cookies" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 08</span>
            <h2 className="ks-legal-sec-title">Chính sách Cookie & Công nghệ theo dõi</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT sử dụng cookie và các công nghệ lưu trữ cục bộ tương tự nhằm duy trì hoạt động ổn định của website và nâng cao trải nghiệm theo dõi thi đấu. Chúng tôi phân loại cookie thành 3 nhóm rõ ràng theo chuẩn quốc tế:
            </p>

            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">🔒</span> 1. Cookie cần thiết (Bắt buộc)
                </h4>
                <p className="ks-legal-card-desc">
                  Duy trì phiên đăng nhập quản trị, bảo vệ an ninh chống tấn công giả mạo (CSRF) và ghi nhớ lựa chọn cookie của bạn. Luôn bật để hệ thống vận hành.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">📊</span> 2. Cookie phân tích & hiệu năng
                </h4>
                <p className="ks-legal-card-desc">
                  Thu thập số liệu thống kê ẩn danh về lượt truy cập các thảm đấu và tốc độ tải trang, giúp tối ưu đường truyền phục vụ lượng truy cập lớn trong ngày chung kết.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">⚙️</span> 3. Cookie tùy chọn & tiện ích
                </h4>
                <p className="ks-legal-card-desc">
                  Ghi nhớ chế độ hiển thị bạn ưa thích (xem dạng Thẻ trận đấu hay Dạng Bảng chi tiết) và giải đấu bạn đang theo dõi.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">
                  <span aria-hidden="true">🎛️</span> Quyền kiểm soát của bạn
                </h4>
                <p className="ks-legal-card-desc">
                  Bạn có toàn quyền bật hoặc tắt các nhóm cookie phân tích và tiện ích bất kỳ lúc nào thông qua bảng điều khiển tùy chọn.
                </p>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <CookieSettingsButton />
              <Link href="/cookies" className="ks-btn ks-btn-outline-dark" style={{ padding: "8px 18px", fontSize: "14px" }}>
                Xem Bảng kê chi tiết Cookie Policy →
              </Link>
            </div>
          </div>
        </section>

        {/* Chapter 09 */}
        <section id="privacy-rights" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 09</span>
            <h2 className="ks-legal-sec-title">Quyền của chủ thể dữ liệu & Quy trình đính chính thông tin</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Theo quy định của Nghị định 13/2023/NĐ-CP và tinh thần minh bạch thể thao, Vận động viên và Đơn vị tham gia giải có đầy đủ các quyền hợp pháp sau:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Quyền được biết & tra cứu:</strong> VĐV có quyền tra cứu toàn bộ lịch thi đấu, kết quả trận đấu, điểm phạt và thành tích huy chương của mình trên hệ thống.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Quyền yêu cầu đính chính sai sót:</strong> Trước thời điểm bốc thăm chính thức hoặc trong phiên họp kỹ thuật giải, nếu phát hiện sai lệch về họ tên, câu lạc bộ đại diện hoặc phân hạng cân, Trưởng đoàn có quyền yêu cầu Ban thư ký giải đính chính thông tin.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Quyền bảo mật hình ảnh:</strong> VĐV hoặc người giám hộ có quyền đề nghị thay đổi ảnh thẻ đại diện nếu ảnh chụp chưa phù hợp với quy chuẩn trang phục thi đấu Karate.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Quyền khiếu nại về bảo vệ dữ liệu:</strong> Trường hợp có phản ánh về việc dữ liệu cá nhân bị sử dụng sai mục đích, chủ thể dữ liệu có thể liên hệ trực tiếp với Bộ phận An toàn Thông tin K-SPORT để được xử lý theo quy định.</span>
              </li>
            </ul>
            <p>
              <em>Lưu ý chuyên môn:</em> Kết quả các trận đấu đã hoàn thành, biên bản thi đấu đã được Tổng trọng tài phê duyệt và bảng tổng sắp huy chương được coi là dữ liệu lịch sử thể thao chính thức của giải đấu và không thuộc phạm vi xóa bỏ cá nhân sau khi giải đã bế mạc.
            </p>
          </div>
        </section>

        {/* Chapter 10 */}
        <section id="privacy-retention" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 10</span>
            <h2 className="ks-legal-sec-title">Thời hạn lưu trữ dữ liệu & Ứng phó sự cố</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT áp dụng chính sách lưu trữ dữ liệu theo vòng đời giải đấu thể thao chuyên nghiệp:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Hồ sơ kết quả và lịch sử huy chương:</strong> Được lưu trữ lâu dài trên hệ thống lưu trữ dữ liệu thể thao quốc gia của K-SPORT nhằm phục vụ việc xếp hạng VĐV (Ranking), theo dõi tiến bộ phong trào và tra cứu thành tích niên độ.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Nhật ký kỹ thuật và trạm máy thảm đấu:</strong> Dữ liệu kết nối máy trạm, nhật ký audit trạm thảm và địa chỉ IP được lưu trữ an toàn trong 90 ngày sau khi giải đấu bế mạc, sau đó được tự động tổng hợp ẩn danh hoặc xóa bỏ.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Quy trình ứng phó sự cố an ninh:</strong> Trong trường hợp phát hiện bất kỳ sự cố an toàn dữ liệu nào có khả năng ảnh hưởng đến quyền lợi người dùng, K-SPORT sẽ thông báo cho Ban tổ chức giải đấu và cơ quan có thẩm quyền trong thời hạn 72 giờ theo quy định pháp luật.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 11 */}
        <section id="privacy-support" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 11</span>
            <h2 className="ks-legal-sec-title">Bộ phận tiếp nhận & Kênh liên hệ pháp lý</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Mọi thắc mắc, yêu cầu đính chính dữ liệu thi đấu hoặc đóng góp ý kiến về chính sách bảo mật xin vui lòng gửi về Bộ phận Pháp chế & Kỹ thuật K-SPORT:
            </p>
            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">💬 Hotline / Zalo Kỹ Thuật Giải Đấu</h4>
                <p className="ks-legal-card-desc">
                  <strong style={{ fontSize: "16px", color: "#073b7a" }}>0336 440 523</strong><br />
                  Hỗ trợ khẩn cấp 24/7 đối với các giải đấu đang diễn ra trên thảm.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">✉️ Hộp Thư Tiếp Nhận Văn Bản & Bảo Mật</h4>
                <p className="ks-legal-card-desc">
                  <strong style={{ fontSize: "16px", color: "#073b7a" }}>lienhe@k-sport.net</strong><br />
                  Tiếp nhận công văn, yêu cầu đính chính dữ liệu và văn bản pháp lý.
                </p>
              </div>
            </div>
          </div>
        </section>
      </LegalShell>
    </InternalLayout>
  );
}
