import type { Metadata } from "next";
import { AthleteRegistrationPortal } from "@/components/athlete-registration-portal";
import {
  fetchPublishedTournamentBySlug,
  listPublishedTournaments,
} from "@/lib/registration-supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Đăng ký VĐV theo giải — K-SPORT",
  description: "Nộp danh sách vận động viên trực tuyến đồng bộ với Ban Tổ Chức K-SPORT.",
};

export default async function DangKySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [matched, tournaments] = await Promise.all([
    fetchPublishedTournamentBySlug(slug),
    listPublishedTournaments(),
  ]);

  return (
    <AthleteRegistrationPortal
      tournaments={tournaments}
      initialTournament={matched}
      requestedSlug={slug}
    />
  );
}

