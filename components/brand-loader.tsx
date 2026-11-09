import Image from "next/image";

/** Loader thương hiệu dùng cho chuyển trang (loading.tsx). */
export function BrandLoader({ label = "Đang tải dữ liệu giải đấu" }: { label?: string }) {
  return (
    <main id="main-content" className="ks-route-loader" aria-busy="true" aria-live="polite" aria-label={`${label}…`}>
      <div className="ks-route-progress" aria-hidden="true">
        <span />
      </div>
      <div className="ks-route-loader-body">
        <div className="ks-route-logo">
          <Image src="/images/logo-header.png" alt="" width={200} height={64} priority />
        </div>
        <div className="ks-route-track" aria-hidden="true">
          <span />
        </div>
        <p className="ks-route-text">{label}…</p>
        <div className="ks-route-skeleton" aria-hidden="true">
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton short" />
        </div>
      </div>
    </main>
  );
}

