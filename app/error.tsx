"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="error-page"><h1>Không thể tải nội dung</h1><p>Đã xảy ra lỗi tạm thời. Vui lòng thử lại.</p><button className="button red" type="button" onClick={reset}>Thử lại</button></main>;
}
