import { redirect } from "next/navigation";

export default async function PassRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/athletes/${encodeURIComponent(id)}`);
}

