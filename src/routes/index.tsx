import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ArrowUpRight, Bookmark, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { papers, publicationTrend, topics, journals } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Scigraph" },
      { name: "description", content: "Overview of research trends, trending topics, and newly published papers." },
    ],
  }),
  component: Dashboard,
});

function StatCard({ label, value, hint, tone = "default" }: { label: string; value: string; hint?: string; tone?: "default" | "up" | "brand" }) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
      <div className="text-muted-foreground text-xs font-bold uppercase mb-1 tracking-wider">{label}</div>
      <div className={`text-3xl font-serif ${tone === "brand" ? "text-indigo" : ""}`}>{value}</div>
      {hint && (
        <div className={`text-xs font-medium mt-2 ${tone === "up" ? "text-trend-up" : "text-muted-foreground"}`}>
          {hint}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const recent = papers.slice(0, 3);
  const trendingTopics = [...topics].sort((a, b) => b.growth - a.growth).slice(0, 3);
  const followedJournals = journals.filter((j) => j.followed);

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Research Overview</h1>
          <p className="text-muted-foreground text-sm">Live signals from your indexed journals and topics.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Active Topics" value="1,284" hint="↑ 12% this month" tone="up" />
          <StatCard label="New Publications" value="42.9k" hint="Across connected APIs" />
          <StatCard label="Emerging Field" value="Neuro-Symbolic AI" hint="High momentum" tone="brand" />
          <StatCard label="Citations Tracked" value="2.1M" hint="Real-time sync" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Global Publication Trend</h2>
                <select className="text-xs bg-transparent font-medium text-muted-foreground cursor-pointer outline-none">
                  <option>Last 12 Months</option>
                  <option>Last 5 Years</option>
                </select>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={publicationTrend}>
                      <defs>
                        <linearGradient id="cs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="bio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--indigo)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--indigo)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                      <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="cs" name="Computer Science" stroke="var(--brand)" fill="url(#cs)" strokeWidth={2} />
                      <Area type="monotone" dataKey="bio" name="Biotechnology" stroke="var(--indigo)" fill="url(#bio)" strokeWidth={2} />
                      <Area type="monotone" dataKey="phys" name="Physics" stroke="var(--trend-up)" fill="transparent" strokeWidth={2} />
                      <Area type="monotone" dataKey="mat" name="Materials" stroke="var(--chart-4)" fill="transparent" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Critical Research Highlights</h2>
                <Link to="/papers" className="text-xs text-brand hover:underline">View library →</Link>
              </div>
              <div className="space-y-4">
                {recent.map((p) => (
                  <article key={p.id} className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">
                        {p.domain}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">DOI: {p.doi}</span>
                    </div>
                    <Link to="/papers/$id" params={{ id: p.id }} className="block">
                      <h3 className="text-lg font-semibold leading-snug mb-2 hover:text-brand transition-colors">
                        {p.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 italic">{p.abstract}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                        <span>{p.authors.join(", ")}</span>
                        <span>{p.year}</span>
                        <span>{p.citations.toLocaleString()} citations</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="size-8 border border-border rounded-lg grid place-items-center hover:bg-secondary transition-colors">
                          <Bookmark className="size-3.5" />
                        </button>
                        <Link
                          to="/papers/$id"
                          params={{ id: p.id }}
                          className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Trending Topics</h2>
              <div className="space-y-3">
                {trendingTopics.map((t) => (
                  <Link
                    key={t.id}
                    to="/topics/$id"
                    params={{ id: t.id }}
                    className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">Growth: +{t.growth}%</div>
                    </div>
                    <TrendingUp className="size-4 text-trend-up" />
                  </Link>
                ))}
              </div>
              <Link
                to="/topics"
                className="block w-full mt-4 py-2 text-xs font-bold text-muted-foreground border border-dashed border-border rounded-xl hover:border-foreground/40 transition-colors italic text-center"
              >
                Discover More Topics
              </Link>
            </section>

            <section className="bg-indigo rounded-2xl p-6 text-indigo-foreground">
              <h2 className="text-lg font-serif mb-2">Weekly Insight Report</h2>
              <p className="text-indigo-foreground/80 text-xs leading-relaxed mb-4">
                Academic output in <strong>Reinforcement Learning</strong> has shifted from gaming environments to physical robotics control systems this quarter.
              </p>
              <div className="space-y-2">
                <div className="h-1 bg-indigo-foreground/20 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-foreground w-3/4" />
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-80">
                  <span>Robotics share</span>
                  <span>75%</span>
                </div>
              </div>
              <button className="w-full mt-6 py-2 bg-indigo-foreground text-indigo text-xs font-bold rounded-lg hover:opacity-90">
                Download PDF Analysis
              </button>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Journal Activity</h2>
              <div className="space-y-3">
                {followedJournals.map((j) => (
                  <Link
                    key={j.id}
                    to="/journals/$id"
                    params={{ id: j.id }}
                    className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="size-10 rounded bg-secondary grid place-items-center font-serif text-lg">
                      {j.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{j.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {j.publisher} · IF {j.impactFactor}
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
