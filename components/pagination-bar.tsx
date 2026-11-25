"use client";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (nextPage: number) => void;
}

function buildPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("ellipsis");
  for (let p = left; p <= right; p += 1) pages.push(p);
  if (right < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "mục",
  onPageChange,
}: PaginationBarProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);
  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav className="ks-pagination-bar" aria-label="Phân trang">
      <div className="ks-pagination-info">
        Trang <strong>{page}</strong> / {totalPages} · Hiển thị{" "}
        <strong>
          {start}–{end}
        </strong>{" "}
        / {totalItems} {itemLabel}
      </div>

      <div className="ks-pagination-controls">
        <button
          type="button"
          className="ks-page-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Trang trước"
        >
          ‹ Trước
        </button>

        {pages.map((item, idx) =>
          item === "ellipsis" ? (
            <span key={`el-${idx}`} className="ks-page-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`ks-page-btn ${item === page ? "is-active" : ""}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className="ks-page-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Trang sau"
        >
          Sau ›
        </button>
      </div>
    </nav>
  );
}

