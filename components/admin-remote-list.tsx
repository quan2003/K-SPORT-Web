"use client";

import { useEffect, useState } from "react";

type Props = { title: string; description: string; endpoint: string; columns: string[]; empty: string };

function rowsFrom(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];
  const object = payload as Record<string, unknown>;
  for (const key of ["data", "items", "rows", "tournaments", "orders", "users", "requests"]) {
    if (Array.isArray(object[key])) return object[key] as Record<string, unknown>[];
  }
  return [];
}

export function AdminRemoteList({ title, description, endpoint, columns, empty }: Props) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { fetch(endpoint).then(async (response) => { const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(); setRows(rowsFrom(payload)); setState("ready"); }).catch(() => setState("error")); }, [endpoint]);
  return <section className="admin-page" aria-labelledby="remote-list-title">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">Karate Admin</p><h1 id="remote-list-title">{title}</h1><p>{description}</p></div></div>
    {state === "loading" && <div className="admin-loading" role="status"><span className="admin-loading-spinner" aria-hidden="true" />Đang tải dữ liệu từ máy chủ…</div>}
    {state === "error" && <p className="admin-error" role="alert">Không thể tải dữ liệu. Hãy kiểm tra phiên đăng nhập và kết nối API.</p>}
    {state === "ready" && <div className="admin-panel admin-table-wrap"><table className="admin-table"><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>{empty}</td></tr> : rows.map((row, index) => <tr key={String(row.id || row._id || index)}>{columns.map((column) => { const key = column.toLowerCase().replaceAll(" ", "_"); const value = row[key] ?? row[column] ?? row.id ?? "—"; return <td key={column}>{typeof value === "object" ? JSON.stringify(value) : String(value)}</td>; })}</tr>)}</tbody></table></div>}
  </section>;
}
