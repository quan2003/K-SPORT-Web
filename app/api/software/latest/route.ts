import { NextResponse } from "next/server";
import { getSoftwareRelease } from "@/lib/software-release";

export const revalidate = 300;

export async function GET() {
  const release = await getSoftwareRelease();
  return NextResponse.json({
    version: release.version,
    tag: release.tag,
    releaseDate: release.releaseDate,
  });
}
