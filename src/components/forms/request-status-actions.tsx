"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RequestStatusActions({ requestId, currentStatus }: { requestId: number; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "approved" | "rejected") {
    setLoading(true);
    try {
      const response = await fetch(`/api/join-requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Unable to update status");
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
        {currentStatus}
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={() => updateStatus("approved")}
        className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => updateStatus("rejected")}
        className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}
