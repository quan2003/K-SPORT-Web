import type { Metadata } from "next";
import Link from "next/link";
import { InternalLayout } from "@/components/portal-ui";

export const metadata: Metadata = {
  title: "Đăng ký VĐV trực tuyến — K-SPORT",
  description: "Cổng đăng ký vận động viên thi đấu Karate theo đường dẫn giải đấu từ Ban Tổ Chức.",
};

export default function DangKyIndexPage() {
  return (
    <InternalLayout>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Cổng đăng ký K-SPORT</span>
          <h1>Đăng ký Vận động viên theo liên kết giải đấu</h1>
          <p>
            Hệ thống chỉ mở đăng ký thông qua đường dẫn riêng do Ban Tổ Chức cung cấp cho từng giải đấu.
          </p>
        </div>
      </section>

      <section className="section">
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div className="panel" style={{ maxWidth: 680, marginInline: "auto", padding: "2rem" }}>
            <h2 style={{ marginTop: 0 }}>Vui lòng mở đúng liên kết của giải đấu</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Mỗi giải đấu có một đường dẫn đăng ký riêng theo định dạng{" "}
              <code>https://www.k-sport.net/dang-ky/ten-giai-dau</code> do Ban Tổ Chức gửi cho các đoàn và huấn luyện viên.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
              <Link href="/events" className="button red">
                Xem danh sách giải đấu
              </Link>
              <Link href="/" className="button">
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </InternalLayout>
  );
}
