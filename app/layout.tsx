import type { Metadata, Viewport } from "next";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://k-sport.net"),
  title: { default: "K-SPORT | Cổng thông tin Karate Việt Nam", template: "%s | K-SPORT" },
  description: "Cổng thông tin giải đấu Karate và phần mềm quản lý, điều hành giải K-SPORT.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "K-SPORT",
    url: "https://k-sport.net",
    title: "K-SPORT | Cổng thông tin Karate Việt Nam",
    description: "Cổng thông tin giải đấu Karate và phần mềm quản lý, điều hành giải K-SPORT.",
  },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body id="top">
        <a className="skip-link" href="#main-content">Chuyển đến nội dung chính</a>
        {children}
      </body>
    </html>
  );
}
