"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentImage } from "@/components/content-image";

type ContentKind = "news" | "banners";
type ContentItem = Record<string, unknown> & { id: string; title: string; image?: string; isPublished: boolean; publishedAt?: string };
type Toast = { tone: "success" | "error"; text: string } | null;
type ContentFilter = "all" | "published" | "draft";

function formatAdminDate(value: unknown) {
  const raw = dateInputValue(value);
  if (!raw) return "Chưa đặt ngày";
  const date = new Date(`${raw}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? "Chưa đặt ngày" : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function dateInputValue(value: unknown) {
  const raw = String(value || "");
  const matchedDate = raw.match(/^\d{4}-\d{2}-\d{2}/);
  if (matchedDate) return matchedDate[0];
  const legacyDate = raw.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})$/);
  if (legacyDate) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const [, weekday, monthName, dayText] = legacyDate;
    const now = new Date();
    const closest = [now.getUTCFullYear() - 1, now.getUTCFullYear(), now.getUTCFullYear() + 1]
      .map((year) => new Date(Date.UTC(year, months[monthName], Number(dayText))))
      .filter((candidate) => weekdays[candidate.getUTCDay()] === weekday)
      .sort((left, right) => Math.abs(left.getTime() - now.getTime()) - Math.abs(right.getTime() - now.getTime()))[0];
    if (closest) return closest.toISOString().slice(0, 10);
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function toApiPublishedAt(value: FormDataEntryValue | undefined) {
  const date = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00.000Z` : date;
}

const emptyNews = { title: "", slug: "", category: "Tin tức", summary: "", body: "", imageUrl: "", publishedAt: new Date().toISOString().slice(0, 10), isPublished: false };
const emptyBanner = { eyebrow: "", title: "", description: "", imageUrl: "", primaryLabel: "", primaryHref: "", secondaryLabel: "", secondaryHref: "", position: 0, isPublished: false };

export function AdminContentManager({ kind }: { kind: ContentKind }) {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [filter, setFilter] = useState<ContentFilter>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const imageUrlRef = useRef<HTMLInputElement>(null);
  const editorTitleRef = useRef<HTMLHeadingElement>(null);
  const isNews = kind === "news";
  const contentName = isNews ? "bài viết" : "banner";

  const showToast = useCallback((tone: NonNullable<Toast>["tone"], text: string) => setToast({ tone, text }), []);
  useEffect(() => { if (!toast) return; const timeoutId = window.setTimeout(() => setToast(null), 4500); return () => window.clearTimeout(timeoutId); }, [toast]);

  const requireLogin = useCallback((response: Response) => {
    if (response.status !== 401 && response.status !== 403) return false;
    router.replace("/login?expired=1");
    return true;
  }, [router]);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/content/${kind}`, { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (requireLogin(response)) return;
      if (!response.ok) throw new Error(payload.message || "Không thể tải nội dung");
      setItems(Array.isArray(payload.items) ? payload.items : []);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Không thể tải nội dung");
    } finally { if (showLoading) setIsLoading(false); }
  }, [kind, requireLogin, showToast]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/content/${kind}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (requireLogin(response)) return { items: [] };
        if (!response.ok) throw new Error(payload.message || "Không thể tải nội dung");
        return payload;
      })
      .then((payload) => { if (!cancelled) setItems(Array.isArray(payload.items) ? payload.items : []); })
      .catch((error: Error) => { if (!cancelled) showToast("error", error.message); });
    return () => { cancelled = true; };
  }, [kind, requireLogin, showToast]);

  const form = (editing ?? (isNews ? emptyNews : emptyBanner)) as Record<string, unknown>;
  const shownImageUrl = uploadedImageUrl || String(form.image ?? form.imageUrl ?? "");
  const value = (name: string) => String(form[name] ?? "");
  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || (filter === "published" ? item.isPublished : !item.isPublished);
    return matchesFilter && item.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi").trim());
  });

  function openEditor(item?: ContentItem) { setEditing(item ?? null); setUploadedImageUrl(""); setIsEditorOpen(true); window.setTimeout(() => editorTitleRef.current?.focus(), 0); }
  function closeEditor() { setUploadedImageUrl(""); setEditing(null); setIsEditorOpen(false); }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) { showToast("error", "Chỉ nhận ảnh JPG, PNG hoặc WebP, tối đa 8 MB."); event.target.value = ""; return; }
    setIsUploading(true);
    try {
      const signatureResponse = await fetch("/api/admin/content/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contentType: file.type, sizeBytes: file.size }) });
      const signature = await signatureResponse.json().catch(() => ({}));
      if (requireLogin(signatureResponse)) return;
      if (!signatureResponse.ok || !signature.uploadUrl || !signature.fileUrl) throw new Error(signature.message || "Không thể chuẩn bị tải ảnh lên");
      const uploadResponse = await fetch(signature.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!uploadResponse.ok) throw new Error("Không thể tải ảnh lên kho lưu trữ");
      if (imageUrlRef.current) imageUrlRef.current.value = signature.fileUrl;
      setUploadedImageUrl(signature.fileUrl);
      showToast("success", "Đã tải ảnh lên. Nhấn Lưu nội dung để áp dụng.");
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Không thể tải ảnh lên"); }
    finally { setIsUploading(false); event.target.value = ""; }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const data = { ...values, isPublished: values.isPublished === "on", ...(isNews ? { imageUrl: String(values.imageUrl || form.imageUrl || form.image || ""), publishedAt: toApiPublishedAt(values.publishedAt), body: String(values.body || "").split(/\r?\n/).filter(Boolean) } : { position: Number(values.position || 0) }) };
    setIsSaving(true);
    try {
      const response = await fetch(editing ? `/api/admin/content/${kind}/${editing.id}` : `/api/admin/content/${kind}`, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const payload = await response.json().catch(() => ({}));
      if (requireLogin(response)) return;
      if (!response.ok) return showToast("error", payload.message || "Không thể lưu nội dung");
      showToast("success", editing ? "Đã cập nhật nội dung." : "Đã tạo nội dung mới.");
      closeEditor();
      await load();
    } catch (error) { showToast("error", error instanceof Error ? error.message : "Không thể lưu nội dung"); }
    finally { setIsSaving(false); }
  }

  async function remove(item: ContentItem) {
    if (!window.confirm(`Xóa “${item.title}”? Hành động này không thể hoàn tác.`)) return;
    const response = await fetch(`/api/admin/content/${kind}/${item.id}`, { method: "DELETE" });
    if (requireLogin(response)) return;
    if (!response.ok) return showToast("error", "Không thể xóa nội dung");
    showToast("success", "Đã xóa nội dung.");
    await load();
  }

  return <>
    {toast ? <div className={`admin-toast ${toast.tone}`} role="status" aria-live="polite"><p>{toast.text}</p><button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo">×</button></div> : null}
    {isEditorOpen ? <section className="admin-editor-view" aria-labelledby="admin-editor-title">
      <div className="admin-editor-view-header"><div><h2 id="admin-editor-title" ref={editorTitleRef} tabIndex={-1}>{editing ? `Chỉnh sửa ${contentName}` : `Tạo ${contentName} mới`}</h2></div><button type="button" className="admin-text-button" onClick={closeEditor}>← Quay lại danh sách</button></div>
      <form key={editing?.id ?? `new-${kind}`} className="admin-editor" onSubmit={submit}>
        <div className="admin-editor-fields">
          {isNews ? <><label>Tiêu đề<input name="title" required autoComplete="off" defaultValue={value("title")} /></label><label>Đường dẫn bài viết<input name="slug" autoComplete="off" defaultValue={value("slug")} placeholder="tu-dong-tu-tieu-de" /></label><label>Chuyên mục<input name="category" autoComplete="off" defaultValue={value("category")} /></label><label>Tóm tắt<textarea name="summary" autoComplete="off" defaultValue={value("summary")} /></label><label className="admin-field-wide">Nội dung <small>Mỗi đoạn một dòng.</small><textarea name="body" autoComplete="off" defaultValue={Array.isArray(form.body) ? (form.body as string[]).join("\n") : value("body")} /></label><label className="admin-field-wide">URL ảnh bìa<input ref={imageUrlRef} name="imageUrl" type="url" autoComplete="off" defaultValue={value("imageUrl") || value("image")} placeholder="https://…" /></label><label>Ngày đăng<input name="publishedAt" type="date" lang="vi-VN" defaultValue={dateInputValue(form.publishedAt)} /></label></> : <><label>Nhãn nhỏ<input name="eyebrow" autoComplete="off" defaultValue={value("eyebrow")} /></label><label>Tiêu đề<input name="title" required autoComplete="off" defaultValue={value("title")} /></label><label className="admin-field-wide">Mô tả<textarea name="description" autoComplete="off" defaultValue={value("description")} /></label><label>URL ảnh banner<input ref={imageUrlRef} name="imageUrl" type="url" autoComplete="off" defaultValue={value("imageUrl")} placeholder="https://…" /></label><label>Nút chính<input name="primaryLabel" autoComplete="off" defaultValue={value("primaryLabel")} /></label><label>Liên kết nút chính<input name="primaryHref" autoComplete="off" defaultValue={value("primaryHref")} placeholder="https://… hoặc /events" /></label><label>Nút phụ<input name="secondaryLabel" autoComplete="off" defaultValue={value("secondaryLabel")} /></label><label>Liên kết nút phụ<input name="secondaryHref" autoComplete="off" defaultValue={value("secondaryHref")} placeholder="https://… hoặc /software" /></label><label>Thứ tự<input name="position" type="number" min="0" defaultValue={value("position")} /></label></>}
        </div>
        <aside className="admin-editor-aside"><label className="admin-image-upload">Ảnh đại diện<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={isUploading} /><small>{isUploading ? "Đang tải ảnh lên…" : "JPG, PNG hoặc WebP · tối đa 8 MB"}</small></label>{shownImageUrl ? <div className="admin-image-preview"><ContentImage src={shownImageUrl} alt="Xem trước ảnh bìa" width={640} height={360} /></div> : <div className="admin-image-placeholder">Chưa có ảnh. Dán URL hoặc chọn ảnh từ máy.</div>}<label className="admin-check"><input name="isPublished" type="checkbox" defaultChecked={Boolean(form.isPublished)} /> Công khai ngay sau khi lưu</label></aside>
        <div className="admin-editor-actions"><button type="button" className="admin-text-button" onClick={closeEditor}>Hủy</button><button className="button red" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu…" : editing ? "Lưu thay đổi" : `Tạo ${contentName}`}</button></div>
      </form>
    </section> : <section className="admin-list-view" aria-labelledby="admin-list-heading">
      <div className="admin-list-header"><div><h2 id="admin-list-heading">Danh sách {contentName}</h2><p>{items.length} {contentName} trong hệ thống.</p></div><button className="button red" type="button" onClick={() => openEditor()}>{isNews ? "Tạo bài viết" : "Tạo banner"}</button></div>
      <div className="admin-list-tabs" role="tablist" aria-label="Lọc trạng thái nội dung">{([['all', 'Tất cả'], ['published', 'Đang công khai'], ['draft', 'Bản nháp']] as const).map(([value, label]) => <button type="button" role="tab" aria-selected={filter === value} key={value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      <div className="admin-list-toolbar"><label className="admin-search"><span className="sr-only">Tìm {contentName}</span><input type="search" name="content-search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Tìm ${contentName}…`} /></label><span>{filteredItems.length} kết quả</span></div>
      {isLoading ? <p className="admin-list-state" aria-live="polite">Đang tải nội dung…</p> : filteredItems.length ? <div className="admin-table-wrap"><table className="admin-content-table"><thead><tr><th scope="col">{isNews ? "Bài viết" : "Banner"}</th><th scope="col">Trạng thái</th><th scope="col">{isNews ? "Ngày đăng" : "Thứ tự"}</th><th scope="col"><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{filteredItems.map((item) => <tr key={item.id}><td><div className="admin-content-title">{item.image ? <ContentImage src={item.image} alt="" width={112} height={72} /> : <div className="admin-content-thumb-empty" aria-hidden="true">Không ảnh</div>}<strong>{item.title}</strong></div></td><td><span className={item.isPublished ? "admin-status is-live" : "admin-status is-draft"}>{item.isPublished ? "Đang công khai" : "Bản nháp"}</span></td><td className="admin-content-date">{isNews ? formatAdminDate(item.publishedAt) : String(item.position ?? "—")}</td><td><div className="admin-content-card-actions"><button type="button" onClick={() => openEditor(item)} aria-label={`Sửa ${item.title}`}>Sửa</button><button type="button" onClick={() => remove(item)} aria-label={`Xóa ${item.title}`}>Xóa</button></div></td></tr>)}</tbody></table></div> : <div className="admin-list-state"><strong>{query || filter !== "all" ? "Không tìm thấy nội dung phù hợp." : `Chưa có ${contentName}.`}</strong><p>{query || filter !== "all" ? "Thử thay đổi từ khóa hoặc bộ lọc." : `Tạo ${contentName} đầu tiên để bắt đầu.`}</p></div>}
    </section>}
  </>;
}
