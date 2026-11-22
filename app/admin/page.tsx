import type { Metadata } from "next";
import { AdminDashboard, type AdminOverviewData } from "@/components/admin-dashboard";
import { adminApiFetch } from "@/lib/admin-api";
import { getSponsorsStore } from "@/lib/admin-store";
import {
  getAthletes,
  getBanners,
  getClubs,
  getEvents,
  getNews,
  getResults,
  getSchedule,
  sortEvents,
} from "@/lib/public-data";
import { getQuestionBank } from "@/lib/wkf-exam/question-bank";
import { getSiteAnalyticsSnapshot } from "@/lib/analytics-store";

export const metadata: Metadata = { title: "Quản trị K-SPORT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchRemoteStats(): Promise<AdminOverviewData["remote"]> {
  try {
    const [statsRes, tournamentsRes] = await Promise.all([
      adminApiFetch("/api/stats/dashboard", { signal: AbortSignal.timeout(3_500) }),
      adminApiFetch("/api/cloud-sync/tournaments", { signal: AbortSignal.timeout(3_500) }),
    ]);

    if (!statsRes.ok) {
      return { connected: false };
    }

    const statsPayload = (await statsRes.json().catch(() => ({}))) as Record<string, unknown>;
    const statsObj = (
      statsPayload.stats && typeof statsPayload.stats === "object" ? statsPayload.stats : statsPayload
    ) as Record<string, unknown>;
    const payments = (
      statsObj.payments && typeof statsObj.payments === "object" ? statsObj.payments : {}
    ) as Record<string, unknown>;

    let syncedTournamentsCount: number | null = null;
    if (tournamentsRes.ok) {
      const tPayload = (await tournamentsRes.json().catch(() => ({}))) as Record<string, unknown>;
      for (const key of ["tournaments", "data", "items", "rows"]) {
        if (Array.isArray(tPayload[key])) {
          syncedTournamentsCount = (tPayload[key] as unknown[]).length;
          break;
        }
      }
    }

    return {
      connected: true,
      totalLicenses: typeof statsObj.totalLicenses === "number" ? statsObj.totalLicenses : null,
      activeLicenses: typeof statsObj.activeLicenses === "number" ? statsObj.activeLicenses : null,
      requestsPending: typeof statsObj.requestsPending === "number" ? statsObj.requestsPending : null,
      paidOrders: typeof payments.paid_orders === "number" ? payments.paid_orders : null,
      syncedTournamentsCount,
    };
  } catch {
    return { connected: false };
  }
}

export default async function AdminPage() {
  const [eventsRaw, schedule, results, athletes, clubs, news, banners, remote] = await Promise.all([
    getEvents(),
    getSchedule(),
    getResults(),
    getAthletes(),
    getClubs(),
    getNews(),
    getBanners(),
    fetchRemoteStats(),
  ]);

  const events = sortEvents(eventsRaw);
  const wkfQuestionsCount = getQuestionBank().questions.length;
  const activeSponsorsCount = getSponsorsStore().filter((s) => s.isActive).length;
  const analytics = await getSiteAnalyticsSnapshot();

  const data: AdminOverviewData = {
    events,
    schedule,
    results,
    athletesCount: athletes.length,
    clubsCount: clubs.length,
    newsCount: news.length,
    bannersCount: banners.length,
    activeSponsorsCount,
    wkfQuestionsCount,
    analytics,
    remote,
    fetchedAt: new Date().toISOString(),
  };

  return <AdminDashboard data={data} />;
}
