# K-SPORT Design System — Production Portal v3

## 1. Định hướng

K-SPORT là cổng thông tin Karate Việt Nam và là lối vào sản phẩm quản lý, điều hành giải đấu. Giao diện ưu tiên giải đấu, lịch, kết quả, vận động viên, xếp hạng và tin tức; phần giới thiệu phần mềm đứng sau nội dung thể thao.

Art direction: **Arena Information Rail**. Ảnh Karate là điểm neo; lịch đấu, kết quả, thứ hạng và tin tức đi qua một hệ lưới chung, giống nhịp đọc của bảng thông tin tại nhà thi đấu. Tham chiếu triển khai nằm trong `design-references/v3/` và `design-references/v4/`.

WKF.net chỉ là tham chiếu về kiến trúc thông tin. Không sao chép thương hiệu, mã nguồn, hình ảnh hay nội dung của WKF.

## 2. Nguyên tắc hình ảnh

- Modern sports federation, không phải landing page SaaS hoặc slide thuyết trình.
- Nền chính trắng; navy dành cho hero, phần mềm và footer; xám chỉ là surface phụ.
- Ảnh Karate lớn, crop mạnh, góc vuông; không dùng hình ảnh hoặc logo của tổ chức khác.
- Không gradient, glass, glow, resting shadow, badge trang trí, card grid lặp lại hoặc box lồng box.
- Không tạo nội dung để lấp chỗ trống. Khi API chưa có bản ghi, dùng empty state có hướng dẫn rõ.
- Ảnh tạo cho art direction không được trình bày như bằng chứng về một giải đấu hay vận động viên có thật.

## 3. Màu thương hiệu

| Token | Giá trị | Vai trò |
| --- | --- | --- |
| `--red` | `#D50B27` | CTA chính, Aka, điểm nhấn |
| `--blue` | `#073B7A` | Link, Ao, CTA phụ |
| `--navy` | `#061A34` | Hero, phần mềm, footer |
| `--ink` | `#111820` | Chữ chính |
| `--muted` | `#536071` | Chữ phụ đạt tương phản |
| `--paper` | `#FFFFFF` | Nền trang |
| `--surface` | `#EEF2F6` | Hàng dữ liệu, skeleton, trạng thái |
| `--line` | `#D5DCE5` | Table và form |

Đỏ và xanh mang nghĩa thi đấu; không dùng đồng thời như trang trí tùy ý.

## 4. Typography

- Display: **Barlow Condensed**, 700; tiêu đề ngắn, tối đa hai dòng.
- Body/UI: **Barlow**, 400/500/600; hỗ trợ tiếng Việt.
- Hero: `clamp(3rem, 5.5vw, 5.8rem)`; không tràn màn hình.
- Section heading: `clamp(2.25rem, 4vw, 4.5rem)`.
- Body: 17–19px, line-height 1.55; metadata tối thiểu 13px.
- Điểm và thời gian dùng `font-variant-numeric: tabular-nums`.

## 5. Grid và nhịp

- Frame: `min(100% - 40px, 1320px)`; mobile `100% - 32px`.
- Desktop 12 cột; section cách nhau 96–136px. Mobile 64–84px.
- Header sticky cao 88px; nav desktop một hàng; mobile dùng menu kín có kiểm soát focus.
- Không tạo khoảng trống lớn không mang nội dung.
- Mỗi section có composition riêng nhưng dùng chung lưới, type, màu và media treatment.

## 6. Component

### Header

Logo K-SPORT chính thức bên trái; navigation nội dung; CTA “Phần mềm K-SPORT”. Mobile dùng target tối thiểu 44px, Escape đóng menu và khóa cuộn nền.

### Hero và live rail

Ảnh Karate phủ chiều ngang, scrim navy phẳng để đọc chữ. H1 tối đa hai dòng, một CTA chính và một link phụ. Rail cuối hero lấy lịch thi đấu thật; khi chưa có dữ liệu, giữ đúng geometry và thông báo thời điểm công bố.

### Event và news

Một mục lớn kết hợp danh sách theo hàng; không dùng ba card giống nhau. Ngày, địa điểm và trạng thái chỉ xuất hiện khi API cung cấp.

### Schedule, results và ranking

Table thật trên desktop; mobile chuyển thành hàng hai tầng. Aka đỏ, Ao xanh. Filter có label nhìn thấy. Loading, empty và error giữ cùng khung với dữ liệu thật.

### Athlete và club

Chỉ hiển thị trường công khai: tên, CLB, hạng mục và kết quả đã được phép công bố. Không hiển thị ngày sinh đầy đủ, số điện thoại, địa chỉ, giấy tờ hoặc dữ liệu sức khỏe.

### Software

Field navy và giao diện điều hành dưới `data-ui`; không browser frame, không vanity metric. Nội dung mô tả năng lực sản phẩm, không tạo khách hàng hoặc số liệu hiệu quả.

### Forms và states

Label luôn nhìn thấy; target tối thiểu 44px; focus ring 3px. Form liên hệ mở ứng dụng email của người dùng tới `lienhe@k-sport.net` cho đến khi có dịch vụ gửi thư phía máy chủ. Mỗi nguồn dữ liệu có loading, empty và error state rõ.

## 7. Motion

- Hero image scale rất nhẹ khi vào trang; không parallax gây chóng mặt.
- Section reveal tối đa 16px bằng opacity/transform, chạy một lần.
- Hover và press chỉ animate transform, opacity hoặc màu cụ thể; không `transition: all`.
- Không animation lặp vô hạn; `prefers-reduced-motion` loại bỏ travel và giữ nội dung hiện hữu.

## 8. Responsive

- 1440px: hero 72–78svh; event 7/5; schedule 6/6; news 7/5; athlete/ranking 5/7.
- 768px: navigation chuyển menu; các khối chính về một cột.
- 390px: lề 16px; bảng thành danh sách; không horizontal scroll; target tối thiểu 44px.
- Ảnh có kích thước rõ; hero eager, ảnh dưới fold lazy.

## 9. Biên dữ liệu production

- `lib/public-data.ts` là lớp duy nhất đọc dữ liệu công khai.
- Server Components gọi API thông qua `KSPORT_PUBLIC_API_URL`; token đọc tùy chọn nằm trong `KSPORT_PUBLIC_API_TOKEN`.
- Không có API hoặc collection rỗng thì giao diện hiển thị empty state; không fallback sang record giả.
- API chỉ đọc dữ liệu đã được đánh dấu công khai. Website không truy cập trực tiếp desktop app, Admin hoặc database.
- Endpoints kỳ vọng: `/events`, `/schedule`, `/results`, `/athletes`, `/clubs`, `/ranking`, `/news` và route chi tiết tương ứng.
- Ảnh trong `public/images/` là tài sản art direction hiện có; cần xác nhận quyền sử dụng hoặc thay bằng ảnh sở hữu trước khi phát hành rộng rãi.

## 10. Tài sản thương hiệu

- Logo do chủ dự án cung cấp: `public/images/logo_K-SPORT.jpg`.
- Không đổi màu, tái tạo hoặc thêm hiệu ứng vào logo.
- Email công khai: `lienhe@k-sport.net`.

## 11. Checklist phát hành

- Một `h1` mỗi trang; heading tối đa hai dòng tại 1440, 768 và 390px.
- Skip link, active nav, `:focus-visible`, form label, alt text và semantic landmarks.
- Không fake live status, giải đấu, thành tích, tin tức, khách hàng hoặc số liệu.
- Kiểm tra loading, empty, error và 404.
- Chạy lint, typecheck, build, taste lint/inspector và Playwright ở 1440/768/390.
- Không deploy hoặc push Git tự động.
