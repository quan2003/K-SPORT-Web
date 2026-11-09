/**
 * K-SPORT Official Software Release Information
 * Maintained internally for official K-SPORT tournament distribution.
 */

export const SOFTWARE_RELEASE = {
  version: "3.0.13",
  tag: "v3.0.13",
  releaseDate: "30/10/2026",
  downloadWindows: "/api/download?os=windows",
  downloadMac: "/api/download?os=mac",
  downloadLinux: "/api/download?os=linux",
  platforms: [
    {
      id: "windows",
      name: "Windows",
      fullName: "K-SPORT for Windows",
      badge: "Bản cài đặt tiêu chuẩn (Khuyên dùng)",
      fileType: "Setup .exe (64-bit)",
      size: "92 MB",
      osRequirement: "Windows 10 / 11 (64-bit)",
      desc: "Chạy máy chủ thảm đấu, xuất màn hình LED phụ chuẩn tỉ lệ 16:9, điều phối bốc thăm và xuất biên bản thi đấu.",
      downloadUrl: "/api/download?os=windows",
      recommended: true,
    },
    {
      id: "mac",
      name: "macOS",
      fullName: "K-SPORT for Mac",
      badge: "Apple Silicon & Intel",
      fileType: "Apple Disk Image (.dmg)",
      size: "122 MB",
      osRequirement: "macOS 12 Monterey trở lên (Chip M1–M4 & Intel)",
      desc: "Dành cho máy tính MacBook, iMac của ban tổ chức. Kéo thả vào Applications để sử dụng ngay.",
      downloadUrl: "/api/download?os=mac",
      recommended: false,
    },
    {
      id: "linux",
      name: "Linux",
      fullName: "K-SPORT for Linux",
      badge: "Ubuntu & Debian",
      fileType: "Linux AppImage (.AppImage)",
      size: "131 MB",
      osRequirement: "Ubuntu 20.04+, Debian, Fedora",
      desc: "Chạy trực tiếp dạng standalone không cần cài đặt. Phù hợp cho các hệ thống máy trạm Linux tại nhà thi đấu.",
      downloadUrl: "/api/download?os=linux",
      recommended: false,
    },
  ],
} as const;
