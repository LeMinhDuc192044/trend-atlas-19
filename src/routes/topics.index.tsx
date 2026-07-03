import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { topics } from "@/lib/mock-data";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "Trend Explorer — Scigraph" },
      { name: "description", content: "Explore trending research topics and their publication momentum." },
    ],
  }),
  component: TopicsList,
});

function TopicsList() {
  const sorted = [...topics].sort((a, b) => b.growth - a.growth);
  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Trend Explorer</h1>
          <p className="text-muted-foreground text-sm">Research topics ranked by publication velocity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((t) => (
            <Link key={t.id} to="/topics/$id" params={{ id: t.id }} className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">{t.domain}</span>
                <span className="inline-flex items-center gap-1 text-trend-up text-xs font-mono font-bold">
                  <TrendingUp className="size-3.5" /> +{t.growth}%
                </span>
              </div>
              <h2 className="text-xl font-serif mb-2">{t.name}</h2>
              <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2">{t.description}</p>
              <div className="text-xs font-mono text-muted-foreground">{t.papersCount.toLocaleString()} papers indexed</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
