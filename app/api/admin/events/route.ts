import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_TOKEN_COOKIE, adminApiFetch } from "@/lib/admin-api";
import { getEventsStore, addEventItem, EventItem } from "@/lib/admin-store";
import { getAthletes, getEvents, getSchedule, getResults } from "@/lib/public-data";
import { revalidatePath } from "next/cache";

export async function GET() {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  const [publicEvents, athletes, schedule, results] = await Promise.all([
    getEvents().catch(() => []),
    getAthletes().catch(() => []),
    getSchedule().catch(() => []),
    getResults().catch(() => []),
  ]);

  const allMatches = [...schedule, ...results];
  const mappedPublic: EventItem[] = publicEvents.map((ev) => {
    const evAthletes = athletes.filter((a) => a.eventSlug === ev.slug || a.eventId === ev.slug);
    const evMatches = allMatches.filter((m) => m.eventSlug === ev.slug || m.eventName === ev.name);
    const tatamiSet = new Set(evMatches.map((m) => m.tatami?.trim()).filter(Boolean));
    return {
      id: ev.slug,
      name: ev.name,
      location: ev.location || "Chưa cập nhật địa điểm",
      date: ev.endDate && ev.endDate !== ev.date ? `${ev.date} - ${ev.endDate}` : ev.date,
      registrations: evAthletes.length,
      status: ev.status,
      organizer: ev.discipline || "K-SPORT",
      tatamiCount: tatamiSet.size || undefined,
      categoriesCount: ev.categories.length || undefined,
    };
  });

  // Also include cloud-synced tournaments from VPS if available
  const remoteEvents: EventItem[] = [];
  try {
    const remoteRes = await adminApiFetch("/api/cloud-sync/tournaments", {
      signal: AbortSignal.timeout(2_500),
    });
    if (remoteRes.ok) {
      const payload = (await remoteRes.json().catch(() => ({}))) as Record<string, unknown>;
      const list = (
        Array.isArray(payload.tournaments)
          ? payload.tournaments
          : Array.isArray(payload.items)
            ? payload.items
            : Array.isArray(payload.data)
              ? payload.data
              : []
      ) as Record<string, unknown>[];
      for (const row of list) {
        const id = String(row.id || row.slug || row._id || "");
        const name = String(row.name || row.title || row.tournamentName || "");
        if (!name) continue;
        if (!mappedPublic.some((p) => p.id === id || p.name === name)) {
          remoteEvents.push({
            id: id || `remote-${remoteEvents.length}`,
            name,
            location: String(row.location || "Đồng bộ Cloud Sync"),
            date: String(row.date || row.startDate || "Chưa rõ"),
            registrations: Number(row.athleteCount || row.registrations || 0),
            status: "Đang diễn ra",
            organizer: "K-SPORT Cloud Sync",
          });
        }
      }
    }
  } catch {
    // VPS unreachable or local token
  }

  const localCreated = getEventsStore().filter(
    (localItem) => !mappedPublic.some((p) => p.id === localItem.id || p.name === localItem.name),
  );

  return NextResponse.json({ items: [...mappedPublic, ...remoteEvents, ...localCreated] });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Phiên đăng nhập hết hạn" }, { status: 401 });

  try {
    const body = (await request.json()) as Partial<EventItem>;
    if (!body.name || !body.location) {
      return NextResponse.json({ message: "Vui lòng nhập tên giải và địa điểm" }, { status: 400 });
    }

    const newItem = addEventItem({
      name: body.name.trim(),
      location: body.location.trim(),
      date: body.date || "Sắp công bố",
      registrations: Number(body.registrations) || 0,
      status: body.status || "Mở đăng ký",
      organizer: body.organizer || "Ban Tổ Chức Giải Đấu K-SPORT",
      tatamiCount: Number(body.tatamiCount) || 3,
      categoriesCount: Number(body.categoriesCount) || 36,
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");

    return NextResponse.json({ item: newItem, message: "Tạo giải đấu thành công" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi xử lý" }, { status: 500 });
  }
}
