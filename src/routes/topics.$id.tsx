import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { topics, papers, topicTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/topics/$id")({
  loader: ({ params }) => {
    const topic = topics.find((t) => t.id === params.id);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.topic.name} — Scigraph` },
          { name: "description", content: loaderData.topic.description },
        ]
      : [{ title: "Topic — Scigraph" }],
  }),
  component: TopicDetail,
  notFoundComponent: () => <AppShell><div className="p-12 text-center text-muted-foreground">Topic not found.</div></AppShell>,
  errorComponent: () => <AppShell><div className="p-12 text-center text-muted-foreground">Failed to load topic.</div></AppShell>,
});

function TopicDetail() {
  const { topic } = Route.useLoaderData();
  const related = papers.filter((p) => p.domain === topic.domain).slice(0, 5);
  const trend = topicTrend(topic.growth / 4);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <Link to="/topics" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-3.5" /> Trend explorer
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">{topic.domain}</div>
            <h1 className="font-serif text-4xl mb-2">{topic.name}</h1>
            <p className="text-muted-foreground max-w-2xl italic">{topic.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Growth</div>
              <div className="inline-flex items-center gap-1 text-trend-up font-serif text-3xl">
                <TrendingUp className="size-5" /> +{topic.growth}%
              </div>
            </div>
            <button className={`px-4 py-2 text-sm font-medium rounded-lg border ${topic.followed ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
              {topic.followed ? "Following" : "Follow topic"}
            </button>
          </div>
        </div>

        <section className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Publication Momentum</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="tgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--indigo)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--indigo)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke="var(--indigo)" fill="url(#tgrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Related Papers</h2>
        <div className="space-y-3">
          {related.map((p) => (
            <Link key={p.id} to="/papers/$id" params={{ id: p.id }} className="block bg-surface border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <h3 className="font-semibold text-base mb-1 hover:text-brand">{p.title}</h3>
              <div className="text-xs text-muted-foreground">{p.authors.join(", ")} · {p.journalName} · {p.year}</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
