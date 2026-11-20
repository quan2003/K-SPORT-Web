import type { Metadata } from "next";
import Link from "next/link";
import { InternalLayout } from "@/components/portal-ui";
import { AthleteRegistrationPortal } from "@/components/athlete-registration-portal";
import { fetchPublishedTournamentBySlug } from "@/lib/registration-supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await fetchPublishedTournamentBySlug(slug);
  return {
    title: tournament
      ? `Đăng ký VĐV · ${tournament.tournamentName} — K-SPORT`
      : "Đăng ký VĐV — K-SPORT",
    description: "Nộp danh sách vận động viên trực tuyến đồng bộ với Ban Tổ Chức K-SPORT.",
  };
}

export default async function DangKySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await fetchPublishedTournamentBySlug(slug);

  if (!tournament) {
    return (
      <InternalLayout>
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Cổng đăng ký K-SPORT</span>
            <h1>Không tìm thấy giải đấu</h1>
            <p>Liên kết đăng ký không tồn tại hoặc giải đấu chưa được Ban Tổ Chức công bố.</p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="panel" style={{ maxWidth: 680, marginInline: "auto", padding: "2rem" }}>
              <p style={{ marginTop: 0, color: "var(--muted)" }}>
                Không tìm thấy cấu hình cho đường dẫn <code>/dang-ky/{decodeURIComponent(slug)}</code>. Vui lòng kiểm tra lại liên kết do Ban Tổ Chức cung cấp.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
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

  return (
    <InternalLayout>
      <AthleteRegistrationPortal tournament={tournament} />
    </InternalLayout>
  );
}
