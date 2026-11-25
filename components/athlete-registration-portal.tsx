"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import type {
  PublishedEventCategory,
  PublishedTournamentConfig,
  RegistrationAthletePayload,
} from "@/lib/registration-supabase";

type DraftAthlete = {
  localId: string;
  athleteId: string;
  name: string;
  gender: "male" | "female";
  birthDateStr: string;
  birthDateIso: string;
  eventId: string;
  eventName: string;
  eventType?: string;
  weight: string;
  isTeam: boolean;
  teamCode: string;
  school?: string;
  athleteClass?: string;
  photoStatus?: string;
};

type CategoryTab = "all" | "kata" | "kumite" | "team";

const CLUB_IDS_STORAGE_KEY = "ksport_club_ids_v1";
const DRAFT_STORAGE_PREFIX = "ksport_reg_draft_v1_";
const TOUR_SEEN_KEY = "ksport_reg_tour_seen_v1";

type TourTarget = "club" | "athlete" | "multi" | "roster";

const TOUR_STEPS: { target: TourTarget; title: string; description: string }[] = [
  {
    target: "club",
    title: "Bước 1: Nhập thông tin Đoàn / CLB",
    description:
      "Điền tên Câu lạc bộ / Đơn vị, Trưởng đoàn và Huấn luyện viên. Hệ thống tự động lưu nháp trên trình duyệt để bạn không bị mất dữ liệu.",
  },
  {
    target: "athlete",
    title: "Bước 2: Nhập Vận động viên & Nội dung",
    description:
      "Nhập họ tên, chọn Nam/Nữ, ngày sinh, lọc nhanh theo Kata / Kumite / Đồng đội và bấm chọn nội dung thi đấu. Có thể đính kèm ảnh thẻ (JPG/PNG/WebP).",
  },
  {
    target: "multi",
    title: "Bước 3: Đăng ký nhiều nội dung cho 1 VĐV",
    description:
      "Mỗi lượt đấu là 1 dòng riêng. Tích chọn 'Giữ họ tên & ngày sinh' hoặc bấm nút '+ Nội dung' ở danh sách bên phải để đăng ký thêm nội dung thứ 2. Với nội dung đồng đội, hãy nhập cùng Mã đội.",
  },
  {
    target: "roster",
    title: "Bước 4: Kiểm tra & Nộp danh sách cho BTC",
    description:
      "Kiểm tra lại danh sách bên phải, có thể tải Excel (CSV) hoặc JSON dự phòng, sau đó bấm 'Nộp danh sách cho BTC' để đồng bộ trực tiếp về phần mềm K-SPORT.",
  },
];

function normalizeClubKey(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getOrCreateClubId(clubName: string): string {
  const key = normalizeClubKey(clubName);
  if (!key) return crypto.randomUUID();
  let map: Record<string, string> = {};
  try {
    map = JSON.parse(localStorage.getItem(CLUB_IDS_STORAGE_KEY) || "{}") || {};
  } catch {
    map = {};
  }
  if (!map[key]) {
    map[key] = crypto.randomUUID();
    localStorage.setItem(CLUB_IDS_STORAGE_KEY, JSON.stringify(map));
  }
  return map[key];
}

function parseVietnameseDate(input: string): string | null {
  const clean = input.trim();
  if (!clean) return null;
  if (/^\d{4}$/.test(clean)) return `${clean}-01-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const parts = clean.split(/[-/.]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    let y = parseInt(parts[2], 10);
    if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y)) return null;
    if (y < 100) y += 2000;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return null;
}

function getRegistrationWindowStatus(tournament: PublishedTournamentConfig) {
  const now = new Date();
  if (tournament.startTime) {
    const start = new Date(tournament.startTime);
    if (!Number.isNaN(start.getTime()) && now < start) {
      return {
        open: false,
        kind: "future" as const,
        reason: `Chưa đến thời gian mở đăng ký. Hệ thống mở lúc ${start.toLocaleString("vi-VN")}.`,
      };
    }
  }
  if (tournament.endTime) {
    const end = new Date(tournament.endTime);
    if (!Number.isNaN(end.getTime()) && now > end) {
      return {
        open: false,
        kind: "expired" as const,
        reason: `Đã hết hạn đăng ký trực tuyến từ ${end.toLocaleString("vi-VN")}.`,
      };
    }
  }
  return { open: true, kind: "open" as const, reason: "" };
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VĐ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "44px",
  padding: "0.55rem 0.85rem",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: "16px",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "1.35rem",
};

export function AthleteRegistrationPortal({
  tournament,
}: {
  tournament: PublishedTournamentConfig;
}) {
  const isSchoolTournament = Boolean(
    tournament.isSchoolTournament ??
      /h[oọ]c\s*sinh|ph[oổ]\s*th[oô]ng/i.test(tournament.tournamentName || ""),
  );
  const [clubName, setClubName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [coach1, setCoach1] = useState("");
  const [coach2, setCoach2] = useState("");
  const [coach3, setCoach3] = useState("");
  const [athletes, setAthletes] = useState<DraftAthlete[]>([]);

  // Form state
  const [editingLocalId, setEditingLocalId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDateStr, setBirthDateStr] = useState("");
  const [school, setSchool] = useState("");
  const [athleteClass, setAthleteClass] = useState("");
  const [eventId, setEventId] = useState("");
  const [categoryTab, setCategoryTab] = useState<CategoryTab>("all");
  const [eventSearch, setEventSearch] = useState("");
  const [weight, setWeight] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [keepAthleteInfo, setKeepAthleteInfo] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [rosterSearch, setRosterSearch] = useState("");

  const pendingPhotosRef = useRef<Map<string, File>>(new Map());
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string>("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);

  const clubSectionRef = useRef<HTMLElement>(null);
  const athleteSectionRef = useRef<HTMLElement>(null);
  const multiNoticeRef = useRef<HTMLDivElement>(null);
  const rosterSectionRef = useRef<HTMLElement>(null);

  const storageKey = `${DRAFT_STORAGE_PREFIX}${tournament.tournamentId}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (!localStorage.getItem(TOUR_SEEN_KEY)) {
          setTourStep(0);
        }
      } catch {
        // ignore
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (tourStep === null) return;
    const target = TOUR_STEPS[tourStep]?.target;
    const refMap: Record<TourTarget, React.RefObject<HTMLElement | HTMLDivElement | null>> = {
      club: clubSectionRef,
      athlete: athleteSectionRef,
      multi: multiNoticeRef,
      roster: rosterSectionRef,
    };
    const el = refMap[target]?.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [tourStep]);

  function closeTour() {
    setTourStep(null);
    try {
      localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as {
          clubName?: string;
          teamLeader?: string;
          coach1?: string;
          coach2?: string;
          coach3?: string;
          athletes?: DraftAthlete[];
        };
        if (parsed.clubName) {
          setClubName(parsed.clubName);
        }
        if (parsed.teamLeader) setTeamLeader(parsed.teamLeader);
        if (parsed.coach1) setCoach1(parsed.coach1);
        if (parsed.coach2) setCoach2(parsed.coach2);
        if (parsed.coach3) setCoach3(parsed.coach3);
        if (Array.isArray(parsed.athletes)) setAthletes(parsed.athletes);
      } catch {
        // ignore
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ clubName, teamLeader, coach1, coach2, coach3, athletes }),
      );
    } catch {
      // ignore
    }
  }, [storageKey, clubName, teamLeader, coach1, coach2, coach3, athletes]);

  const regStatus = useMemo(() => getRegistrationWindowStatus(tournament), [tournament]);

  const availableCategories = useMemo(() => {
    const list = tournament.events || [];
    const q = eventSearch.trim().toLowerCase();
    return list.filter((cat) => {
      const genderMatch = !cat.gender || cat.gender === "any" || cat.gender === gender;
      const tabMatch =
        categoryTab === "all" ||
        (categoryTab === "team" && Boolean(cat.isTeamEvent)) ||
        (categoryTab === "kata" && String(cat.type || "").toLowerCase() === "kata") ||
        (categoryTab === "kumite" && String(cat.type || "").toLowerCase() === "kumite");
      const queryMatch = !q || cat.name.toLowerCase().includes(q);
      return genderMatch && tabMatch && queryMatch;
    });
  }, [tournament, eventSearch, gender, categoryTab]);

  const selectedCategory: PublishedEventCategory | undefined = useMemo(
    () => (tournament.events || []).find((c) => c.id === eventId),
    [tournament, eventId],
  );

  const filteredRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    if (!q) return athletes;
    return athletes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.eventName.toLowerCase().includes(q) ||
        (a.teamCode && a.teamCode.toLowerCase().includes(q)) ||
        (a.school && a.school.toLowerCase().includes(q)) ||
        (a.athleteClass && a.athleteClass.toLowerCase().includes(q)),
    );
  }, [athletes, rosterSearch]);

  const stats = useMemo(() => {
    const maleCount = athletes.filter((a) => a.gender === "male").length;
    const femaleCount = athletes.filter((a) => a.gender === "female").length;
    const uniqueEvents = new Set(athletes.map((a) => a.eventId)).size;
    const photosCount = athletes.filter((a) => a.photoStatus === "pending_upload" || Boolean(photoPreviews[a.athleteId])).length;
    return { maleCount, femaleCount, uniqueEvents, photosCount };
  }, [athletes, photoPreviews]);

  function showMessage(type: "success" | "error", text: string) {
    setNotice({ type, text });
  }

  function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview("");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("error", "Ảnh thẻ chỉ hỗ trợ định dạng JPG, PNG hoặc WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Dung lượng ảnh thẻ không được vượt quá 5 MB.");
      e.target.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function clearPhotoSelection() {
    setPhotoFile(null);
    setPhotoPreview("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function resetAthleteForm(preserveIdentity = false) {
    setEditingLocalId(null);
    if (!preserveIdentity) {
      setName("");
      setBirthDateStr("");
      setSchool("");
      setAthleteClass("");
      setWeight("");
      clearPhotoSelection();
    }
    setEventId("");
    setTeamCode("");
  }

  function handleSaveAthlete(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showMessage("error", "Vui lòng nhập họ và tên VĐV.");
      return;
    }
    const birthDateIso = parseVietnameseDate(birthDateStr);
    if (!birthDateIso) {
      showMessage("error", "Ngày sinh không hợp lệ (ví dụ: 15/05/2008 hoặc 2008).");
      return;
    }
    if (!selectedCategory) {
      showMessage("error", "Vui lòng chọn nội dung thi đấu ở danh sách.");
      return;
    }

    const athleteId = editingLocalId
      ? athletes.find((a) => a.localId === editingLocalId)?.athleteId || crypto.randomUUID()
      : crypto.randomUUID();
    const localId = editingLocalId || crypto.randomUUID();

    if (photoFile) {
      pendingPhotosRef.current.set(athleteId, photoFile);
      if (photoPreview) {
        setPhotoPreviews((prev) => ({ ...prev, [athleteId]: photoPreview }));
      }
    }

    const record: DraftAthlete = {
      localId,
      athleteId,
      name: trimmedName,
      gender,
      birthDateStr: birthDateStr.trim(),
      birthDateIso,
      eventId: selectedCategory.id,
      eventName: selectedCategory.name,
      eventType: selectedCategory.type,
      weight: weight.trim(),
      isTeam: Boolean(selectedCategory.isTeamEvent),
      teamCode: teamCode.trim(),
      school: school.trim() || undefined,
      athleteClass: athleteClass.trim() || undefined,
      photoStatus: photoFile ? "pending_upload" : undefined,
    };

    if (editingLocalId) {
      setAthletes((prev) => prev.map((a) => (a.localId === editingLocalId ? record : a)));
      showMessage("success", `Đã cập nhật VĐV "${trimmedName}".`);
      resetAthleteForm(false);
    } else {
      setAthletes((prev) => [record, ...prev]);
      showMessage(
        "success",
        keepAthleteInfo
          ? `Đã thêm "${trimmedName}" vào nội dung "${selectedCategory.name}". Bạn có thể chọn ngay nội dung tiếp theo cho VĐV này.`
          : `Đã thêm VĐV "${trimmedName}" vào danh sách.`,
      );
      resetAthleteForm(keepAthleteInfo);
    }
  }

  function handleEditAthlete(item: DraftAthlete) {
    setEditingLocalId(item.localId);
    setName(item.name);
    setGender(item.gender);
    setBirthDateStr(item.birthDateStr);
    setSchool(item.school || "");
    setAthleteClass(item.athleteClass || "");
    setEventId(item.eventId);
    setWeight(item.weight);
    setTeamCode(item.teamCode);
    const existingFile = pendingPhotosRef.current.get(item.athleteId) || null;
    setPhotoFile(existingFile);
    setPhotoPreview(photoPreviews[item.athleteId] || "");
    window.scrollTo({ top: 220, behavior: "smooth" });
  }

  function handleDuplicateForNextEvent(item: DraftAthlete) {
    setEditingLocalId(null);
    setName(item.name);
    setGender(item.gender);
    setBirthDateStr(item.birthDateStr);
    setSchool(item.school || "");
    setAthleteClass(item.athleteClass || "");
    setWeight(item.weight);
    setEventId("");
    setTeamCode("");
    const existingFile = pendingPhotosRef.current.get(item.athleteId) || null;
    setPhotoFile(existingFile);
    setPhotoPreview(photoPreviews[item.athleteId] || "");
    showMessage("success", `Đã nạp sẵn thông tin "${item.name}". Hãy chọn thêm nội dung thi đấu mới.`);
    window.scrollTo({ top: 220, behavior: "smooth" });
  }

  function handleDeleteAthlete(localId: string) {
    setAthletes((prev) => prev.filter((a) => a.localId !== localId));
    if (editingLocalId === localId) resetAthleteForm(false);
  }

  async function handleSubmitToBtc() {
    if (!regStatus.open) {
      showMessage("error", regStatus.reason);
      return;
    }
    if (!clubName.trim()) {
      showMessage("error", "Vui lòng nhập tên Câu lạc bộ / Đoàn trước khi nộp.");
      return;
    }
    if (athletes.length === 0) {
      showMessage("error", "Danh sách chưa có VĐV nào.");
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const clubId = getOrCreateClubId(clubName.trim());
      const photoStatuses = new Map<string, string>();
      const photoErrors: string[] = [];

      for (const a of athletes) {
        const file = pendingPhotosRef.current.get(a.athleteId);
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("athleteId", a.athleteId);
        formData.append("tournamentId", tournament.tournamentId);
        formData.append("clubId", clubId);
        try {
          const photoRes = await fetch("/api/registration/photo", {
            method: "POST",
            body: formData,
          });
          if (!photoRes.ok) {
            const pErr = (await photoRes.json().catch(() => ({}))) as { message?: string };
            throw new Error(pErr.message || "Lỗi tải ảnh");
          }
          photoStatuses.set(a.athleteId, "pending_admin_review");
        } catch (err) {
          photoStatuses.set(a.athleteId, "upload_failed");
          photoErrors.push(`${a.name}: ${err instanceof Error ? err.message : "Lỗi ảnh"}`);
        }
      }

      const payloadAthletes: RegistrationAthletePayload[] = athletes.map((a) => ({
        id: a.athleteId,
        athleteId: a.athleteId,
        clubId,
        name: a.name,
        gender: a.gender,
        birthDate: a.birthDateIso,
        birthYear: new Date(a.birthDateIso).getFullYear(),
        eventId: a.eventId,
        eventName: a.eventName,
        weight: a.weight || undefined,
        isTeam: a.isTeam,
        teamCode: a.teamCode || undefined,
        club: clubName.trim(),
        school: a.school?.trim() || undefined,
        athleteClass: a.athleteClass?.trim() || undefined,
        photoStatus: photoStatuses.get(a.athleteId) || a.photoStatus || "not_provided",
      }));

      const res = await fetch("/api/registration/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournament.tournamentId,
          tournamentName: tournament.tournamentName,
          startTime: tournament.startTime,
          endTime: tournament.endTime,
          clubName: clubName.trim(),
          clubId,
          teamLeaderName: teamLeader.trim(),
          coachName: coach1.trim(),
          additionalCoaches: [coach2.trim(), coach3.trim()].filter(Boolean),
          athletes: payloadAthletes,
        }),
      });

      const result = (await res.json().catch(() => ({}))) as {
        message?: string;
        localTime?: string;
      };

      if (!res.ok) {
        throw new Error(result.message || "Không thể nộp danh sách.");
      }

      setLastSubmittedAt(result.localTime || "Vừa xong");
      showMessage(
        "success",
        photoErrors.length > 0
          ? `Đã nộp ${athletes.length} VĐV lúc ${result.localTime || "vừa xong"}. Lưu ý ảnh chưa tải được: ${photoErrors.join("; ")}`
          : `Đã nộp thành công ${athletes.length} VĐV của "${clubName.trim()}" lên hệ thống K-SPORT lúc ${result.localTime || "vừa xong"}.`,
      );
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Lỗi nộp danh sách.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleExportCsv() {
    if (athletes.length === 0) return;
    const header = [
      "STT",
      "Họ và tên",
      "Giới tính",
      "Ngày sinh",
      ...(isSchoolTournament ? ["Trường", "Lớp"] : []),
      "Nội dung thi đấu",
      "Cân nặng",
      "Mã đội",
      "CLB/Đoàn",
    ];
    const rows = athletes.map((a, idx) => [
      String(idx + 1),
      a.name,
      a.gender === "male" ? "Nam" : "Nữ",
      a.birthDateStr,
      ...(isSchoolTournament ? [a.school || "", a.athleteClass || ""] : []),
      a.eventName,
      a.weight || "",
      a.teamCode || "",
      clubName.trim(),
    ]);
    const csv = [header, ...rows]
      .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dang-ky-${tournament.slug || tournament.tournamentId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportJson() {
    if (athletes.length === 0) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            tournamentId: tournament.tournamentId,
            tournamentName: tournament.tournamentName,
            clubName: clubName.trim(),
            teamLeaderName: teamLeader.trim(),
            coachName: coach1.trim(),
            additionalCoaches: [coach2.trim(), coach3.trim()].filter(Boolean),
            athletes,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dang-ky-${tournament.slug || tournament.tournamentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ background: "#f4f6f9", minHeight: "calc(100vh - 140px)" }}>
      {/* Clean unclipped Tournament Header */}
      <header
        style={{
          background: "linear-gradient(120deg, #061830 0%, #0d2b52 72%, #8c0a1d 100%)",
          color: "#ffffff",
          padding: "1.35rem 0 1.5rem",
          borderBottom: "3px solid #d50b27",
        }}
      >
        <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between", marginBottom: "0.55rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.3rem 0.85rem",
                borderRadius: "999px",
                background: regStatus.open ? "rgba(22, 163, 74, 0.22)" : "rgba(220, 38, 38, 0.28)",
                border: `1px solid ${regStatus.open ? "#4ade80" : "#f87171"}`,
                fontSize: "0.82rem",
                fontWeight: 700,
              }}
            >
              {regStatus.open ? "● ĐANG MỞ ĐĂNG KÝ TRỰC TUYẾN" : `● ${regStatus.reason}`}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                {lastSubmittedAt ? `Đã nộp BTC lúc ${lastSubmittedAt} · ` : ""}Tự động lưu nháp trên trình duyệt
              </span>
              <button
                type="button"
                onClick={() => setTourStep(0)}
                style={{
                  minHeight: "36px",
                  padding: "0.3rem 0.85rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ? Hướng dẫn đăng ký
              </button>
            </div>
          </div>

          <h1
            style={{
              margin: "0 0 0.5rem",
              fontSize: "clamp(1.45rem, 2.5vw, 2.1rem)",
              lineHeight: 1.2,
              color: "#ffffff",
              maxWidth: 960,
            }}
          >
            {tournament.tournamentName}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.4rem", fontSize: "0.92rem", color: "#cbd5e1" }}>
            <span>📍 {tournament.location || "Địa điểm do BTC công bố"}</span>
            {tournament.date ? <span>📅 Ngày thi đấu: {tournament.date}</span> : null}
            <span>🥋 {tournament.events.length} nội dung thi đấu</span>
          </div>
        </div>
      </header>

      <div style={{ width: "min(1240px, calc(100% - 32px))", marginInline: "auto", paddingBlock: "1.25rem 3.5rem" }}>

        {notice ? (
          <div
            role="status"
            style={{
              padding: "0.95rem 1.2rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              border: `1px solid ${notice.type === "success" ? "#16a34a" : "#dc2626"}`,
              background: notice.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: notice.type === "success" ? "#166534" : "#991b1b",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Đóng thông báo"
              style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: "1.1rem", color: "inherit" }}
            >
              ✕
            </button>
          </div>
        ) : null}

        {/* Multi-event notice */}
        <div
          ref={multiNoticeRef}
          role="note"
          style={{
            padding: "0.95rem 1.2rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            border: "1px solid #fde68a",
            background: "#fffbeb",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            ...(tourStep !== null && TOUR_STEPS[tourStep]?.target === "multi"
              ? { outline: "3px solid #d50b27", outlineOffset: "3px" }
              : {}),
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 24,
              height: 24,
              borderRadius: "999px",
              border: "2px solid #d97706",
              color: "#d97706",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: "0.85rem",
              flexShrink: 0,
              marginTop: "0.1rem",
            }}
          >
            i
          </span>
          <div style={{ fontSize: "0.92rem", lineHeight: 1.55, color: "#78350f" }}>
            <strong style={{ display: "block", color: "#92400e", marginBottom: "0.2rem" }}>
              Lưu ý: Một VĐV đăng ký nhiều Nội dung?
            </strong>
            Mỗi lượt đấu là <strong>1 dòng riêng biệt</strong>. Nếu VĐV đấu 2 nội dung (VD: Cá nhân &amp; Đồng đội), HLV vui lòng{" "}
            <strong>nhập tên và bấm [+ Thêm vào danh sách] 2 lần</strong> (hoặc bấm nút <strong>+ Nội dung</strong> ngay trên dòng VĐV đã thêm) để tạo thành 2 dòng dưới danh sách. Với nội dung đồng đội, hãy nhập cùng <strong>Mã đội</strong> cho các thành viên thuộc cùng một đội.
          </div>
        </div>

        {/* Main 2-column split workspace */}
        <div
          className="reg-workspace-grid"
          style={{
            display: "grid",
            gap: "1.5rem",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: Step 1 (Club) + Step 2 (Athlete Form) */}
          <div>
            {/* Step 1: Club info */}
            <section
              ref={clubSectionRef}
              aria-label="Thông tin đơn vị"
              style={{
                ...cardStyle,
                ...(tourStep !== null && TOUR_STEPS[tourStep]?.target === "club"
                  ? { outline: "3px solid #d50b27", outlineOffset: "3px" }
                  : {}),
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>
                1. Thông tin Câu lạc bộ / Đoàn
              </h2>
              <div style={{ display: "grid", gap: "0.85rem", marginTop: "1rem" }}>
                  <div>
                    <label htmlFor="reg-club" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                      Tên CLB / Đơn vị *
                    </label>
                    <input
                      id="reg-club"
                      name="clubName"
                      type="text"
                      required
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value)}
                      placeholder="Ví dụ: CLB Karate Phú Thọ"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: "0.75rem" }}>
                    <div>
                      <label htmlFor="reg-leader" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        Trưởng đoàn
                      </label>
                      <input
                        id="reg-leader"
                        name="teamLeader"
                        type="text"
                        value={teamLeader}
                        onChange={(e) => setTeamLeader(e.target.value)}
                        placeholder="Họ và tên"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-coach1" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        HLV chính
                      </label>
                      <input
                        id="reg-coach1"
                        name="coach1"
                        type="text"
                        value={coach1}
                        onChange={(e) => setCoach1(e.target.value)}
                        placeholder="Họ và tên"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: "0.75rem" }}>
                    <div>
                      <label htmlFor="reg-coach2" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        HLV phụ 1
                      </label>
                      <input
                        id="reg-coach2"
                        name="coach2"
                        type="text"
                        value={coach2}
                        onChange={(e) => setCoach2(e.target.value)}
                        placeholder="Tùy chọn"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-coach3" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        HLV phụ 2
                      </label>
                      <input
                        id="reg-coach3"
                        name="coach3"
                        type="text"
                        value={coach3}
                        onChange={(e) => setCoach3(e.target.value)}
                        placeholder="Tùy chọn"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
            </section>

            {/* Step 2: Visual Athlete Form */}
            <section
              ref={athleteSectionRef}
              aria-label="Thêm vận động viên"
              style={{
                ...cardStyle,
                ...(tourStep !== null && TOUR_STEPS[tourStep]?.target === "athlete"
                  ? { outline: "3px solid #d50b27", outlineOffset: "3px" }
                  : {}),
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem" }}>
                {editingLocalId ? "2. Chỉnh sửa Vận động viên" : "2. Thêm Vận động viên"}
              </h2>

              <form onSubmit={handleSaveAthlete} style={{ display: "grid", gap: "0.95rem" }}>
                <div>
                  <label htmlFor="ath-name" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                    Họ và tên VĐV *
                  </label>
                  <input
                    id="ath-name"
                    name="athleteName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    style={inputStyle}
                  />
                </div>

                {/* Gender Toggle + DOB */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: "0.75rem" }}>
                  <div>
                    <span style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                      Giới tính *
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setGender("male");
                          setEventId("");
                        }}
                        style={{
                          minHeight: "44px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: gender === "male" ? "2px solid #1d4ed8" : "1px solid #cbd5e1",
                          background: gender === "male" ? "#eff6ff" : "#ffffff",
                          color: gender === "male" ? "#1d4ed8" : "#475569",
                        }}
                      >
                        Nam
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGender("female");
                          setEventId("");
                        }}
                        style={{
                          minHeight: "44px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: gender === "female" ? "2px solid #be185d" : "1px solid #cbd5e1",
                          background: gender === "female" ? "#fdf2f8" : "#ffffff",
                          color: gender === "female" ? "#be185d" : "#475569",
                        }}
                      >
                        Nữ
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ath-dob" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                      Ngày / Năm sinh *
                    </label>
                    <input
                      id="ath-dob"
                      name="birthDate"
                      type="text"
                      required
                      value={birthDateStr}
                      onChange={(e) => setBirthDateStr(e.target.value)}
                      placeholder="15/05/2008 hoặc 2008"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* School & Class for student tournaments */}
                {(isSchoolTournament || Boolean(school || athleteClass)) ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: "0.75rem" }}>
                    <div>
                      <label htmlFor="ath-school" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        Trường
                      </label>
                      <input
                        id="ath-school"
                        name="school"
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="VD: THPT Hai Bà Trưng"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="ath-class" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        Lớp
                      </label>
                      <input
                        id="ath-class"
                        name="athleteClass"
                        type="text"
                        value={athleteClass}
                        onChange={(e) => setAthleteClass(e.target.value)}
                        placeholder="VD: 10A1"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                ) : null}

                {/* Visual Category Picker */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                    <label htmlFor="ath-event-search" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Nội dung thi đấu * ({availableCategories.length})
                    </label>
                    {selectedCategory ? (
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#15803d" }}>
                        ✓ Đã chọn
                      </span>
                    ) : null}
                  </div>

                  {/* Category type tabs */}
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    {(
                      [
                        ["all", "Tất cả"],
                        ["kata", "Kata"],
                        ["kumite", "Kumite"],
                        ["team", "Đồng đội"],
                      ] as const
                    ).map(([tabKey, tabLabel]) => (
                      <button
                        key={tabKey}
                        type="button"
                        onClick={() => setCategoryTab(tabKey)}
                        style={{
                          minHeight: "34px",
                          padding: "0.25rem 0.7rem",
                          borderRadius: "999px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: categoryTab === tabKey ? "1px solid #0f172a" : "1px solid #cbd5e1",
                          background: categoryTab === tabKey ? "#0f172a" : "#f8fafc",
                          color: categoryTab === tabKey ? "#ffffff" : "#475569",
                        }}
                      >
                        {tabLabel}
                      </button>
                    ))}
                  </div>

                  <input
                    id="ath-event-search"
                    type="search"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Tìm nhanh theo hạng cân, lứa tuổi, kata..."
                    style={{ ...inputStyle, marginBottom: "0.5rem" }}
                  />

                  <div
                    role="listbox"
                    aria-label="Danh sách nội dung thi đấu"
                    style={{
                      maxHeight: "220px",
                      overflowY: "auto",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc",
                    }}
                  >
                    {availableCategories.length === 0 ? (
                      <div style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.9rem" }}>
                        Không có nội dung phù hợp với bộ lọc.
                      </div>
                    ) : (
                      availableCategories.map((cat) => {
                        const isSelected = cat.id === eventId;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => setEventId(cat.id)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "0.6rem 0.8rem",
                              border: 0,
                              borderBottom: "1px solid #e2e8f0",
                              background: isSelected ? "#fee2e2" : "#ffffff",
                              color: isSelected ? "#991b1b" : "#0f172a",
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: "0.9rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "0.5rem",
                            }}
                          >
                            <span>{cat.name}</span>
                            <span
                              style={{
                                flexShrink: 0,
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px",
                                background: cat.isTeamEvent ? "#fef3c7" : "#e2e8f0",
                                color: cat.isTeamEvent ? "#92400e" : "#334155",
                                textTransform: "uppercase",
                              }}
                            >
                              {cat.isTeamEvent ? "Đồng đội" : cat.type || "Cá nhân"}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Weight & Team code */}
                <div style={{ display: "grid", gridTemplateColumns: selectedCategory?.isTeamEvent ? "1fr 1fr" : "1fr", gap: "0.75rem" }}>
                  <div>
                    <label htmlFor="ath-weight" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                      Cân nặng (kg, tùy chọn)
                    </label>
                    <input
                      id="ath-weight"
                      name="weight"
                      type="text"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ví dụ: 55"
                      style={inputStyle}
                    />
                  </div>
                  {selectedCategory?.isTeamEvent ? (
                    <div>
                      <label htmlFor="ath-teamcode" style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.9rem" }}>
                        Mã đội (Đội A / Đội 1...)
                      </label>
                      <input
                        id="ath-teamcode"
                        name="teamCode"
                        type="text"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        placeholder="Ví dụ: Đội 1"
                        style={inputStyle}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Photo upload with preview */}
                <div>
                  <label htmlFor="ath-photo" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.6rem", fontSize: "0.92rem", color: "#0f172a" }}>
                    <span aria-hidden="true" style={{ color: "#1d4ed8", display: "inline-flex" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                    <strong>Ảnh thẻ VĐV</strong>
                    <span style={{ color: "#64748b", fontWeight: 400 }}>(tùy chọn · JPG/PNG/WebP · tối đa 5 MB)</span>
                  </label>

                  <input
                    ref={photoInputRef}
                    id="ath-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    style={{ display: "none" }}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      aria-label={photoPreview ? "Đổi ảnh thẻ VĐV" : "Thêm ảnh thẻ VĐV"}
                      style={{
                        width: "92px",
                        height: "118px",
                        borderRadius: "10px",
                        border: photoPreview ? "1px solid #cbd5e1" : "1.5px dashed #cbd5e1",
                        background: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem",
                        padding: photoPreview ? 0 : "0.5rem",
                        overflow: "hidden",
                        cursor: "pointer",
                        color: "#64748b",
                        flexShrink: 0,
                      }}
                    >
                      {photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoPreview}
                          alt="Xem trước ảnh thẻ"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <>
                          <span style={{ fontSize: "1.6rem", lineHeight: 1, color: "#94a3b8" }}>+</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>Thêm ảnh</span>
                        </>
                      )}
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.45rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          style={{
                            minHeight: "40px",
                            padding: "0.45rem 1rem",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            color: "#1d4ed8",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Chọn tệp
                        </button>
                        {photoPreview ? (
                          <button
                            type="button"
                            onClick={clearPhotoSelection}
                            aria-label="Xóa ảnh đã chọn"
                            style={{
                              minHeight: "40px",
                              padding: "0.45rem 0.8rem",
                              borderRadius: "8px",
                              border: "1px solid #fecaca",
                              background: "#fef2f2",
                              color: "#b91c1c",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Xóa ảnh
                          </button>
                        ) : null}
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {photoFile ? photoFile.name : "Chưa có tệp nào được chọn"}
                      </span>
                    </div>
                  </div>
                </div>

                {!editingLocalId ? (
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", color: "#334155", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={keepAthleteInfo}
                      onChange={(e) => setKeepAthleteInfo(e.target.checked)}
                    />
                    Giữ họ tên &amp; ngày sinh sau khi thêm (đăng ký nhiều nội dung cho cùng 1 VĐV)
                  </label>
                ) : null}

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.25rem" }}>
                  <button type="submit" className="button red" style={{ minHeight: "44px", flex: 1 }}>
                    {editingLocalId ? "Lưu thay đổi VĐV" : "+ Thêm vào danh sách"}
                  </button>
                  {editingLocalId ? (
                    <button
                      type="button"
                      onClick={() => resetAthleteForm(false)}
                      style={{
                        minHeight: "44px",
                        padding: "0 1rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        color: "#0f172a",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Hủy sửa
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          </div>

          {/* RIGHT COLUMN: Live Roster & Submission */}
          <section
            ref={rosterSectionRef}
            aria-label="Danh sách đã nhập"
            style={{
              ...cardStyle,
              ...(tourStep !== null && TOUR_STEPS[tourStep]?.target === "roster"
                ? { outline: "3px solid #d50b27", outlineOffset: "3px" }
                : {}),
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.15rem" }}>
                  3. Danh sách đăng ký ({athletes.length})
                </h2>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  {clubName.trim() ? `Đoàn: ${clubName.trim()}` : "Kiểm tra kỹ họ tên, năm sinh và nội dung trước khi gửi lên BTC."}
                </p>
              </div>
              <button
                type="button"
                className="button red"
                style={{ minHeight: "44px" }}
                disabled={submitting || !regStatus.open || athletes.length === 0}
                onClick={handleSubmitToBtc}
              >
                {submitting ? "Đang nộp lên K-SPORT..." : "Nộp danh sách cho BTC"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{ padding: "0.45rem 0.5rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{athletes.length}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Tổng lượt</div>
              </div>
              <div style={{ padding: "0.45rem 0.5rem", borderRadius: "8px", background: "#eff6ff", border: "1px solid #bfdbfe", textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1d4ed8" }}>{stats.maleCount}</div>
                <div style={{ fontSize: "0.75rem", color: "#1e40af" }}>Nam</div>
              </div>
              <div style={{ padding: "0.45rem 0.5rem", borderRadius: "8px", background: "#fdf2f8", border: "1px solid #fbcfe8", textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#be185d" }}>{stats.femaleCount}</div>
                <div style={{ fontSize: "0.75rem", color: "#9d174d" }}>Nữ</div>
              </div>
              <div style={{ padding: "0.45rem 0.5rem", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d" }}>{stats.uniqueEvents}</div>
                <div style={{ fontSize: "0.75rem", color: "#166534" }}>Nội dung</div>
              </div>
            </div>

            {athletes.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginBottom: "1rem", alignItems: "center", justifyContent: "space-between" }}>
                <input
                  type="search"
                  aria-label="Tìm trong danh sách đã nhập"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Tìm VĐV hoặc nội dung đã nhập..."
                  style={{ ...inputStyle, maxWidth: 320, minHeight: "40px" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    style={{
                      minHeight: "40px",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Xuất Excel (CSV)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    style={{
                      minHeight: "40px",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Tải JSON
                  </button>
                </div>
              </div>
            ) : null}

            {athletes.length === 0 ? (
              <div
                style={{
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  borderRadius: "10px",
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  color: "#64748b",
                }}
              >
                <p style={{ margin: "0 0 0.35rem", fontWeight: 700, color: "#334155" }}>
                  Danh sách đoàn đang trống
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  Nhập thông tin CLB ở bước 1 và thêm từng VĐV ở bước 2 bên cạnh.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {filteredRoster.map((a, idx) => {
                  const thumbUrl = photoPreviews[a.athleteId];
                  return (
                    <div
                      key={a.localId}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        padding: "0.85rem 1rem",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: "1 1 220px" }}>
                        {thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl}
                            alt={a.name}
                            style={{ width: 42, height: 42, borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "8px",
                              background: a.gender === "male" ? "#eff6ff" : "#fdf2f8",
                              color: a.gender === "male" ? "#1d4ed8" : "#be185d",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(a.name)}
                          </div>
                        )}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>#{idx + 1}</span>
                            <strong style={{ color: "#0f172a" }}>{a.name}</strong>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                padding: "0.1rem 0.45rem",
                                borderRadius: "999px",
                                background: a.gender === "male" ? "#eff6ff" : "#fdf2f8",
                                color: a.gender === "male" ? "#1d4ed8" : "#be185d",
                              }}
                            >
                              {a.gender === "male" ? "Nam" : "Nữ"} · {a.birthDateStr}
                            </span>
                            {a.teamCode ? (
                              <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "999px", background: "#fef3c7", color: "#92400e" }}>
                                {a.teamCode}
                              </span>
                            ) : null}
                          </div>
                          <div style={{ fontSize: "0.88rem", color: "#475569", marginTop: "0.2rem" }}>
                            {a.eventName}
                            {a.weight ? ` · ${a.weight} kg` : ""}
                            {(a.school || a.athleteClass) ? ` · ${[a.school, a.athleteClass].filter(Boolean).join(" - ")}` : ""}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          title="Thêm nội dung khác cho VĐV này"
                          onClick={() => handleDuplicateForNextEvent(a)}
                          style={{
                            minHeight: "36px",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            background: "#f8fafc",
                            color: "#0f172a",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          + Nội dung
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditAthlete(a)}
                          style={{
                            minHeight: "36px",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#0f172a",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAthlete(a.localId)}
                          style={{
                            minHeight: "36px",
                            padding: "0.3rem 0.65rem",
                            borderRadius: "6px",
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            color: "#b91c1c",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.88rem" }}>
              <Link href="/events" style={{ color: "var(--red)", fontWeight: 600 }}>
                ← Xem thông tin các giải đấu
              </Link>
              {athletes.length > 0 ? (
                <span style={{ color: "#64748b" }}>
                  Ảnh thẻ đính kèm: {stats.photosCount}/{athletes.length}
                </span>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {/* Product Tour Floating Card */}
      {tourStep !== null && TOUR_STEPS[tourStep] ? (
        <aside
          role="dialog"
          aria-label="Hướng dẫn sử dụng cổng đăng ký"
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            left: "auto",
            width: "min(400px, calc(100vw - 32px))",
            zIndex: 1500,
            background: "#061830",
            color: "#ffffff",
            borderRadius: "14px",
            padding: "1.2rem 1.25rem",
            border: "2px solid #d50b27",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Hướng dẫn · {tourStep + 1} / {TOUR_STEPS.length}
            </span>
            <button
              type="button"
              onClick={closeTour}
              aria-label="Đóng hướng dẫn"
              style={{ border: 0, background: "transparent", color: "#cbd5e1", fontSize: "1.1rem", cursor: "pointer", padding: "0.2rem" }}
            >
              ✕
            </button>
          </div>
          <h3 style={{ margin: "0 0 0.45rem", fontSize: "1.05rem", color: "#ffffff" }}>
            {TOUR_STEPS[tourStep].title}
          </h3>
          <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", lineHeight: 1.5, color: "#e2e8f0" }}>
            {TOUR_STEPS[tourStep].description}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={closeTour}
              style={{
                minHeight: "38px",
                padding: "0.35rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "transparent",
                color: "#cbd5e1",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Bỏ qua
            </button>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {tourStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setTourStep((s) => (s !== null ? Math.max(0, s - 1) : 0))}
                  style={{
                    minHeight: "38px",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Quay lại
                </button>
              ) : null}
              {tourStep < TOUR_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setTourStep((s) => (s !== null ? s + 1 : 0))}
                  style={{
                    minHeight: "38px",
                    padding: "0.35rem 0.95rem",
                    borderRadius: "8px",
                    border: 0,
                    background: "#d50b27",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Tiếp theo →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeTour}
                  style={{
                    minHeight: "38px",
                    padding: "0.35rem 0.95rem",
                    borderRadius: "8px",
                    border: 0,
                    background: "#16a34a",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Bắt đầu đăng ký ✓
                </button>
              )}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
