import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AthleteAvatar } from "@/components/athlete-avatar";
import { InternalLayout } from "@/components/portal-ui";
import { getAthlete, getAthletes } from "@/lib/public-data";

export async function generateStaticParams() { return (await getAthletes()).map(({ id }) => ({ id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const athlete = await getAthlete((await params).id);
  return athlete ? { title: athlete.name, description: `Hồ sơ thi đấu công khai của ${athlete.name}.` } : { title: "Vận động viên" };
}

export default async function AthleteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const athlete = await getAthlete(id);
  if (!athlete) notFound();
  return (
    <InternalLayout>
      <section className="athlete-profile">
        <AthleteAvatar name={athlete.name} src={athlete.image} priority className="athlete-avatar-profile" />
        <div><h1>{athlete.name}</h1><p>{athlete.club}</p><dl><div><dt>Hạng mục</dt><dd>{athlete.category}</dd></div>{athlete.publicResult ? <div><dt>Kết quả công khai</dt><dd>{athlete.publicResult}</dd></div> : null}</dl><p className="privacy-note">Hồ sơ công khai không hiển thị địa chỉ, số điện thoại, giấy tờ hoặc dữ liệu sức khỏe.</p></div>
      </section>
    </InternalLayout>
  );
}
