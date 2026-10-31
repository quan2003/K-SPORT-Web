import Link from "next/link";
import type { Metadata } from "next";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { featureNotes } from "@/lib/public-data";

export const metadata: Metadata = { title: "Phần mềm K-SPORT", description: "Giải pháp quản lý và điều hành giải Karate K-SPORT." };

export default function SoftwarePage() {
  return (
    <InternalLayout>
      <PageHero title="Phần mềm K-SPORT" description="Một hệ thống cho đăng ký, bốc thăm, điều hành và công bố kết quả Karate." image="/images/karate-hero.png" />
      <section className="software-detail">
        <div><h2>Điều hành từ một hệ thống</h2><p>K-SPORT kết nối các bước chuẩn bị nội dung thi, sắp lịch, vận hành thảm và công bố kết quả trong một quy trình nhất quán.</p><Link className="button red" href="/contact">Trao đổi nhu cầu <span aria-hidden="true">→</span></Link></div>
        <div className="control-ui" data-ui><header><b>K-SPORT</b><span>Điều hành trận đấu</span><i>Chờ dữ liệu trận</i></header><div className="control-score"><section><small>Aka</small><strong>Chưa chọn vận động viên</strong><b>–</b></section><time>00:00</time><section><small>Ao</small><strong>Chưa chọn vận động viên</strong><b>–</b></section></div><footer><span>Đăng ký</span><span>Bốc thăm</span><span>Điều hành</span><span>Kết quả</span></footer></div>
      </section>
      <section className="capability-list">{featureNotes.map(([title, body]) => <article key={title}><h2>{title}</h2><p>{body}</p></article>)}</section>
      <section className="software-cta"><div><h2>Chuẩn bị kết nối với quy trình của bạn.</h2><p>Trao đổi kiến trúc dữ liệu, phạm vi giải và cách K-SPORT phối hợp cùng phần mềm desktop hiện có.</p></div><Link className="button light" href="/contact">Liên hệ K-SPORT <span aria-hidden="true">→</span></Link></section>
    </InternalLayout>
  );
}
