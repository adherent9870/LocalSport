import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PlayersRedirectPage() {
  redirect("/dashboard/search-players");
}
