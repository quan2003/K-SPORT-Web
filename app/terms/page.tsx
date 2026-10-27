import type { Metadata } from "next";
import { InternalLayout, PageHero } from "@/components/portal-ui";

export const metadata: Metadata = { title: "Điều khoản sử dụng" };

export default function TermsPage() {
  return (
    <InternalLayout>
      <PageHero title="Điều khoản sử dụng" description="Điều khoản sử dụng cổng thông tin K-SPORT đang được hoàn thiện." />
      <section className="content-section legal-page">
        <h2>Nội dung sẽ được công bố trước khi vận hành chính thức</h2>
        <p>Trang này sẽ nêu rõ phạm vi sử dụng nội dung công khai, quyền và trách nhiệm của người dùng, cùng kênh hỗ trợ chính thức của K-SPORT.</p>
        <p>Trong thời gian chờ công bố, vui lòng gửi câu hỏi đến <a href="mailto:lienhe@k-sport.net">lienhe@k-sport.net</a>.</p>
      </section>
    </InternalLayout>
  );
}
