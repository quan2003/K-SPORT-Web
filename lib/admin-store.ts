import { mockBanners, mockNews } from "@/lib/mock-data";
import { SPONSOR_LOGOS } from "@/lib/sponsor-logos";

export type SponsorTier = "diamond" | "gold" | "silver" | "equipment" | "beverage" | "media";

export type SponsorPlacement = "home" | "footer" | "event" | "tatami";

export type SponsorItem = {
  id: string;
  name: string;
  category: string;
  tier: SponsorTier;
  logo: string;
  website: string;
  description: string;
  placements: SponsorPlacement[];
  isActive: boolean;
  order: number;
  contactPerson?: string;
  contractDate?: string;
};

export type EventItem = {
  id: string;
  name: string;
  location: string;
  date: string;
  registrations: number;
  status: "Đang diễn ra" | "Sắp diễn ra" | "Mở đăng ký" | "Đã kết thúc";
  organizer?: string;
  tatamiCount?: number;
  categoriesCount?: number;
};

export type AdminUserItem = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "btc" | "editor";
  assignedTournament?: string;
  lastActive: string;
  status: "Hoạt động" | "Tạm khóa";
};

// Initial realistic Karate sponsors
const defaultSponsors: SponsorItem[] = [
  {
    id: "sp-arawaza",
    name: "Arawaza Karate Vietnam",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    logo: SPONSOR_LOGOS.arawaza,
    website: "https://arawaza.com",
    description: "Nhà cung cấp võ phục Kata, Kumite và bảo hộ thi đấu đạt chứng nhận Liên đoàn Karate Thế giới (WKF).",
    placements: ["home", "footer", "event", "tatami"],
    isActive: true,
    order: 1,
    contactPerson: "Đại diện Arawaza VN",
    contractDate: "2026-01-15",
  },
  {
    id: "sp-tokaido",
    name: "Tokaido Japan Karatedo",
    category: "Võ phục & Đai truyền thống Nhật Bản",
    tier: "equipment",
    logo: SPONSOR_LOGOS.tokaido,
    website: "https://tokaidojapan.com",
    description: "Thương hiệu võ phục Karate cao cấp truyền thống từ Nhật Bản, đồng hành cùng các đội tuyển quyền thuật.",
    placements: ["home", "footer", "event"],
    isActive: true,
    order: 2,
    contactPerson: "Phân phối Tokaido Asia",
    contractDate: "2026-02-01",
  },
  {
    id: "sp-tanviet",
    name: "Tân Việt Karatedo",
    category: "Nhà tài trợ Võ phục & Dụng cụ luyện tập",
    tier: "gold",
    logo: SPONSOR_LOGOS.tanviet,
    website: "https://tanvietkarate.com",
    description: "Đơn vị đồng hành sản xuất võ phục, thảm đấu và găng bảo hộ cho các giải đấu trẻ quốc gia.",
    placements: ["home", "footer", "event", "tatami"],
    isActive: true,
    order: 3,
    contactPerson: "Ban Đối ngoại Tân Việt",
    contractDate: "2026-03-10",
  },
  {
    id: "sp-dongluc",
    name: "Động Lực Group",
    category: "Nhà tài trợ Vàng Thiết bị & Trang phục Thể thao",
    tier: "gold",
    logo: SPONSOR_LOGOS.dongluc,
    website: "https://dongluc.vn",
    description: "Tập đoàn thể thao hàng đầu Việt Nam, tài trợ thảm đấu EVA Tatami và trang phục trọng tài.",
    placements: ["home", "footer", "event"],
    isActive: true,
    order: 4,
    contactPerson: "Khối Tài trợ Thể thao Động Lực",
    contractDate: "2026-04-05",
  },
  {
    id: "sp-lavie",
    name: "Nước khoáng Thiên nhiên LaVie",
    category: "Bảo trợ Nước uống & Khoáng chất Vận động viên",
    tier: "beverage",
    logo: SPONSOR_LOGOS.lavie,
    website: "https://www.laviewater.com",
    description: "Cung cấp nguồn nước khoáng thiên nhiên tinh khiết phục vụ toàn bộ vận động viên và tổ trọng tài tại giải.",
    placements: ["home", "event", "tatami"],
    isActive: true,
    order: 5,
    contactPerson: "Nhãn hàng LaVie Sports",
    contractDate: "2026-05-12",
  },
  {
    id: "sp-shureido",
    name: "Shureido Okinawa",
    category: "Võ phục Kata Đỉnh cao",
    tier: "diamond",
    logo: SPONSOR_LOGOS.shureido,
    website: "https://shureido.com",
    description: "Thương hiệu võ phục chuẩn thi đấu số 1 thế giới tại Okinawa, Nhật Bản.",
    placements: ["home", "footer", "event"],
    isActive: true,
    order: 6,
    contactPerson: "Đại lý Ủy quyền",
    contractDate: "2026-06-01",
  },
  {
    id: "sp-adidas",
    name: "Adidas Combat Sports",
    category: "Võ phục & Thiết bị thi đấu chính thức WKF",
    tier: "equipment",
    logo: SPONSOR_LOGOS.adidas,
    website: "https://adidascombatsports.com",
    description: "Trang bị thi đấu Kumite và Kata chuẩn Liên đoàn Karate Thế giới WKF chính hãng Adidas.",
    placements: ["home", "footer", "event", "tatami"],
    isActive: true,
    order: 7,
    contactPerson: "Đại diện Phân phối Adidas Combat",
    contractDate: "2026-07-01",
  },
];

// Initial realistic users (Only 3 roles: admin, btc, editor/truyenthong)
const defaultUsers: AdminUserItem[] = [
  {
    id: "user-admin-01",
    username: "admin-k-sport",
    name: "Quản trị viên Hệ thống",
    email: "admin@k-sport.net",
    role: "admin",
    lastActive: "Đang hoạt động",
    status: "Hoạt động",
  },
  {
    id: "user-btc-phutho",
    username: "btc-phutho",
    name: "Ban Tổ Chức Phú Thọ 2026",
    email: "btc.phutho2026@k-sport.net",
    role: "btc",
    assignedTournament: "Giải vô địch các CLB Karate tỉnh Phú Thọ năm 2026",
    lastActive: "Vừa xong",
    status: "Hoạt động",
  },
  {
    id: "user-editor-01",
    username: "truyenthong",
    name: "Ban Thư ký & Truyền thông",
    email: "media@k-sport.net",
    role: "editor",
    lastActive: "35 phút trước",
    status: "Hoạt động",
  },
];

// Initial realistic events
const defaultEvents: EventItem[] = [
  {
    id: "giai-vo-dich-clb-karate-phu-tho-2026",
    name: "Giải vô địch các Câu lạc bộ Karate tỉnh Phú Thọ năm 2026",
    location: "Nhà thi đấu TDTT tỉnh Phú Thọ",
    date: "08/11/2026 - 10/11/2026",
    registrations: 342,
    status: "Đang diễn ra",
    organizer: "Sở VHTT&DL Phú Thọ & Hội Karate Phú Thọ",
    tatamiCount: 3,
    categoriesCount: 42,
  },
  {
    id: "cup-clb-manh-da-nang-2026",
    name: "Cúp các Câu lạc bộ Karate mạnh toàn quốc 2026",
    location: "Cung Thể thao Tiên Sơn, Đà Nẵng",
    date: "15/12/2026 - 19/12/2026",
    registrations: 286,
    status: "Mở đăng ký",
    organizer: "Liên đoàn Karate Việt Nam",
    tatamiCount: 4,
    categoriesCount: 54,
  },
  {
    id: "giai-vo-dich-tre-quoc-gia-2026",
    name: "Giải vô địch Karate Trẻ Quốc gia 2026",
    location: "Nhà thi đấu Phú Thọ, TP. Hồ Chí Minh",
    date: "20/07/2026 - 26/07/2026",
    registrations: 410,
    status: "Đã kết thúc",
    organizer: "Tổng cục TDTT & Liên đoàn Karate Việt Nam",
    tatamiCount: 4,
    categoriesCount: 60,
  },
];

// In-memory singleton state
declare global {
  var __ksport_sponsors: SponsorItem[] | undefined;
  var __ksport_events: EventItem[] | undefined;
  var __ksport_users: AdminUserItem[] | undefined;
  var __ksport_banners: typeof mockBanners | undefined;
  var __ksport_news: typeof mockNews | undefined;
}

export function getSponsorsStore(): SponsorItem[] {
  if (!global.__ksport_sponsors) {
    global.__ksport_sponsors = [...defaultSponsors];
  }
  return global.__ksport_sponsors;
}

export function saveSponsorsStore(items: SponsorItem[]) {
  global.__ksport_sponsors = items;
}

export function addSponsorItem(item: Omit<SponsorItem, "id">): SponsorItem {
  const store = getSponsorsStore();
  const newItem: SponsorItem = {
    ...item,
    id: `sp-${Date.now().toString(36)}`,
  };
  store.unshift(newItem);
  return newItem;
}

export function updateSponsorItem(id: string, updates: Partial<SponsorItem>): SponsorItem | null {
  const store = getSponsorsStore();
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) return null;
  store[index] = { ...store[index], ...updates };
  return store[index];
}

export function deleteSponsorItem(id: string): boolean {
  const store = getSponsorsStore();
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

// Events store
export function getEventsStore(): EventItem[] {
  if (!global.__ksport_events) {
    global.__ksport_events = [...defaultEvents];
  }
  return global.__ksport_events;
}

export function addEventItem(item: Omit<EventItem, "id">): EventItem {
  const store = getEventsStore();
  const newItem: EventItem = {
    ...item,
    id: `event-${Date.now().toString(36)}`,
  };
  store.unshift(newItem);
  return newItem;
}

export function updateEventItem(id: string, updates: Partial<EventItem>): EventItem | null {
  const store = getEventsStore();
  const index = store.findIndex((e) => e.id === id);
  if (index === -1) return null;
  store[index] = { ...store[index], ...updates };
  return store[index];
}

// Users store
export function getUsersStore(): AdminUserItem[] {
  if (!global.__ksport_users) {
    global.__ksport_users = [...defaultUsers];
  }
  // Strictly filter out any legacy referee accounts from in-memory cache
  global.__ksport_users = global.__ksport_users.filter(
    (u) =>
      u.username !== "trongtai-tham1" &&
      u.id !== "user-referee-01" &&
      !u.name.toLowerCase().includes("trọng tài") &&
      (u.role as string) !== "referee"
  );
  return global.__ksport_users;
}

export function addUserItem(item: Omit<AdminUserItem, "id" | "lastActive">): AdminUserItem {
  const store = getUsersStore();
  const newItem: AdminUserItem = {
    ...item,
    id: `user-${Date.now().toString(36)}`,
    lastActive: "Vừa tạo",
  };
  store.push(newItem);
  return newItem;
}

export function updateUserItem(id: string, updates: Partial<AdminUserItem>): AdminUserItem | null {
  const store = getUsersStore();
  const index = store.findIndex((u) => u.id === id);
  if (index === -1) return null;
  store[index] = { ...store[index], ...updates };
  return store[index];
}

export function deleteUserItem(id: string): boolean {
  const store = getUsersStore();
  const index = store.findIndex((u) => u.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}

// Banners & News stores
export function getBannersStore() {
  if (!global.__ksport_banners) {
    global.__ksport_banners = [...mockBanners];
  }
  return global.__ksport_banners;
}

export function getNewsStore() {
  if (!global.__ksport_news) {
    global.__ksport_news = [...mockNews];
  }
  return global.__ksport_news;
}

