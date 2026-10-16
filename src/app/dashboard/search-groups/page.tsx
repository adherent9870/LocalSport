import { GroupForm } from "@/components/forms/group-form";
import { SearchGroupsNear } from "@/components/dashboard/search-groups-near";
import { getGroups } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardSearchGroupsPage() {
  const groups = await getGroups();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h1 className="text-2xl font-bold md:text-3xl">Search Groups</h1>
        <p className="mt-1 text-sm text-slate-600">
          Discover and create local sports groups based on area, sport, and proximity.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.25fr]">
        <GroupForm />
        <SearchGroupsNear groups={groups} />
      </section>

      <section className="rounded-3xl border border-white/15 bg-white/95 p-6 text-slate-900 shadow-2xl">
        <h2 className="text-lg font-semibold">All Groups ({groups.length})</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.length === 0 ? (
            <p className="text-sm text-slate-500">No groups created yet.</p>
          ) : (
            groups.map((group) => (
              <article key={group.id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{group.name}</p>
                <p className="text-xs text-slate-600">{group.sport} · {group.area}</p>
                <p className="mt-1 text-xs text-slate-700">{group.description || "No description"}</p>
                <p className="mt-1 text-xs text-slate-500">Created by: {group.createdByPlayerName}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
