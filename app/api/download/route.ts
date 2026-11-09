import { NextRequest, NextResponse } from "next/server";

// Private server-side upstream repository
const GITHUB_REPO = process.env.GITHUB_RELEASE_REPO || "quan2003/Karate-Manager";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Static reliable fallbacks
const FALLBACK_BINARIES: Record<string, string> = {
  windows: `https://github.com/${GITHUB_REPO}/releases/download/v3.0.13/K-SPORT-Setup-3.0.13.exe`,
  mac: `https://github.com/${GITHUB_REPO}/releases/download/v3.0.13/K-SPORT-3.0.13-arm64.dmg`,
  linux: `https://github.com/${GITHUB_REPO}/releases/download/v3.0.13/K-SPORT-3.0.13.AppImage`,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const os = (searchParams.get("os") || "windows").toLowerCase();

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "K-SPORT-Download-Gateway",
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers,
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const data = await res.json();
      const assets: Array<{ id: number; name: string; browser_download_url: string; url: string }> =
        data.assets || [];

      let chosenAsset: { id: number; name: string; browser_download_url: string; url: string } | undefined;

      if (os === "windows") {
        chosenAsset = assets.find((a) => a.name.toLowerCase().endsWith(".exe"));
      } else if (os === "mac") {
        chosenAsset = assets.find((a) => a.name.toLowerCase().endsWith(".dmg"));
      } else if (os === "linux") {
        chosenAsset = assets.find(
          (a) => a.name.toLowerCase().endsWith(".appimage") || a.name.toLowerCase().endsWith(".deb")
        );
      }

      if (chosenAsset) {
        // If GITHUB_TOKEN is configured (Private Repo mode), get the authenticated asset redirect
        if (GITHUB_TOKEN) {
          const assetRes = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/releases/assets/${chosenAsset.id}`,
            {
              headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/octet-stream",
                "User-Agent": "K-SPORT-Download-Gateway",
              },
              redirect: "manual",
            }
          );
          const location = assetRes.headers.get("location");
          if (location) {
            return NextResponse.redirect(location, 302);
          }
        }

        // Public repo redirect directly to asset
        return NextResponse.redirect(chosenAsset.browser_download_url, 302);
      }
    }
  } catch {
    // If GitHub API is unreachable, fall through to fallback
  }

  const fallback = FALLBACK_BINARIES[os] || FALLBACK_BINARIES.windows;
  return NextResponse.redirect(fallback, 302);
}
