import { getViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getViewer();
  return Response.json({ viewer });
}
