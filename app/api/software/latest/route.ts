import { NextResponse } from "next/server";
import { SOFTWARE_RELEASE } from "@/lib/software-release";

export const revalidate = 300;

const GITHUB_REPO = process.env.GITHUB_RELEASE_REPO || "quan2003/Karate-Manager";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "K-SPORT-Web",
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(SOFTWARE_RELEASE);
    }

    const data = await res.json();
    return NextResponse.json({
      version: data.tag_name ? data.tag_name.replace(/^v/, "") : SOFTWARE_RELEASE.version,
      tag: data.tag_name || SOFTWARE_RELEASE.tag,
      releaseDate: data.published_at
        ? new Date(data.published_at).toLocaleDateString("vi-VN")
        : SOFTWARE_RELEASE.releaseDate,
      downloadWindows: "/api/download?os=windows",
      downloadMac: "/api/download?os=mac",
      downloadLinux: "/api/download?os=linux",
      platforms: SOFTWARE_RELEASE.platforms,
    });
  } catch {
    return NextResponse.json(SOFTWARE_RELEASE);
  }
}
