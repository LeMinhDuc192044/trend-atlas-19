import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Database } from "lucide-react";

export const Route = createFileRoute("/admin/data-sources")({
  head: () => ({
    meta: [
      { title: "Admin · Data Sources — Scigraph" },
      { name: "description", content: "Configure and monitor external academic API data sources." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DataSources,
});

const sources = [
  { id: "s1", name: "IEEE Xplore", endpoint: "api.ieee.org/v1", status: "Active", lastSync: "2m ago", records: "3.2M" },
  { id: "s2", name: "arXiv", endpoint: "export.arxiv.org/api", status: "Active", lastSync: "8m ago", records: "2.1M" },
  { id: "s3", name: "PubMed", endpoint: "eutils.ncbi.nlm.nih.gov", status: "Active", lastSync: "14m ago", records: "34M" },
  { id: "s4", name: "Semantic Scholar", endpoint: "api.semanticscholar.org", status: "Rate limited", lastSync: "1h ago", records: "112M" },
];

function DataSources() {
  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Administration</div>
            <h1 className="font-serif text-4xl">API Data Sources</h1>
            <p className="text-muted-foreground text-sm mt-1">Configure ingestion endpoints and monitor sync health.</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
            Add source
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((s) => (
            <div key={s.id} className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-secondary grid place-items-center">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{s.name}</h2>
                    <p className="text-xs font-mono text-muted-foreground">{s.endpoint}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${s.status === "Active" ? "bg-trend-up/10 text-trend-up" : "bg-destructive/10 text-destructive"}`}>
                  {s.status}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Last sync</dt>
                  <dd className="font-mono">{s.lastSync}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Records</dt>
                  <dd className="font-mono">{s.records}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary">Sync now</button>
                <button className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary">Configure</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
