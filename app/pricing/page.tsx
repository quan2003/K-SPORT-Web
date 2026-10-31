import Link from "next/link";
import type { Metadata } from "next";
import { InternalLayout, PageHero } from "@/components/portal-ui";

export const metadata: Metadata = { title: "Chi phí triển khai", description: "Tư vấn phương án triển khai K-SPORT theo quy mô giải Karate." };

export default function PricingPage() {
  return (
    <InternalLayout>
      <PageHero title="Chi phí triển khai" description="Phương án được xác định theo quy mô giải, hạ tầng và phạm vi hỗ trợ." />
      <section className="pricing-page">
        <div><h2>Mỗi giải đấu có một phạm vi vận hành khác nhau.</h2><p>K-SPORT khảo sát quy trình tổ chức, số lượng nội dung thi, thảm, thiết bị và nhu cầu hỗ trợ trước khi đề xuất phương án.</p></div>
        <div><h2>Nội dung trao đổi</h2><ul><li>Quy mô và hình thức giải đấu</li><li>Cấu hình nội dung thi</li><li>Thiết bị và hạ tầng hiện có</li><li>Đào tạo đội ngũ vận hành</li><li>Phạm vi hỗ trợ trong thời gian tổ chức</li></ul><Link className="button red" href="/contact">Nhận tư vấn <span aria-hidden="true">→</span></Link></div>
      </section>
    </InternalLayout>
  );
}
