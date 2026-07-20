import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, BookOpen, Library, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService, paperService, topicService } from "@/api/services";
import { domainLabel } from "@/api/types";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Research overview — Scigraph" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [summary, chart, papers, trending] = useQueries({
    queries: [
      { queryKey: ["dashboard", "summary"], queryFn: dashboardService.summary },
      { queryKey: ["dashboard", "publications"], queryFn: dashboardService.publicationsByYear },
      { queryKey: ["papers", "recent"], queryFn: () => paperService.list({ pageSize: 5 }) },
      { queryKey: ["topics", "trending"], queryFn: () => topicService.trending(5) },
    ],
  });

  const loading = summary.isLoading || chart.isLoading || papers.isLoading || trending.isLoading;
  const error = summary.error || chart.error || papers.error || trending.error;
  const chartData = chart.data?.dataPoints?.length
    ? chart.data.dataPoints
    : (chart.data?.labels.map((label, index) => ({
        label,
        value: chart.data?.values[index] ?? 0,
      })) ?? []);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-5 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl">Research Overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live publication signals from the scientific journal API.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/papers">
              Explore papers <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Cannot reach the research API</AlertTitle>
            <AlertDescription>
              {error.message}. Check that the .NET API is running and VITE_API_BASE_URL is correct.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : (
            <>
              <Metric
                icon={BookOpen}
                label="Total papers"
                value={summary.data?.totalPapers ?? 0}
                hint={`${summary.data?.papersThisYear ?? 0} published this year`}
              />
              <Metric
                icon={Library}
                label="Journals"
                value={summary.data?.totalJournals ?? 0}
                hint="Indexed sources"
              />
              <Metric
                icon={Users}
                label="Authors"
                value={summary.data?.totalAuthors ?? 0}
                hint={`${summary.data?.averageCitations.toFixed(1) ?? 0} average citations`}
              />
              <Metric
                icon={Sparkles}
                label="Research topics"
                value={summary.data?.totalResearchTopics ?? 0}
                hint={`Top: ${domainLabel(summary.data?.topDomain ?? "—")}`}
              />
            </>
          )}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Publications by year</CardTitle>
            </CardHeader>
            <CardContent>
              {chart.isLoading ? (
                <Skeleton className="h-72" />
              ) : chartData.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="publication-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--brand)"
                        fill="url(#publication-fill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty text="No publication chart data yet." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Trending now</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {trending.isLoading ? (
                Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14" />)
              ) : trending.data?.items.length ? (
                trending.data.items.map((item) => (
                  <div
                    key={`${item.type}-${item.name}`}
                    className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.totalPapers.toLocaleString()} papers
                      </p>
                    </div>
                    <span className="font-mono text-xs text-trend-up">
                      {item.growthRate >= 0 ? "+" : ""}
                      {item.growthRate.toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <Empty text="No trending topics yet." />
              )}
            </CardContent>
          </Card>
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Latest research</h2>
            <Link to="/papers" className="text-sm font-medium text-brand hover:underline">
              View library
            </Link>
          </div>
          {papers.isLoading ? (
            Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : papers.data?.items.length ? (
            papers.data.items.slice(0, 4).map((paper) => (
              <Card key={paper.id} className="shadow-sm transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                    <span>{domainLabel(paper.domain)}</span>
                    <span>
                      {paper.publicationYear} · {paper.citationCount.toLocaleString()} citations
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-snug">
                    <Link to="/papers/$id" params={{ id: paper.id }} className="hover:text-brand">
                      {paper.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm italic text-muted-foreground">
                    {paper.abstract || "No abstract available."}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Empty text="No research papers have been indexed yet." />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <CardTitle className="mt-2 font-serif text-3xl">{value.toLocaleString()}</CardTitle>
        </div>
        <div className="grid size-10 place-items-center rounded-lg bg-secondary text-brand">
          <Icon />
        </div>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-muted-foreground">{text}</div>;
}
