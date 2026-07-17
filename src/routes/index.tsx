import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
import { ArrowUpRight, Bookmark, TrendingUp, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useDashboardSummary, usePublicationsByYear } from "@/hooks/use-dashboard";
import { usePapers } from "@/hooks/use-papers";
import { useTopics } from "@/hooks/use-topics";

export const Route = createFileRoute("/")({
  // FIX: guard lives here, so the redirect to "/auth" is always valid.
  // "/dashboard" did not exist as a registered route — that was the TS error.
  beforeLoad: () => {
    const token =
      typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;
    if (!token) {
      throw redirect({ to: "/auth" });
    }
  },
  head: () => ({
    meta: [
      { title: "Dashboard — Scigraph" },
      { name: "description", content: "Overview of research trends, trending topics, and newly published papers." },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  hint,
  tone = "default",
  loading = false,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "up" | "brand";
  loading?: boolean;
}) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
      <div className="text-muted-foreground text-xs font-bold uppercase mb-1 tracking-wider">{label}</div>
      {loading ? (
        <Loader2 className="size-6 animate-spin text-muted-foreground mt-1" />
      ) : (
        <div className={`text-3xl font-serif ${tone === "brand" ? "text-indigo" : ""}`}>{value}</div>
      )}
      {hint && (
        <div className={`text-xs font-medium mt-2 ${tone === "up" ? "text-trend-up" : "text-muted-foreground"}`}>
          {hint}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: trendData, isLoading: trendLoading } = usePublicationsByYear();
  const { data: papersData, isLoading: papersLoading } = usePapers({ pageNumber: 1, pageSize: 3 });
  const { data: topicsData, isLoading: topicsLoading } = useTopics();

  const recent = papersData?.items ?? [];
  const trendingTopics = [...(topicsData ?? [])]
    .sort((a, b) => b.papersCount - a.papersCount)
    .slice(0, 3);

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Research Overview</h1>
          <p className="text-muted-foreground text-sm">Live signals from your indexed journals and topics.</p>
        </div>

        {/* Stat cards — wired to GET /dashboard/summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Active Topics"
            value={summary?.totalTopics?.toLocaleString() ?? "—"}
            hint="Total research topics"
            loading={summaryLoading}
          />
          <StatCard
            label="Total Papers"
            value={summary?.totalPapers?.toLocaleString() ?? "—"}
            hint="Imported from external APIs"
            loading={summaryLoading}
          />
          <StatCard
            label="Total Authors"
            value={summary?.totalAuthors?.toLocaleString() ?? "—"}
            loading={summaryLoading}
          />
          <StatCard
            label="Citations Tracked"
            value={summary?.totalCitations?.toLocaleString() ?? "—"}
            hint="Across all papers"
            loading={summaryLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">

            {/* Chart — wired to GET /dashboard/publications-by-year */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Global Publication Trend</h2>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="w-full h-72">
                  {trendLoading ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData ?? []}>
                        <defs>
                          <linearGradient id="cs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Publications"
                          stroke="var(--brand)"
                          fill="url(#cs)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>

            {/* Recent papers — wired to GET /research-papers/all */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Recent Research Papers</h2>
                <Link to="/papers" className="text-xs text-brand hover:underline">
                  View library →
                </Link>
              </div>
              <div className="space-y-4">
                {papersLoading && (
                  <div className="flex justify-center py-8 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                )}
                {recent.map((p) => (
                  <article
                    key={p.id}
                    className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">
                        {p.domain}
                      </span>
                      {p.doi && (
                        <span className="text-xs font-mono text-muted-foreground">DOI: {p.doi}</span>
                      )}
                    </div>
                    <Link to="/papers/$id" params={{ id: p.id }} className="block">
                      <h3 className="text-lg font-semibold leading-snug mb-2 hover:text-brand transition-colors">
                        {p.title}
                      </h3>
                    </Link>
                    {p.abstract && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 italic">{p.abstract}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                        <span>{p.authors.map((a) => a.fullName).join(", ")}</span>
                        <span>{p.publicationYear}</span>
                        <span>{p.citationCount.toLocaleString()} citations</span>
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

          {/* Right column — wired to GET /research-topics */}
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Top Topics by Papers
              </h2>
              <div className="space-y-3">
                {topicsLoading && (
                  <div className="flex justify-center py-4 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}
                {trendingTopics.map((t) => (
                  <Link
                    key={t.id}
                    to="/topics/$id"
                    params={{ id: t.id }}
                    className="flex items-center justify-between p-3 bg-surface border border-border rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">
                        {t.papersCount} papers
                      </div>
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}