import { NextRequest, NextResponse } from "next/server";

// Private server-side upstream repository
const GITHUB_REPO = process.env.GITHUB_RELEASE_REPO || "quan2003/Karate-Manager";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function unavailable(request: NextRequest, os: string) {
  const url = new URL("/software", request.url);
  url.searchParams.set("download", "unavailable");
  url.searchParams.set("os", os);
  return NextResponse.redirect(url, 303);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const os = (searchParams.get("os") || "windows").toLowerCase();
  if (!["windows", "mac", "linux"].includes(os)) return unavailable(request, "windows");

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
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
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
        // Proxy the binary through our own endpoint. Do not redirect the browser
        // to GitHub: redirects expose the repository/release URL to the user.
        const assetHeaders: Record<string, string> = {
          Accept: "application/octet-stream",
          "User-Agent": "K-SPORT-Download-Gateway",
        };
        if (GITHUB_TOKEN) {
          assetHeaders.Authorization = `Bearer ${GITHUB_TOKEN}`;
        }

        const assetRes = await fetch(chosenAsset.url, {
          headers: assetHeaders,
          cache: "no-store",
          signal: AbortSignal.timeout(120_000),
        });

        if (assetRes.ok && assetRes.body) {
          const contentType = assetRes.headers.get("content-type") || "application/octet-stream";
          const contentLength = assetRes.headers.get("content-length");
          const responseHeaders = new Headers({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${chosenAsset.name.replace(/["\\\r\n]/g, "_")}"`,
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          });
          if (contentLength) responseHeaders.set("Content-Length", contentLength);

          return new Response(assetRes.body, {
            status: 200,
            headers: responseHeaders,
          });
        }
      }
    }
  } catch {
    // If GitHub API is unreachable, fall through to fallback
  }

  return unavailable(request, os);
}
