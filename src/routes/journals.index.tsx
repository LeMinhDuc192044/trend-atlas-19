import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { journals } from "@/lib/mock-data";

export const Route = createFileRoute("/journals/")({
  head: () => ({
    meta: [
      { title: "Journal Tracker — Scigraph" },
      { name: "description", content: "Follow scientific journals and monitor publication activity." },
    ],
  }),
  component: JournalsList,
});

function JournalsList() {
  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Journal Tracker</h1>
          <p className="text-muted-foreground text-sm">Follow journals to receive updates when new issues are indexed.</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                <th className="px-6 py-3">Journal</th>
                <th className="px-6 py-3">Publisher</th>
                <th className="px-6 py-3">Domain</th>
                <th className="px-6 py-3 text-right">Papers</th>
                <th className="px-6 py-3 text-right">Impact factor</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {journals.map((j) => (
                <tr key={j.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to="/journals/$id" params={{ id: j.id }} className="font-semibold hover:text-brand">
                      {j.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{j.publisher}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">{j.domain}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono">{j.papersCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono">{j.impactFactor}</td>
                  <td className="px-6 py-4 text-right">
                    <button className={`px-3 py-1 text-xs font-medium rounded-lg border ${j.followed ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                      {j.followed ? "Following" : "Follow"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
