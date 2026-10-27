import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <p>K-SPORT</p>
      <h1>Không tìm thấy nội dung</h1>
      <Link className="button button-primary" href="/">Về trang chủ</Link>
    </main>
  );
}
