import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useDashboardSummary,
  usePublicationsByYear,
  useTopDomains,
  useTopJournals,
  useTopKeywords,
} from "@/hooks/use-dashboard";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"; // Assuming you have recharts installed
import { ArrowUpRight, Bookmark, BookmarkCheck, Loader2, TrendingUp } from "lucide-react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useBookmarks, useAddBookmark, useRemoveBookmark, useReportSummary, useGenerateReport } from "@/lib/queries";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { CustomDropdown } from "@/shared/ui/custom-dropdown";
import { MotionItem, MotionPage, MotionStack } from "@/shared/ui/motion";

export const Route = createFileRoute("/dashboard")({
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
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "up" | "brand";
}) {
  return (
    <MotionItem hover className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
      <div className="text-muted-foreground text-xs font-bold uppercase mb-1 tracking-wider">{label}</div>
      <div className={`text-3xl font-serif ${tone === "brand" ? "text-indigo" : ""}`}>{value}</div>
      {hint && (
        <div className={`text-xs font-medium mt-2 ${tone === "up" ? "text-trend-up" : "text-muted-foreground"}`}>
          {hint}
        </div>
      )}
    </MotionItem>
  );
}

// Define a type for the recent paper object to fix implicit 'any' error
type RecentPaper = {
  id?: string;
  domain?: string;
  doi?: string;
  title?: string;
  abstract?: string;
  authors?: string[];
  publicationYear?: number;
  citationCount?: number;
};

type TrendingTopic = {
  id?: string;
  topicName?: string;
  growth?: number;
};

type TopJournal = {
  id?: string;
  title?: string;
  papersCount?: number;
  impactFactor?: number;
};

function Dashboard() {
  const [trendRange, setTrendRange] = useState("12-months");

  // Data fetching hooks
  const { data: summary } = useDashboardSummary();
  const { data: publicationsByYear } = usePublicationsByYear({ range: trendRange });
  const { data: topKeywords } = useTopKeywords();
  const { data: topDomains } = useTopDomains();
  const { data: topJournals } = useTopJournals();

  // Derived data for charts and lists
  const recentPapers: RecentPaper[] = summary?.recentPapers ?? [];
  const journals: { label: string; value: number }[] = topJournals?.dataPoints ?? [];
  const publicationTrend = useMemo(() => publicationsByYear?.dataPoints ?? [], [publicationsByYear]);

  const { data: bookmarksData } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const savedIds = useMemo(
    () => new Set(bookmarksData?.items?.map((b) => b.researchPaperId).filter(Boolean) ?? []),
    [bookmarksData?.items],
  );

  const { data: report, isLoading: reportLoading } = useReportSummary();
  const generateReport = useGenerateReport();

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <MotionPage className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Research Overview</h1>
          <p className="text-muted-foreground text-sm">Live signals from your indexed journals and topics.</p>
        </div>

        <MotionStack className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Research Papers" value={summary?.totalPapers?.toLocaleString() ?? "0"} />
          <StatCard
            label="This Year"
            value={summary?.papersThisYear?.toLocaleString() ?? "0"}
            hint={`${summary?.papersThisYearChange ?? 0}% from last year`}
          />
          <StatCard label="Journals" value={summary?.totalJournals?.toLocaleString() ?? "0"} />
          <StatCard label="Topics Tracked" value={summary?.totalTopics?.toLocaleString() ?? "0"} />
        </MotionStack>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Global Publication Trend</h2>
                <CustomDropdown
                  value={trendRange}
                  onChange={setTrendRange}
                  options={[
                    { label: "Last 12 Months", value: "12-months" },
                    { label: "Last 5 Years", value: "5-years" },
                  ]}
                  triggerClassName="h-9 w-40 border-transparent bg-transparent text-xs font-medium text-muted-foreground shadow-none"
                />
              </div>
              <MotionItem className="bg-surface border border-border rounded-2xl p-6">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={publicationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
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
                      {Object.keys(publicationTrend[0] ?? {}).map(
                        (key) =>
                          key !== "label" && <Area key={key} type="monotone" dataKey={key} name={key} strokeWidth={2} />,
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </MotionItem>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-serif font-semibold">Critical Research Highlights</h2>
                <Link to="/papers" search={{ q: "" }} className="text-xs text-brand hover:underline">
                  View library →
                </Link>
              </div>
              <MotionStack className="space-y-4">
                {recentPapers.map((p) => (
                  <MotionItem
                    key={p.id}
                    hover
                    className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">
                        {p.domain}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{p.doi ? `DOI: ${p.doi}` : ""}</span>
                    </div>
                    <Link to="/papers/$id" params={{ id: p.id ?? "" }} className="block">
                      <h3 className="text-lg font-semibold leading-snug mb-2 hover:text-brand transition-colors">
                        {p.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 italic">{p.abstract}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                        <span>{p.authors?.join(", ")}</span>
                        <span>{p.publicationYear}</span>
                        <span>{p.citationCount?.toLocaleString()} citations</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (p.id && savedIds.has(p.id)) {
                              const bId = bookmarksData?.items?.find((b) => b.researchPaperId === p.id)?.id;
                              removeBookmark.mutate({ paperId: p.id, bookmarkId: bId });
                            } else if (p.id) {
                              addBookmark.mutate({ paperId: p.id, title: p.title });
                            }
                          }}
                          disabled={addBookmark.isPending || removeBookmark.isPending}
                          className={`size-8 border border-border rounded-lg grid place-items-center transition-colors disabled:opacity-50 ${
                            p.id && savedIds.has(p.id) ? "bg-secondary text-brand" : "hover:bg-secondary"
                          }`}
                        >
                          {p.id && savedIds.has(p.id) ? (
                            <BookmarkCheck className="size-3.5" />
                          ) : (
                            <Bookmark className="size-3.5" />
                          )}
                        </button>
                        <Link
                          to="/papers/$id"
                          params={{ id: p.id ?? "" }}
                          className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  </MotionItem>
                ))}
              </MotionStack>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <section className="bg-indigo rounded-2xl p-6 text-indigo-foreground relative">
              {reportLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo/50 rounded-2xl z-10 backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-indigo-foreground" />
                </div>
              ) : null}
              <h2 className="text-lg font-serif mb-2">{report?.title || "Weekly Insight Report"}</h2>
              <p className="text-indigo-foreground/80 text-xs leading-relaxed mb-4 line-clamp-3">
                {report?.description ||
                  "Academic output in Reinforcement Learning has shifted from gaming environments to physical robotics control systems this quarter."}
              </p>
              <div className="space-y-2">
                <div className="h-1 bg-indigo-foreground/20 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-foreground" style={{ width: report ? "100%" : "75%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono opacity-80">
                  <span>Tracked papers</span>
                  <span>{report?.totalPapersCount?.toLocaleString() || "15,420"}</span>
                </div>
              </div>
              <button
                onClick={() => generateReport.mutate()}
                disabled={generateReport.isPending}
                className="w-full mt-6 py-2 flex items-center justify-center gap-2 bg-indigo-foreground text-indigo text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {generateReport.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {generateReport.isPending ? "Generating..." : "Download PDF Analysis"}
              </button>
            </section>

            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Journal Activity</h2>
              <div className="space-y-3">
                {journals.map((j, index) => (
                  <Link
                    key={`${j.label}-${index}`}
                    to="/papers"
                    search={{ q: `"${j.label}"` }}
                    className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="size-10 rounded bg-secondary grid place-items-center font-serif text-lg">
                      {j.label?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{j.label}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {j.value.toLocaleString()} papers
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </MotionPage>
    </MainLayout>
  );
}
