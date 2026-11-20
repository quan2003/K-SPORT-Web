import type { Metadata } from "next";
import { AthleteRegistrationPortal } from "@/components/athlete-registration-portal";
import { listPublishedTournaments } from "@/lib/registration-supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Đăng ký VĐV trực tuyến — K-SPORT",
  description: "Cổng đăng ký vận động viên thi đấu Karate đồng bộ trực tiếp với phần mềm K-SPORT.",
};

export default async function DangKyPage() {
  const tournaments = await listPublishedTournaments();
  return (
    <AthleteRegistrationPortal
      tournaments={tournaments}
      initialTournament={tournaments[0] || null}
    />
  );
}

