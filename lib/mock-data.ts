import type { Athlete, RankingEntry } from "@/lib/public-data";

// Dữ liệu minh họa chỉ phục vụ giao diện trong giai đoạn chưa kết nối API công khai.
const athleteSeeds = [
  ["Minh An", "CLB Karate Minh Họa A", "Kumite nam -60kg"],
  ["Quang Huy", "CLB Karate Minh Họa B", "Kumite nam -60kg"],
  ["Thảo Vy", "CLB Karate Minh Họa C", "Kata nữ cá nhân"],
  ["Gia Bảo", "CLB Karate Minh Họa A", "Kata nam cá nhân"],
  ["Khánh Linh", "CLB Karate Minh Họa D", "Kumite nữ -50kg"],
  ["Đức Thành", "CLB Karate Minh Họa E", "Kumite nam -67kg"],
  ["Ngọc Hân", "CLB Karate Minh Họa B", "Kumite nữ -55kg"],
  ["Hải Đăng", "CLB Karate Minh Họa F", "Kata nam cá nhân"],
  ["Phương Nhi", "CLB Karate Minh Họa D", "Kata nữ cá nhân"],
  ["Tuấn Kiệt", "CLB Karate Minh Họa C", "Kumite nam -75kg"],
  ["Mai Chi", "CLB Karate Minh Họa E", "Kumite nữ -61kg"],
  ["Hoàng Nam", "CLB Karate Minh Họa F", "Kumite nam -84kg"],
  ["Bảo Trâm", "CLB Karate Minh Họa A", "Kata nữ cá nhân"],
  ["Đình Khang", "CLB Karate Minh Họa B", "Kumite nam -67kg"],
  ["Yến Nhi", "CLB Karate Minh Họa C", "Kumite nữ -50kg"],
  ["Nhật Minh", "CLB Karate Minh Họa D", "Kata nam cá nhân"],
  ["Hà My", "CLB Karate Minh Họa E", "Kumite nữ -55kg"],
  ["Trọng Nghĩa", "CLB Karate Minh Họa F", "Kumite nam -75kg"],
  ["Kim Ngân", "CLB Karate Minh Họa A", "Kumite nữ -61kg"],
  ["Anh Dũng", "CLB Karate Minh Họa B", "Kumite nam -84kg"],
] as const;

export const mockAthletes: Athlete[] = athleteSeeds.map(([name, club, category], index) => {
  const totalMatches = 8 + (index % 8);
  const wins = 5 + (index % 7);
  return {
    id: `athlete-demo-${String(index + 1).padStart(3, "0")}`,
    athleteCode: `DEMO-${String(index + 1).padStart(3, "0")}`,
    name,
    club,
    category,
    country: "VN",
    totalMatches,
    wins,
    winRate: Math.round((wins / totalMatches) * 100),
    publicResult: "Hồ sơ dữ liệu minh họa",
  };
});

const rankingSeasons = [
  { season: "2026", eventDate: "2026-08-16", athleteIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { season: "2025", eventDate: "2025-08-17", athleteIndexes: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
  { season: "2024", eventDate: "2024-08-18", athleteIndexes: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18] },
  { season: "2023", eventDate: "2023-08-19", athleteIndexes: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19] },
] as const;

const mockRankChanges = [2, -1, 0, 3, -2, 1, 0, -4, 2, -1];

export const mockRanking: RankingEntry[] = rankingSeasons.flatMap(({ season, eventDate, athleteIndexes }) =>
  athleteIndexes.map((athleteIndex, index) => {
    const athlete = mockAthletes[athleteIndex];
    const rank = index + 1;
    return {
      rank,
      athleteId: athlete.id,
      name: athlete.name,
      club: athlete.club,
      category: athlete.category,
      points: rank === 1 ? 3 : rank === 2 ? 2 : rank === 3 ? 1 : 0,
      rankChange: mockRankChanges[(index + 2026 - Number(season)) % mockRankChanges.length],
      season,
      eventSlug: `giai-demo-${season}`,
      eventName: `Giải Karate Dữ liệu minh họa ${season}`,
      eventDate,
      medals: rank === 1 ? { gold: 1 } : rank === 2 ? { silver: 1 } : rank === 3 ? { bronze: 1 } : undefined,
    };
  }),
);

export function isMockAthlete(id: string) {
  return mockAthletes.some((athlete) => athlete.id === id);
}

// Dữ liệu minh họa cho màn hình quản trị; thay bằng số liệu đã được phê duyệt
// từ hệ thống điều hành và công cụ analytics trước khi đưa vào vận hành.
export const adminAnalyticsDemo = {
  months: [
    { label: "Thg 5", visits: 842, users: 118, events: 1 },
    { label: "Thg 6", visits: 1064, users: 143, events: 2 },
    { label: "Thg 7", visits: 1288, users: 166, events: 1 },
    { label: "Thg 8", visits: 1176, users: 159, events: 3 },
    { label: "Thg 9", visits: 1431, users: 188, events: 2 },
    { label: "Thg 10", visits: 1654, users: 211, events: 2 },
  ],
  years: [
    { label: "2023", visits: 6240, users: 514, events: 8 },
    { label: "2024", visits: 8836, users: 692, events: 11 },
    { label: "2025", visits: 10728, users: 826, events: 14 },
    { label: "2026", visits: 7455, users: 611, events: 11 },
  ],
  recentActivity: [
    { label: "Bài viết Test được lưu", time: "Hôm nay · 10:28", type: "Nội dung" },
    { label: "2 giải đấu đang chờ công bố", time: "Hôm qua", type: "Giải đấu" },
    { label: "Danh sách tài khoản cần rà soát", time: "Tuần này", type: "Người dùng" },
  ],
} as const;

export const adminEventsDemo = [
  { id: "event-demo-01", name: "Giải vô địch Karate dữ liệu minh họa 2026", location: "Hà Nội", date: "15–17/11/2026", registrations: 86, status: "Mở đăng ký" },
  { id: "event-demo-02", name: "Cúp các câu lạc bộ dữ liệu minh họa", location: "Đà Nẵng", date: "06–07/12/2026", registrations: 42, status: "Bản nháp" },
  { id: "event-demo-03", name: "Giải trẻ dữ liệu minh họa", location: "TP. Hồ Chí Minh", date: "18–19/10/2026", registrations: 124, status: "Đã kết thúc" },
] as const;

export const adminUsersDemo = [
  { id: "user-demo-01", name: "Ban tổ chức minh họa", role: "Quản trị viên", lastActive: "Hôm nay · 09:42", status: "Hoạt động" },
  { id: "user-demo-02", name: "Biên tập viên minh họa", role: "Biên tập viên", lastActive: "Hôm qua · 16:10", status: "Hoạt động" },
  { id: "user-demo-03", name: "Điều phối giải minh họa", role: "Điều phối viên", lastActive: "12/10/2026", status: "Chờ rà soát" },
] as const;
