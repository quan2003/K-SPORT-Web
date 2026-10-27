# Kết nối dữ liệu K-SPORT với website

## Kiến trúc production

Website không kết nối trực tiếp vào ứng dụng desktop hoặc cơ sở dữ liệu. Desktop và Admin tiếp tục ghi dữ liệu qua hệ thống hiện có; website chỉ đọc một API công khai, giới hạn trường và quyền truy cập.

```text
Desktop / Admin → Cloud sync có xác thực → Database
                         ↓
                 Public read API
                         ↓
            Next.js server → Người xem
```

Luồng này không mở database ra Internet, không đưa token vào trình duyệt và không thay đổi cách desktop đang vận hành.

## Adapter đã chuẩn bị trong website

`lib/public-data.ts` đã là biên dữ liệu duy nhất cho các trang công khai. Đặt biến môi trường server-side:

```dotenv
KSPORT_PUBLIC_API_URL=https://admin.luuquancoder.id.vn/api/public
KSPORT_PUBLIC_API_TOKEN=
```

Token là tùy chọn. Nếu VPS đặt `PUBLIC_API_TOKEN`, website phải dùng cùng giá trị trong `KSPORT_PUBLIC_API_TOKEN`. Không đặt prefix `NEXT_PUBLIC_`.

Adapter kỳ vọng các endpoint:

- `GET /events` và `GET /events/{slug}`
- `GET /schedule`
- `GET /results`
- `GET /athletes` và `GET /athletes/{publicId}`
- `GET /clubs` và `GET /clubs/{publicId}`
- `GET /ranking`
- `GET /news` và `GET /news/{slug}`

Collection có thể trả mảng JSON trực tiếp hoặc `{ "items": [...] }`. Khi chưa cấu hình URL, website trả collection rỗng và hiển thị empty state production; không dùng dữ liệu giả.

## Trường dữ liệu công khai

Chỉ trả bản ghi đã được đánh dấu công khai. Không trả ngày sinh đầy đủ, số điện thoại, địa chỉ, giấy tờ, dữ liệu sức khỏe, tài khoản đăng nhập hoặc dữ liệu nội bộ của ban tổ chức.

Trong ứng dụng desktop, bật **Công khai trên website K-SPORT** ở form tạo/chỉnh sửa giải rồi đồng bộ Cloud. VPS tạo một snapshot theo whitelist; website không đọc trực tiếp `backup_data`. Tắt lựa chọn này và đồng bộ lại để gỡ giải khỏi API công khai.

Lịch và kết quả đang revalidate sau 15 giây; giải đấu, vận động viên và xếp hạng sau 60 giây; tin tức sau 300 giây. Có thể thay cache bằng webhook revalidation khi API hỗ trợ.

## Bảo mật

- Tạo credential chỉ đọc riêng cho website.
- Không dùng token của ứng dụng desktop.
- Ưu tiên server-to-server; không cần mở CORS cho trình duyệt.
- Rate limit, audit log và lọc trường ở phía API.
- Dùng HTTPS, xoay vòng token và không commit `.env`.
- Chỉ công bố kết quả đã được ban tổ chức xác nhận.

## Triển khai VPS

1. Deploy `license-server/server.js` và `license-server/public-data.js` cùng lúc.
2. Khởi động lại PM2; migration `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` chạy tự động.
3. Tùy chọn đặt `PUBLIC_API_TOKEN` trên VPS và `KSPORT_PUBLIC_API_TOKEN` trên website.
4. Cấu hình `KSPORT_PUBLIC_API_URL` trong môi trường deploy của Next.js.
5. Đồng bộ lại từng giải muốn công khai từ bản desktop mới.

Cloud upload và tải backup dùng license đang hoạt động cùng Machine ID đã kích hoạt. Mỗi giải bị khóa theo license sở hữu và Máy Nguồn Chính; endpoint kiểm tra sync không còn trả Machine ID hoặc kích thước backup.
