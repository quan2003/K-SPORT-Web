import type { Metadata } from "next";
import { getPublicSession } from "@/lib/auth";
import { AdminBtcDashboard } from "@/components/admin-btc-dashboard";
import {
  getAthletes,
  getClubs,
  getEvents,
  getRanking,
  getResults,
  getSchedule,
  sortEvents,
} from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Bảng Điều Hành Ban Tổ Chức (BTC) · K-SPORT",
  description: "Trung tâm thống kê và vận hành giải đấu dành cho Ban Tổ Chức",
};

export default async function AdminBtcPage() {
  const [session, eventsRaw, schedule, results, athletes, clubs, ranking] = await Promise.all([
    getPublicSession(),
    getEvents(),
    getSchedule(),
    getResults(),
    getAthletes(),
    getClubs(),
    getRanking(),
  ]);

  let events = sortEvents(eventsRaw);
  if (session?.role === "btc" && session.tournamentId) {
    const assignedKey = session.tournamentId.trim().toLowerCase();
    const matched = events.filter(
      (ev) => ev.slug.toLowerCase() === assignedKey || ev.name.toLowerCase() === assignedKey,
    );
    if (matched.length > 0) events = matched;
  }

  return (
    <AdminBtcDashboard
      session={session}
      events={events}
      schedule={schedule}
      results={results}
      athletes={athletes}
      clubs={clubs}
      ranking={ranking}
    />
  );
}
