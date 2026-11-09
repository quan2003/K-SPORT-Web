import type { Metadata } from "next";
import { InternalLayout } from "@/components/portal-ui";
import { LegalShell, type LegalTocItem } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng dịch vụ | K-SPORT Karate Tournament Platform",
  description: "Các quy định, điều khoản pháp lý và quy chuẩn vận hành khi truy cập, sử dụng phần mềm và tham gia giải đấu trên nền tảng K-SPORT theo quy chuẩn thể thao WKF.",
};

const termsToc: LegalTocItem[] = [
  { id: "terms-acceptance", num: "01", title: "Chấp thuận điều khoản" },
  { id: "terms-ip", num: "02", title: "Sở hữu trí tuệ" },
  { id: "terms-accounts", num: "03", title: "Tài khoản điều hành" },
  { id: "terms-referee", num: "04", title: "Ranh giới chuyên môn" },
  { id: "terms-athlete-pass", num: "05", title: "Thẻ VĐV & Mã QR" },
  { id: "terms-integrity", num: "06", title: "Liêm chính thể thao" },
  { id: "terms-availability", num: "07", title: "Vận hành ngoại tuyến" },
  { id: "terms-obligations", num: "08", title: "Trách nhiệm các bên" },
  { id: "terms-disclaimer", num: "09", title: "Miễn trừ trách nhiệm" },
  { id: "terms-termination", num: "10", title: "Xử lý vi phạm" },
  { id: "terms-law-contact", num: "11", title: "Luật điều chỉnh & Liên hệ" },
];

export default function TermsPage() {
  return (
    <InternalLayout>
      <LegalShell
        title="Điều Khoản Sử Dụng Dịch Vụ"
        docSubtitle="Quy chế pháp lý, quyền sở hữu trí tuệ, tính độc lập của trọng tài và quy chuẩn vận hành Hệ thống K-SPORT chuẩn WKF."
        version="2026.1"
        effectiveDate="Tháng 01/2026"
        toc={termsToc}
      >
        {/* Chapter 01 */}
        <section id="terms-acceptance" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 01</span>
            <h2 className="ks-legal-sec-title">Chấp thuận điều khoản & Phạm vi áp dụng</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Chào mừng bạn đến với <strong>K-SPORT</strong> — Nền tảng công nghệ số hóa chuyên nghiệp phục vụ công tác tổ chức, bốc thăm chia nhánh, điều phối thảm đấu Tatami, chấm điểm điện tử và công bố dữ liệu kết quả giải đấu Karate.
            </p>
            <p>
              Bằng việc truy cập cổng thông tin điện tử, cài đặt hoặc sử dụng phần mềm điều hành K-SPORT, hoặc tham gia vào bất kỳ giải đấu nào được quản lý bởi hệ thống K-SPORT, bạn xác nhận đã đọc, hiểu rõ và đồng ý bị ràng buộc bởi toàn bộ các điều khoản được quy định trong văn bản này, cùng với <strong>Điều lệ của từng giải đấu cụ thể</strong> do Ban tổ chức ban hành.
            </p>
            <p>
              Nếu bạn đại diện cho một Câu lạc bộ, Đoàn thể thao, hoặc Đơn vị tổ chức giải đấu, bạn cam kết rằng bạn có đầy đủ thẩm quyền pháp lý để ràng buộc đơn vị của mình tuân thủ các điều khoản này.
            </p>
          </div>
        </section>

        {/* Chapter 02 */}
        <section id="terms-ip" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 02</span>
            <h2 className="ks-legal-sec-title">Quyền sở hữu trí tuệ & Bản quyền phần mềm</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Toàn bộ quyền sở hữu trí tuệ liên quan đến hệ sinh thái K-SPORT thuộc quyền sở hữu độc quyền của K-SPORT và được bảo hộ theo Luật Sở hữu trí tuệ Việt Nam cùng các điều ước quốc tế có liên quan:
            </p>

            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">💻 Phần mềm & Mã nguồn</h4>
                <p className="ks-legal-card-desc">
                  Giao diện bàn điều hành thảm đấu, thuật toán bốc thăm phân nhánh sơ đồ (bracket generation engine), hệ thống đếm giờ và tính điểm điện tử Tatami, ứng dụng máy trạm hiển thị màn hình LED.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">🎨 Thiết kế & Nhận diện</h4>
                <p className="ks-legal-card-desc">
                  Biểu tượng (logo) K-SPORT, bố cục giao diện hiển thị, cấu trúc Thẻ thi đấu số hóa (Athlete Pass) và định dạng xuất biên bản thi đấu.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">📊 Cơ sở dữ liệu thi đấu</h4>
                <p className="ks-legal-card-desc">
                  Cấu trúc dữ liệu phân loại hạng cân, nhóm tuổi, lịch sử đối đầu và bảng điểm xếp hạng phong trào.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">⚖️ Nhãn hiệu & Thương hiệu</h4>
                <p className="ks-legal-card-desc">
                  Tên thương mại, logo K-SPORT và các dấu hiệu nhận diện dịch vụ số hóa giải đấu.
                </p>
              </div>
            </div>

            <div className="ks-legal-callout">
              <h4 className="ks-legal-callout-title">
                <span aria-hidden="true">🚫</span> Các hành vi nghiêm cấm về sở hữu trí tuệ
              </h4>
              <p className="ks-legal-callout-text">
                Nghiêm cấm tuyệt đối mọi hành vi sao chép, phân phối lại, dịch ngược mã nguồn (reverse engineering), can thiệp API trái phép, hoặc sử dụng phần mềm tự động (bot, scraper, crawler) để trích xuất dữ liệu của K-SPORT nhằm phục vụ mục đích thương mại không được cấp phép hoặc các mục đích phi thể thao.
              </p>
            </div>
          </div>
        </section>

        {/* Chapter 03 */}
        <section id="terms-accounts" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 03</span>
            <h2 className="ks-legal-sec-title">Trách nhiệm tài khoản điều hành & Bàn thư ký thảm đấu</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Để đảm bảo tính nghiêm minh và chuẩn xác của giải đấu, việc phân quyền và quản lý tài khoản trên hệ thống K-SPORT được kiểm soát chặt chẽ:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bảo mật tài khoản:</strong> Cán bộ Ban tổ chức, Thư ký giải và Trọng tài được cấp quyền truy cập trạm máy thảm đấu có trách nhiệm bảo mật tuyệt đối thông tin đăng nhập, không để lộ mật khẩu hoặc để người không có nhiệm vụ can thiệp vào máy trạm.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Trách nhiệm tác vụ:</strong> Mọi thao tác ghi điểm, tạm dừng trận đấu, xác nhận kết quả hoặc điều chỉnh danh sách trên hệ thống đều được ghi nhận gắn liền với tài khoản được phân công và được coi là hành động chính thức của người sử dụng tài khoản đó.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bàn giao thiết bị:</strong> Khi kết thúc ca làm việc hoặc kết thúc phiên thi đấu, nhân sự điều hành phải thực hiện đăng xuất an toàn khỏi trạm máy thảm đấu trước khi rời khỏi khu vực bàn thư ký.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 04 */}
        <section id="terms-referee" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 04</span>
            <h2 className="ks-legal-sec-title">Ranh giới chuyên môn & Tính độc lập của Trọng tài</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT hoạt động với nguyên tắc công nghệ hỗ trợ và tuân thủ tuyệt đối chuẩn mực thể thao quốc tế của Liên đoàn Karate Thế giới (WKF):
            </p>

            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">🖥️ Hệ thống là công cụ hỗ trợ</h4>
                <p className="ks-legal-card-desc">
                  K-SPORT là giải pháp số hóa phục vụ công tác điều phối, tính điểm và hiển thị dữ liệu; hệ thống không thay thế quyền phán quyết chuyên môn của Tổ trọng tài.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">⚖️ Quyền hạn Ban trọng tài</h4>
                <p className="ks-legal-card-desc">
                  Quyết định về tính điểm (Yuko, Waza-ari, Ippon), mức cảnh cáo phạt (Chui, Hansoku), quyền ưu tiên Senshu, hoặc hủy quyền thi đấu thuộc quyền hạn tối cao của Tổ trọng tài và Tổng trọng tài.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">📝 Quy trình khiếu nại chuyên môn</h4>
                <p className="ks-legal-card-desc">
                  Mọi khiếu nại về quyết định của trọng tài, điểm số hay kết quả trận đấu bắt buộc phải được thực hiện bằng văn bản chính thức nộp trực tiếp cho Ban trọng tài theo đúng quy trình và thời hạn trong Điều lệ giải.
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">❌ Không xử lý qua website</h4>
                <p className="ks-legal-card-desc">
                  K-SPORT không tiếp nhận, không can thiệp và không giải quyết bất kỳ khiếu nại chuyên môn thể thao nào thông qua hòm thư hỗ trợ, tin nhắn hay giao diện cổng thông tin.
                </p>
              </div>
            </div>

            <p>
              Khi Ban trọng tài có quyết định đính chính hoặc điều chỉnh kết quả chính thức theo biên bản giải quyết khiếu nại, Ban thư ký giải sẽ cập nhật lại kết quả trên hệ thống K-SPORT để công bố công khai.
            </p>
          </div>
        </section>

        {/* Chapter 05 */}
        <section id="terms-athlete-pass" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 05</span>
            <h2 className="ks-legal-sec-title">Quy định về Thẻ Vận động viên & Mã định danh QR Code</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Thẻ VĐV số hóa do K-SPORT cung cấp là căn cước thi đấu chính thức hợp lệ của vận động viên trong suốt thời gian diễn ra giải đấu:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bảo quản và xuất trình:</strong> VĐV có trách nhiệm mang theo thẻ thi đấu và xuất trình mã QR khi làm thủ tục cân kiểm tra hạng cân, điểm danh tại khu vực khởi động (Marshalling area) và trước khi bước vào thảm Tatami.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Tính duy nhất và không chuyển nhượng:</strong> Mỗi mã định danh gắn liền với một VĐV duy nhất. Nghiêm cấm mọi hành vi cho mượn thẻ, hoán đổi thẻ, thi đấu thay người, hoặc chỉnh sửa thông tin in trên thẻ.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Xử lý vi phạm thẻ thi đấu:</strong> Trường hợp phát hiện gian lận thẻ thi đấu hoặc gian lận độ tuổi/hạng cân, Ban tổ chức giải có toàn quyền truất quyền thi đấu của VĐV, hủy bỏ toàn bộ kết quả đạt được và thông báo kỷ luật về đơn vị chủ quản theo Điều lệ giải.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 06 */}
        <section id="terms-integrity" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 06</span>
            <h2 className="ks-legal-sec-title">Liêm chính thể thao & Phòng chống tiêu cực, cá cược</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT kiên định bảo vệ tinh thần cao thượng và lễ tiết võ đạo của môn Karate (Reigi), tuân thủ Bộ quy tắc đạo đức WKF và Bộ quy tắc IOC về phòng chống thao túng kết quả thi đấu:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Nghiêm cấm cá cược thể thao:</strong> Tuyệt đối nghiêm cấm việc sử dụng dữ liệu kết quả, lịch đấu, tỷ số thời gian thực hoặc thông tin vận động viên của K-SPORT vào mục đích tổ chức, tham gia hoặc tiếp tay cho các hoạt động cá cược, cá độ dưới bất kỳ hình thức nào.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Chống dàn xếp tỷ số:</strong> Mọi hành vi cố tình làm sai lệch điểm số, nhường điểm, bỏ cuộc phi thể thao sẽ bị xử lý nghiêm khắc theo Điều lệ giải và Luật Thể dục, Thể thao.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Hợp tác điều tra:</strong> K-SPORT sẵn sàng trích xuất và cung cấp toàn bộ nhật ký Audit Log hệ thống cho Ban tổ chức giải và cơ quan công an có thẩm quyền khi phát hiện các dấu hiệu tiêu cực hoặc phá hoại giải đấu.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 07 */}
        <section id="terms-availability" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 07</span>
            <h2 className="ks-legal-sec-title">Tính sẵn sàng của dịch vụ & Chế độ vận hành ngoại tuyến</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Phần mềm K-SPORT được xây dựng với kiến trúc phục vụ chuyên biệt cho môi trường nhà thi đấu thể thao:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Vận hành mạng nội bộ LAN:</strong> Hệ thống trạm máy thảm đấu Tatami có khả năng vận hành độc lập qua mạng LAN tại chỗ, bảo đảm trận đấu vẫn diễn ra thông suốt, điểm số được ghi nhận chính xác ngay cả khi Internet công cộng bị mất kết nối.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Đồng bộ khi có kết nối:</strong> Dữ liệu từ các thảm đấu sẽ tự động đồng bộ hóa lên cổng thông tin trực tuyến ngay khi kết nối Internet được khôi phục.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Bảo trì kỹ thuật:</strong> K-SPORT cam kết không thực hiện các đợt nâng cấp, bảo trì hệ thống gây gián đoạn trong khung giờ diễn ra các trận thi đấu chính thức của giải.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 08 */}
        <section id="terms-obligations" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 08</span>
            <h2 className="ks-legal-sec-title">Trách nhiệm của Ban tổ chức giải & Đoàn thể thao tham dự</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Sự thành công và minh bạch của giải đấu đòi hỏi sự phối hợp chặt chẽ giữa các bên tham gia:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Trách nhiệm Ban tổ chức giải:</strong> Bảo đảm tính pháp lý của giải đấu; ban hành Điều lệ giải rõ ràng; chuẩn bị cơ sở vật chất, bàn thảm đấu và nhân sự bàn thư ký; phê duyệt danh sách vận động viên và phê duyệt kết quả chung cuộc.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Trách nhiệm Trưởng đoàn & Huấn luyện viên:</strong> Đăng ký danh sách vận động viên chính xác về độ tuổi, hạng cân và nội dung; rà soát biên bản bốc thăm trong phiên họp kỹ thuật; quán triệt VĐV tuân thủ đúng giờ gọi vào thảm Tatami và chấp hành quyết định của Ban trọng tài.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Trách nhiệm Vận động viên:</strong> Thi đấu với tinh thần trung thực, cao thượng; chuẩn bị trang phục thi đấu (Karategi, giáp, đai Aka/Ao) đúng tiêu chuẩn WKF; tôn trọng đối thủ và quyết định của trọng tài.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 09 */}
        <section id="terms-disclaimer" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 09</span>
            <h2 className="ks-legal-sec-title">Miễn trừ trách nhiệm & Giới hạn bồi thường</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Trong phạm vi tối đa được pháp luật Việt Nam cho phép:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Cung cấp dịch vụ theo nguyên trạng:</strong> Cổng thông tin K-SPORT được cung cấp trên cơ sở &ldquo;nguyên trạng&rdquo; (as-is) nhằm phục vụ công tác thông tin thể thao. K-SPORT nỗ lực tối đa để dữ liệu hiển thị cập nhật và chính xác nhất theo tín hiệu từ bàn điều hành.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Sự cố bất khả kháng:</strong> K-SPORT không chịu trách nhiệm đối với sự gián đoạn truyền tải trên Internet xuất phát từ sự cố mất điện lưới tại nhà thi đấu, đường truyền cáp quang của nhà mạng bên thứ ba, tấn công mạng diện rộng hoặc thiên tai bất khả kháng.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Thiệt hại gián tiếp:</strong> K-SPORT không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, thiệt hại ngẫu nhiên nào phát sinh từ việc sử dụng hoặc không thể truy cập website nếu nguyên nhân không xuất phát từ lỗi cố ý của hệ thống K-SPORT.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 10 */}
        <section id="terms-termination" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 10</span>
            <h2 className="ks-legal-sec-title">Xử lý vi phạm & Chấm dứt quyền truy cập</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              K-SPORT bảo lưu quyền áp dụng các biện pháp kỹ thuật và pháp lý đối với các hành vi vi phạm:
            </p>
            <ul className="ks-legal-bullets">
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Đình chỉ tài khoản:</strong> Ngay lập tức thu hồi quyền truy cập đối với các tài khoản có hành vi chia sẻ trái phép, nhập điểm sai lệch cố ý, hoặc có dấu hiệu bị xâm nhập bảo mật.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Chặn truy cập địa chỉ IP:</strong> Chặn vĩnh viễn các địa chỉ IP hoặc dải mạng thực hiện các hành vi tấn công từ chối dịch vụ (DDoS), quét lỗ hổng bảo mật hoặc trích xuất dữ liệu trái phép.</span>
              </li>
              <li>
                <span className="ks-legal-bullet-icon" aria-hidden="true">✓</span>
                <span><strong>Chuyển giao hồ sơ cơ quan pháp luật:</strong> Trường hợp hành vi vi phạm gây thiệt hại nghiêm trọng hoặc có dấu hiệu tội phạm hình sự (như làm giả hồ sơ thi đấu, phá hoại hệ thống mạng), K-SPORT sẽ chuyển giao toàn bộ chứng cứ cho cơ quan có thẩm quyền xử lý theo quy định pháp luật.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Chapter 11 */}
        <section id="terms-law-contact" className="ks-legal-section">
          <header className="ks-legal-sec-header">
            <span className="ks-legal-sec-tag">CHƯƠNG 11</span>
            <h2 className="ks-legal-sec-title">Luật điều chỉnh, Giải quyết tranh chấp & Liên hệ</h2>
          </header>
          <div className="ks-legal-body">
            <p>
              Điều khoản này được điều chỉnh và giải thích theo quy định của pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam và Luật Thể dục, Thể thao.
            </p>
            <p>
              Mọi tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng nền tảng K-SPORT trước hết sẽ được ưu tiên giải quyết thông qua thương lượng, hòa giải trên tinh thần tôn trọng lẫn nhau. Trường hợp không thể thương lượng thành công, tranh chấp sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Việt Nam.
            </p>

            <div className="ks-legal-cards-grid">
              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">📞 Hỗ Trợ Kỹ Thuật & Điều Lệ Giải</h4>
                <p className="ks-legal-card-desc">
                  <strong style={{ fontSize: "16px", color: "#073b7a" }}>0336 440 523</strong> (Zalo / Hotline)
                </p>
              </div>

              <div className="ks-legal-card-item">
                <h4 className="ks-legal-card-title">✉️ Ban Pháp Chế & Bản Quyền K-SPORT</h4>
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
