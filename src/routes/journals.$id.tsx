import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { journals, papers, topicTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/journals/$id")({
  loader: ({ params }) => {
    const journal = journals.find((j) => j.id === params.id);
    if (!journal) throw notFound();
    return { journal };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.journal.name} — Scigraph` },
          { name: "description", content: `Papers, activity and trend for ${loaderData.journal.name}.` },
        ]
      : [{ title: "Journal — Scigraph" }],
  }),
  component: JournalDetail,
  notFoundComponent: () => <AppShell><div className="p-12 text-center text-muted-foreground">Journal not found.</div></AppShell>,
  errorComponent: () => <AppShell><div className="p-12 text-center text-muted-foreground">Failed to load journal.</div></AppShell>,
});

function JournalDetail() {
  const { journal } = Route.useLoaderData();
  const journalPapers = papers.filter((p) => p.journalId === journal.id);
  const trend = topicTrend(30);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <Link to="/journals" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-3.5" /> All journals
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">{journal.publisher}</div>
            <h1 className="font-serif text-4xl mb-2">{journal.name}</h1>
            <div className="flex gap-4 text-sm text-muted-foreground font-mono">
              <span>Domain: {journal.domain}</span>
              <span>· Papers: {journal.papersCount.toLocaleString()}</span>
              <span>· IF: {journal.impactFactor}</span>
            </div>
          </div>
          <button className={`px-4 py-2 text-sm font-medium rounded-lg border ${journal.followed ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
            {journal.followed ? "Following" : "Follow journal"}
          </button>
        </div>

        <section className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Publication Cadence</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="var(--brand)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Recent Publications</h2>
        <div className="space-y-3">
          {journalPapers.length === 0 && <div className="text-muted-foreground text-sm">No papers indexed yet.</div>}
          {journalPapers.map((p) => (
            <Link key={p.id} to="/papers/$id" params={{ id: p.id }} className="block bg-surface border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <h3 className="font-semibold text-base mb-1 hover:text-brand">{p.title}</h3>
              <div className="text-xs text-muted-foreground">{p.authors.join(", ")} · {p.year} · {p.citations} citations</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
