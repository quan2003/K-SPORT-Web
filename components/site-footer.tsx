import Image from "next/image";
import Link from "next/link";

const navigation = [
  ["Trang chủ", "/"], ["Giải đấu", "/events"], ["Lịch thi đấu", "/schedule"], ["Kết quả", "/results"],
  ["Vận động viên", "/athletes"], ["Xếp hạng", "/ranking"], ["Phần mềm", "/software"], ["Liên hệ", "/contact"],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-bar">
        <Link className="footer-logo" href="/" aria-label="K-SPORT, trang chủ"><Image src="/images/logo-footer-update.png" alt="K-SPORT" width={2111} height={745} /></Link>
        <nav className="footer-nav" aria-label="Điều hướng cuối trang">{navigation.map(([label, href]) => <Link href={href} key={`${label}-${href}`}>{label}</Link>)}</nav>
        <div className="footer-social" aria-label="Kênh liên hệ"><a href="https://www.facebook.com/profile.php?id=61581419480925" target="_blank" rel="noreferrer" aria-label="Facebook K-SPORT">f</a><a href="mailto:lienhe@k-sport.net" aria-label="Email K-SPORT"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M3 5h18v14H3zM4 6l8 7 8-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" /></svg></a><a href="/contact" aria-label="Liên hệ hỗ trợ">?</a></div>
      </div>
      <div className="footer-bottom"><span>© 2025 K-SPORT. Phần mềm quản lý giải đấu Karate Việt Nam. Tất cả quyền được bảo lưu.</span><nav aria-label="Điều khoản"><Link href="/privacy">Chính sách bảo mật</Link><Link href="/terms">Điều khoản sử dụng</Link><Link href="/contact">Liên hệ hỗ trợ</Link></nav><a className="back-to-top" href="#top" aria-label="Về đầu trang"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" /></svg></a></div>
    </footer>
  );
}
