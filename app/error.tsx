"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="error-page">
      <section className="error-card" aria-labelledby="error-title">
        <span className="error-card-mark" aria-hidden="true">!</span>
        <p>HỆ THỐNG K-SPORT</p>
        <h1 id="error-title">Không thể tải nội dung</h1>
        <span className="error-card-rule" aria-hidden="true" />
        <p className="error-card-copy">Kết nối dữ liệu đang chậm hoặc vừa bị gián đoạn. Bạn có thể thử tải lại hồ sơ ngay bây giờ.</p>
        <button className="button red" type="button" onClick={reset}>Thử lại</button>
      </section>
    </main>
  );
}
