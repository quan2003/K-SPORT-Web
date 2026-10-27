import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { InternalLayout, PageHero } from "@/components/portal-ui";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ K-SPORT về phần mềm quản lý và điều hành giải Karate.",
};

export default function ContactPage() {
  return (
    <InternalLayout>
      <PageHero title="Liên hệ K-SPORT" description="Trao đổi về quy mô giải, nội dung thi và phạm vi cần hỗ trợ." image="/images/karate-venue.png" />
      <section className="contact-page">
        <div className="contact-intro">
          <h2>Bạn sắp tổ chức giải Karate?</h2>
          <p>Hãy cho chúng tôi biết quy mô, nội dung thi và phạm vi vận hành. Đội ngũ K-SPORT sẽ trao đổi trực tiếp qua email.</p>
          <div className="contact-email">
            <a href="mailto:lienhe@k-sport.net">lienhe@k-sport.net</a>
          </div>
          <ul className="contact-points">
            <li>Quy mô và hình thức giải</li>
            <li>Nội dung thi đấu cần quản lý</li>
            <li>Phạm vi triển khai K-SPORT</li>
          </ul>
        </div>
        <ContactForm />
      </section>
    </InternalLayout>
  );
}
