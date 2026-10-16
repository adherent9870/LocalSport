import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RequestsRedirectPage() {
  redirect("/dashboard/requests");
}
