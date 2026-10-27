import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalLayout, PageHero } from "@/components/portal-ui";
import { getClub, getClubs } from "@/lib/public-data";

export async function generateStaticParams() { return (await getClubs()).map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const club = await getClub((await params).id);
  return club ? { title: club.name, description: `Thông tin công khai của ${club.name}.` } : { title: "Câu lạc bộ" };
}

export default async function ClubDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = await getClub(id);
  if (!club) notFound();
  return (
    <InternalLayout>
      <PageHero title={club.name} description={club.region} />
      <section className="club-detail"><div><h2>Thông tin câu lạc bộ</h2><dl><div><dt>Khu vực</dt><dd>{club.region}</dd></div>{club.athleteCount !== undefined ? <div><dt>Vận động viên công khai</dt><dd>{new Intl.NumberFormat("vi-VN").format(club.athleteCount)}</dd></div> : null}</dl></div><p>Danh sách vận động viên chỉ hiển thị khi dữ liệu đã được đơn vị xác nhận và cho phép công khai.</p></section>
      <Link className="back-link" href="/clubs"><span aria-hidden="true">←</span> Trở lại danh sách câu lạc bộ</Link>
    </InternalLayout>
  );
}
