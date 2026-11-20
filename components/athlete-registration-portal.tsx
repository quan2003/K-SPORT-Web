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
  weight: string;
  isTeam: boolean;
  teamCode: string;
  photoStatus?: string;
};

const CLUB_IDS_STORAGE_KEY = "ksport_club_ids_v1";
const DRAFT_STORAGE_PREFIX = "ksport_reg_draft_v1_";

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

function getRegistrationWindowStatus(tournament: PublishedTournamentConfig | null) {
  if (!tournament) return { open: false, reason: "Vui lòng chọn giải đấu để bắt đầu đăng ký." };
  const now = new Date();
  if (tournament.startTime) {
    const start = new Date(tournament.startTime);
    if (!Number.isNaN(start.getTime()) && now < start) {
      return {
        open: false,
        reason: `Chưa đến thời gian mở đăng ký. Hệ thống mở lúc ${start.toLocaleString("vi-VN")}.`,
      };
    }
  }
  if (tournament.endTime) {
    const end = new Date(tournament.endTime);
    if (!Number.isNaN(end.getTime()) && now > end) {
      return {
        open: false,
        reason: `Đã hết hạn đăng ký trực tuyến từ ${end.toLocaleString("vi-VN")}.`,
      };
    }
  }
  return { open: true, reason: "" };
}

export function AthleteRegistrationPortal({
  tournaments,
  initialTournament,
  requestedSlug,
}: {
  tournaments: PublishedTournamentConfig[];
  initialTournament: PublishedTournamentConfig | null;
  requestedSlug?: string;
}) {
  const [selectedTournament, setSelectedTournament] = useState<PublishedTournamentConfig | null>(
    initialTournament || tournaments[0] || null,
  );
  const [clubName, setClubName] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [coach1, setCoach1] = useState("");
  const [coach2, setCoach2] = useState("");
  const [coach3, setCoach3] = useState("");
  const [athletes, setAthletes] = useState<DraftAthlete[]>([]);

  // Form state for adding/editing 1 athlete
  const [editingLocalId, setEditingLocalId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [birthDateStr, setBirthDateStr] = useState("");
  const [eventId, setEventId] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [weight, setWeight] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const pendingPhotosRef = useRef<Map<string, File>>(new Map());
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const storageKey = selectedTournament
    ? `${DRAFT_STORAGE_PREFIX}${selectedTournament.tournamentId}`
    : "";

  // Load saved draft for the selected tournament after hydration
  useEffect(() => {
    if (!storageKey) return;
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
        if (parsed.clubName) setClubName(parsed.clubName);
        if (parsed.teamLeader) setTeamLeader(parsed.teamLeader);
        if (parsed.coach1) setCoach1(parsed.coach1);
        if (parsed.coach2) setCoach2(parsed.coach2);
        if (parsed.coach3) setCoach3(parsed.coach3);
        if (Array.isArray(parsed.athletes)) setAthletes(parsed.athletes);
      } catch {
        // ignore corrupted draft
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  // Save draft automatically
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ clubName, teamLeader, coach1, coach2, coach3, athletes }),
      );
    } catch {
      // ignore quota
    }
  }, [storageKey, clubName, teamLeader, coach1, coach2, coach3, athletes]);

  const regStatus = useMemo(
    () => getRegistrationWindowStatus(selectedTournament),
    [selectedTournament],
  );

  const availableCategories = useMemo(() => {
    const list = selectedTournament?.events || [];
    const q = eventSearch.trim().toLowerCase();
    return list.filter((cat) => {
      const genderMatch =
        !cat.gender || cat.gender === "any" || cat.gender === gender;
      const queryMatch = !q || cat.name.toLowerCase().includes(q);
      return genderMatch && queryMatch;
    });
  }, [selectedTournament, eventSearch, gender]);

  const selectedCategory: PublishedEventCategory | undefined = useMemo(
    () => (selectedTournament?.events || []).find((c) => c.id === eventId),
    [selectedTournament, eventId],
  );

  function showMessage(type: "success" | "error", text: string) {
    setNotice({ type, text });
  }

  function handleJsonUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}")) as PublishedTournamentConfig;
        if (!parsed.tournamentId || !parsed.tournamentName || !Array.isArray(parsed.events)) {
          throw new Error("Tệp JSON không đúng cấu trúc giải đấu K-SPORT.");
        }
        setSelectedTournament(parsed);
        setEventId("");
        showMessage("success", `Đã nạp cấu hình giải đấu "${parsed.tournamentName}".`);
      } catch (err) {
        showMessage("error", err instanceof Error ? err.message : "Không thể đọc tệp JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setPhotoFile(null);
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
  }

  function resetAthleteForm() {
    setEditingLocalId(null);
    setName("");
    setBirthDateStr("");
    setEventId("");
    setWeight("");
    setTeamCode("");
    setPhotoFile(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function handleSaveAthlete(e: FormEvent) {
    e.preventDefault();
    if (!selectedTournament) {
      showMessage("error", "Vui lòng chọn giải đấu trước.");
      return;
    }
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
      showMessage("error", "Vui lòng chọn nội dung thi đấu.");
      return;
    }

    const athleteId =
      editingLocalId
        ? athletes.find((a) => a.localId === editingLocalId)?.athleteId || crypto.randomUUID()
        : crypto.randomUUID();
    const localId = editingLocalId || athleteId;

    if (photoFile) {
      pendingPhotosRef.current.set(athleteId, photoFile);
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
      weight: weight.trim(),
      isTeam: Boolean(selectedCategory.isTeamEvent),
      teamCode: teamCode.trim(),
      photoStatus: photoFile ? "pending_upload" : undefined,
    };

    if (editingLocalId) {
      setAthletes((prev) => prev.map((a) => (a.localId === editingLocalId ? record : a)));
      showMessage("success", `Đã cập nhật VĐV "${trimmedName}".`);
    } else {
      setAthletes((prev) => [...prev, record]);
      showMessage("success", `Đã thêm VĐV "${trimmedName}" vào danh sách.`);
    }

    resetAthleteForm();
  }

  function handleEditAthlete(item: DraftAthlete) {
    setEditingLocalId(item.localId);
    setName(item.name);
    setGender(item.gender);
    setBirthDateStr(item.birthDateStr);
    setEventId(item.eventId);
    setWeight(item.weight);
    setTeamCode(item.teamCode);
    setPhotoFile(pendingPhotosRef.current.get(item.athleteId) || null);
  }

  function handleDeleteAthlete(localId: string) {
    setAthletes((prev) => prev.filter((a) => a.localId !== localId));
    if (editingLocalId === localId) resetAthleteForm();
  }

  async function handleSubmitToBtc() {
    if (!selectedTournament) return;
    if (!regStatus.open) {
      showMessage("error", regStatus.reason);
      return;
    }
    if (!clubName.trim()) {
      showMessage("error", "Vui lòng nhập tên Câu lạc bộ / Đoàn.");
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

      // Upload any pending athlete photos first
      for (const a of athletes) {
        const file = pendingPhotosRef.current.get(a.athleteId);
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("athleteId", a.athleteId);
        formData.append("tournamentId", selectedTournament.tournamentId);
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
        photoStatus: photoStatuses.get(a.athleteId) || a.photoStatus || "not_provided",
      }));

      const res = await fetch("/api/registration/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: selectedTournament.tournamentId,
          tournamentName: selectedTournament.tournamentName,
          startTime: selectedTournament.startTime,
          endTime: selectedTournament.endTime,
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

      showMessage(
        "success",
        photoErrors.length > 0
          ? `Đã nộp ${athletes.length} VĐV lúc ${result.localTime || "vừa xong"}. Lưu ý ảnh chưa tải được: ${photoErrors.join("; ")}`
          : `Đã nộp thành công ${athletes.length} VĐV lên hệ thống K-SPORT (đồng bộ trực tiếp với phần mềm BTC) lúc ${result.localTime || "vừa xong"}.`,
      );
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Lỗi nộp danh sách.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleExportJson() {
    if (!selectedTournament || athletes.length === 0) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            tournamentId: selectedTournament.tournamentId,
            tournamentName: selectedTournament.tournamentName,
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
    a.download = `dang-ky-${selectedTournament.slug || selectedTournament.tournamentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container" style={{ paddingBlock: "2.5rem 4rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--red)" }}>
          CỔNG ĐĂNG KÝ VĐV TRỰC TUYẾN K-SPORT
        </p>
        <h1 style={{ margin: "0.25rem 0 0.5rem" }}>Đăng ký Vận động viên thi đấu</h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          Dữ liệu nộp tại đây được đồng bộ trực tiếp vào cơ sở dữ liệu Supabase của phần mềm K-SPORT Bốc thăm &amp; Điều hành giải.
        </p>
      </div>

      {requestedSlug && !initialTournament ? (
        <div
          role="alert"
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--red)",
            background: "rgba(220, 38, 38, 0.06)",
            marginBottom: "1.5rem",
          }}
        >
          Không tìm thấy cấu hình giải đấu cho đường dẫn <code>/dang-ky/{requestedSlug}</code>. Bạn có thể chọn giải đấu khác bên dưới hoặc tải tệp cấu hình <code>.json</code> từ Ban Tổ Chức.
        </div>
      ) : null}

      {/* 1. Tournament selector */}
      <section
        aria-label="Chọn giải đấu"
        style={{
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 320px" }}>
            <label htmlFor="reg-tournament-select" style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem" }}>
              Giải đấu đang mở cổng đăng ký ({tournaments.length})
            </label>
            <select
              id="reg-tournament-select"
              value={selectedTournament?.tournamentId || ""}
              onChange={(e) => {
                const found = tournaments.find((t) => t.tournamentId === e.target.value) || null;
                setSelectedTournament(found);
                setEventId("");
              }}
              style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            >
              {tournaments.length === 0 ? (
                <option value="">Chưa có giải đấu nào công bố trên Supabase</option>
              ) : (
                tournaments.map((t) => (
                  <option key={t.tournamentId} value={t.tournamentId}>
                    {t.tournamentName} {t.date ? `(${t.date})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <input
              ref={jsonInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleJsonUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="button"
              style={{ minHeight: "44px" }}
              onClick={() => jsonInputRef.current?.click()}
            >
              Nạp tệp cấu hình (.json)
            </button>
          </div>
        </div>

        {selectedTournament ? (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", fontSize: "0.92rem" }}>
            <div>
              <strong>{selectedTournament.tournamentName}</strong>
              <div style={{ color: "var(--muted)" }}>
                {selectedTournament.location || "Chưa cập nhật địa điểm"} · {selectedTournament.date || "Chưa rõ ngày"} · {selectedTournament.events.length} nội dung
              </div>
            </div>
            <div style={{ fontWeight: 600, color: regStatus.open ? "#15803d" : "var(--red)" }}>
              {regStatus.open ? "● Đang mở nhận hồ sơ" : `● ${regStatus.reason}`}
            </div>
          </div>
        ) : null}
      </section>

      {notice ? (
        <div
          role="status"
          style={{
            padding: "0.9rem 1.1rem",
            borderRadius: "10px",
            marginBottom: "1.5rem",
            border: `1px solid ${notice.type === "success" ? "#16a34a" : "var(--red)"}`,
            background: notice.type === "success" ? "rgba(22, 163, 74, 0.08)" : "rgba(220, 38, 38, 0.08)",
            fontWeight: 500,
          }}
        >
          {notice.text}
        </div>
      ) : null}

      {/* 2. Club & Coaches info */}
      <section
        aria-label="Thông tin đơn vị"
        style={{
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          background: "var(--surface)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.15rem" }}>1. Thông tin Câu lạc bộ / Đoàn</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div>
            <label htmlFor="reg-club" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
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
              style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>
          <div>
            <label htmlFor="reg-leader" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
              Trưởng đoàn
            </label>
            <input
              id="reg-leader"
              name="teamLeader"
              type="text"
              value={teamLeader}
              onChange={(e) => setTeamLeader(e.target.value)}
              placeholder="Họ và tên trưởng đoàn"
              style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>
          <div>
            <label htmlFor="reg-coach1" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
              Huấn luyện viên chính
            </label>
            <input
              id="reg-coach1"
              name="coach1"
              type="text"
              value={coach1}
              onChange={(e) => setCoach1(e.target.value)}
              placeholder="Họ và tên HLV 1"
              style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>
          <div>
            <label htmlFor="reg-coach2" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
              HLV phụ (tùy chọn)
            </label>
            <input
              id="reg-coach2"
              name="coach2"
              type="text"
              value={coach2}
              onChange={(e) => setCoach2(e.target.value)}
              placeholder="HLV 2"
              style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>
          <div>
            <label htmlFor="reg-coach3" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
              HLV phụ 2 (tùy chọn)
            </label>
            <input
              id="reg-coach3"
              name="coach3"
              type="text"
              value={coach3}
              onChange={(e) => setCoach3(e.target.value)}
              placeholder="HLV 3"
              style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>
        </div>
      </section>

      {/* 3. Add / Edit Athlete Form */}
      <section
        aria-label="Thêm vận động viên"
        style={{
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          background: "var(--surface)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.15rem" }}>
          {editingLocalId ? "2. Chỉnh sửa Vận động viên" : "2. Thêm Vận động viên vào danh sách"}
        </h2>
        <form onSubmit={handleSaveAthlete}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1rem" }}>
            <div>
              <label htmlFor="ath-name" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
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
                style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
              />
            </div>

            <div>
              <label htmlFor="ath-gender" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                Giới tính *
              </label>
              <select
                id="ath-gender"
                name="gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value === "female" ? "female" : "male");
                  setEventId("");
                }}
                style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div>
              <label htmlFor="ath-dob" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                Ngày sinh / Năm sinh *
              </label>
              <input
                id="ath-dob"
                name="birthDate"
                type="text"
                required
                value={birthDateStr}
                onChange={(e) => setBirthDateStr(e.target.value)}
                placeholder="DD/MM/YYYY hoặc YYYY"
                style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
              />
            </div>

            <div>
              <label htmlFor="ath-event-search" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                Lọc nội dung
              </label>
              <input
                id="ath-event-search"
                type="search"
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                placeholder="Tìm Kata, Kumite, hạng cân..."
                style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="ath-event" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                Nội dung thi đấu * ({availableCategories.length} nội dung phù hợp)
              </label>
              <select
                id="ath-event"
                name="eventId"
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
              >
                <option value="">-- Chọn nội dung thi đấu --</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.isTeamEvent ? "(Đồng đội)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ath-weight" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                Cân nặng (kg, tùy chọn)
              </label>
              <input
                id="ath-weight"
                name="weight"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ví dụ: 55"
                style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
              />
            </div>

            {selectedCategory?.isTeamEvent ? (
              <div>
                <label htmlFor="ath-teamcode" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                  Mã đội (Đội A / Đội B...)
                </label>
                <input
                  id="ath-teamcode"
                  name="teamCode"
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  placeholder="Ví dụ: Đội 1"
                  style={{ width: "100%", minHeight: "44px", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--line)" }}
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="ath-photo" style={{ display: "block", fontWeight: 600, marginBottom: "0.35rem" }}>
                Ảnh thẻ VĐV (JPG/PNG/WebP ≤ 5MB)
              </label>
              <input
                ref={photoInputRef}
                id="ath-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                style={{ width: "100%", minHeight: "44px", paddingTop: "0.45rem" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" className="button red" style={{ minHeight: "44px" }}>
              {editingLocalId ? "Lưu thay đổi VĐV" : "+ Thêm vào danh sách"}
            </button>
            {editingLocalId ? (
              <button type="button" className="button" style={{ minHeight: "44px" }} onClick={resetAthleteForm}>
                Hủy sửa
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* 4. Athlete List & Submit */}
      <section
        aria-label="Danh sách đã nhập"
        style={{
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "1.25rem",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.15rem" }}>
            3. Danh sách đăng ký của Đoàn ({athletes.length} lượt VĐV)
          </h2>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="button"
              style={{ minHeight: "44px" }}
              disabled={athletes.length === 0}
              onClick={handleExportJson}
            >
              Tải tệp JSON dự phòng
            </button>
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
        </div>

        {athletes.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Chưa có VĐV nào trong danh sách. Hãy thêm VĐV ở biểu mẫu phía trên.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ padding: "0.65rem 0.5rem" }}>#</th>
                  <th style={{ padding: "0.65rem 0.5rem" }}>Họ và tên</th>
                  <th style={{ padding: "0.65rem 0.5rem" }}>Giới tính</th>
                  <th style={{ padding: "0.65rem 0.5rem" }}>Ngày sinh</th>
                  <th style={{ padding: "0.65rem 0.5rem" }}>Nội dung</th>
                  <th style={{ padding: "0.65rem 0.5rem" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((a, idx) => (
                  <tr key={a.localId} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{idx + 1}</td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>
                      <strong>{a.name}</strong>
                      {a.teamCode ? <span style={{ color: "var(--muted)", marginLeft: "0.4rem" }}>({a.teamCode})</span> : null}
                    </td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{a.gender === "male" ? "Nam" : "Nữ"}</td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{a.birthDateStr}</td>
                    <td style={{ padding: "0.65rem 0.5rem" }}>{a.eventName}</td>
                    <td style={{ padding: "0.65rem 0.5rem", display: "flex", gap: "0.5rem" }}>
                      <button type="button" className="button" onClick={() => handleEditAthlete(a)}>
                        Sửa
                      </button>
                      <button type="button" className="button" onClick={() => handleDeleteAthlete(a.localId)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: "1.25rem", fontSize: "0.9rem", color: "var(--muted)" }}>
          <Link href="/events">← Quay lại danh sách giải đấu</Link>
        </div>
      </section>
    </div>
  );
}

