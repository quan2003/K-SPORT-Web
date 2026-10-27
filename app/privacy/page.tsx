import type { Metadata } from "next";
import { InternalLayout, PageHero } from "@/components/portal-ui";

export const metadata: Metadata = { title: "Chính sách bảo mật" };

export default function PrivacyPage() {
  return (
    <InternalLayout>
      <PageHero title="Chính sách bảo mật" description="Thông tin về phạm vi dữ liệu công khai và cách liên hệ K-SPORT." />
      <section className="content-section legal-page">
        <h2>Thông tin đang được hoàn thiện</h2>
        <p>Website hiện chỉ công bố dữ liệu thi đấu đã được đơn vị tổ chức xác nhận. K-SPORT không hiển thị thông tin cá nhân nhạy cảm của vận động viên trên cổng công khai.</p>
        <p>Để yêu cầu thông tin hoặc phản hồi về dữ liệu công khai, liên hệ <a href="mailto:lienhe@k-sport.net">lienhe@k-sport.net</a>.</p>
      </section>
    </InternalLayout>
  );
}
