import Link from "next/link";
import type { Metadata } from "next";
import { InternalLayout, PageHero } from "@/components/portal-ui";

export const metadata: Metadata = { title: "Chi phí triển khai", description: "Tư vấn phương án triển khai K-SPORT theo quy mô giải Karate." };

export default function PricingPage() {
  return (
    <InternalLayout>
      <PageHero title="Chi phí triển khai" description="Phương án được xác định theo quy mô giải, hạ tầng và phạm vi hỗ trợ." />
      <section className="pricing-page">
        <div className="pricing-statement"><span className="pricing-index" aria-hidden="true">01</span><div><h2>Mỗi giải đấu cần một phương án riêng.</h2><p>K-SPORT khảo sát quy trình tổ chức, số lượng nội dung thi, thảm, thiết bị và nhu cầu hỗ trợ trước khi đề xuất phương án.</p></div></div>
        <div className="pricing-scope"><header><span className="pricing-index" aria-hidden="true">02</span><h2>Nội dung trao đổi</h2></header><ol><li><span>01</span>Quy mô và hình thức giải đấu</li><li><span>02</span>Cấu hình nội dung thi</li><li><span>03</span>Thiết bị và hạ tầng hiện có</li><li><span>04</span>Đào tạo đội ngũ vận hành</li><li><span>05</span>Phạm vi hỗ trợ trong thời gian tổ chức</li></ol><Link className="button red" href="/contact">Nhận tư vấn <span aria-hidden="true">→</span></Link></div>
      </section>
    </InternalLayout>
  );
}
