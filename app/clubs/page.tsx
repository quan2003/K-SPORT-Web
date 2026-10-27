import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getClubs } from "@/lib/public-data";

export const metadata = { title: "Câu lạc bộ" };

export default async function ClubsPage() {
  const clubs = await getClubs();
  return (
    <InternalLayout>
      <PageHero title="Câu lạc bộ" description="Danh bạ các đơn vị tham gia hệ thống giải đấu K-SPORT." />
      <section className="directory-section">
        <div className="filter-bar"><label>Tìm câu lạc bộ<input name="query" type="search" placeholder="Nhập tên đơn vị…" autoComplete="off" /></label><label>Khu vực<select name="region"><option>Tất cả khu vực</option></select></label></div>
        {clubs.length > 0 ? <div className="directory-list club-list">{clubs.map((club) => <Link href={`/clubs/${club.id}`} key={club.id}><div><h2>{club.name}</h2><p>{club.region}</p></div><span>{club.athleteCount ? `${new Intl.NumberFormat("vi-VN").format(club.athleteCount)} vận động viên` : "Xem thông tin"}</span></Link>)}</div> : <EmptyState title="Danh bạ câu lạc bộ đang được cập nhật" description="Thông tin đơn vị sẽ xuất hiện sau khi được đồng bộ và xác nhận." />}
      </section>
    </InternalLayout>
  );
}
