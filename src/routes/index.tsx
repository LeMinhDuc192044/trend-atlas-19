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
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  DatabaseZap,
  LibraryBig,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/features/theme/ui/theme-toggle";
import { Logo } from "@/shared/ui/logo";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scigraph - Scientific Publication Trend Tracking" },
      {
        name: "description",
        content:
          "Track publication trends, research topics, journals, citations, and academic momentum from one research analytics workspace.",
      },
    ],
  }),
  component: LandingPage,
});

const metrics = [
  { label: "Indexed papers", value: "42.9k" },
  { label: "Research topics", value: "1,284" },
  { label: "Citations tracked", value: "2.1M" },
] as const;

const modules = [
  {
    title: "Trend Explorer",
    text: "Analyze hot keywords, research topics, growth velocity, and publication momentum by year.",
    icon: TrendingUp,
  },
  {
    title: "Research Library",
    text: "Search papers by keyword, author, DOI, domain, journal, year, and full-text availability.",
    icon: LibraryBig,
  },
  {
    title: "Journal Tracker",
    text: "Follow journal activity, publication cadence, impact metrics, and newly indexed papers.",
    icon: BookOpen,
  },
  {
    title: "Role-Based Access",
    text: "Admin, Researcher, and User workflows are separated across data management, analysis, and reading.",
    icon: ShieldCheck,
  },
] as const;

const workflow = [
  {
    step: "01",
    title: "Search the research graph",
    text: "Find papers, journals, authors, DOI records, topics, and domains from one focused interface.",
    icon: Search,
  },
  {
    step: "02",
    title: "Compare publication signals",
    text: "Inspect growth velocity, citation movement, emerging keywords, and journal activity over time.",
    icon: ChartNoAxesCombined,
  },
  {
    step: "03",
    title: "Save and report",
    text: "Bookmark useful papers, track followed areas, and export concise reports for research decisions.",
    icon: BookOpen,
  },
] as const;

const roleWorkspaces = [
  {
    role: "Admins",
    title: "Govern the indexed data",
    text: "Manage users, external API sources, sync workflows, topics, journals, and operational visibility.",
    icon: DatabaseZap,
  },
  {
    role: "Researchers",
    title: "Analyze research momentum",
    text: "Explore trends, inspect papers, compare domains, and watch publication movement before it peaks.",
    icon: TrendingUp,
  },
  {
    role: "Readers",
    title: "Discover without friction",
    text: "Search, read, bookmark, and revisit important papers with a cleaner everyday research flow.",
    icon: LibraryBig,
  },
] as const;

const sources = ["Semantic Scholar", "OpenAlex", "Crossref", "IEEE", "arXiv", "PubMed"] as const;

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function LandingPage() {
  const { user } = useAuth();
  const primaryTo = user ? "/dashboard" : "/auth";
  const primaryLabel = user ? "Open dashboard" : "Sign in to start";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-[92vh] overflow-hidden bg-[#edf4fa] text-slate-950 dark:bg-background dark:text-foreground">
        <motion.img
          src="/landing-research-analytics.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-70 dark:opacity-60"
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#edf4fa] via-[#edf4fa]/92 to-[#edf4fa]/24 dark:from-background dark:via-background/88 dark:to-background/18" />
        <div className="absolute inset-0 bg-linear-to-b from-background/10 via-transparent to-background/95 dark:from-background/20 dark:to-background" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-brand/12 blur-3xl" />
        <div className="absolute bottom-10 right-12 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <motion.header
          className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Logo textClassName="text-xl font-bold tracking-tight" />
          <nav className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-full border border-border bg-surface/70 p-0.5 shadow-sm backdrop-blur">
              <ThemeToggle />
            </div>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
              >
                Open dashboard
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "signin" }}
                  className="hidden rounded-full border border-border bg-surface/70 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-secondary sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
                >
                  Sign up
                  <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </nav>
        </motion.header>

        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-96px)] w-full max-w-7xl items-center px-6 pb-16 pt-8 lg:px-8">
          <motion.div
            className="max-w-3xl"
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.08 }}
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.35 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur"
            >
              <ChartNoAxesCombined className="size-4 text-brand" />
              Scientific Journal Publication Trend Tracking System
            </motion.div>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl text-balance font-serif text-5xl leading-[1.02] md:text-7xl"
            >
              Track academic momentum before it becomes obvious.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-6 max-w-2xl text-base leading-7 text-slate-700 dark:text-muted-foreground md:text-lg"
            >
              Scigraph brings research papers, journals, citations, topics, bookmarks, and analytical reports
              into one workspace for Admins, Researchers, and everyday readers.
            </motion.p>
            <motion.div variants={fadeUp} transition={{ duration: 0.38 }} className="mt-8">
              <Link
                to={primaryTo}
                className="group inline-flex items-center gap-3 rounded-full border border-brand/30 bg-surface/82 py-2.5 pl-2.5 pr-5 text-sm font-semibold text-foreground shadow-xl shadow-brand/10 backdrop-blur transition hover:border-brand/60 hover:bg-secondary"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand text-brand-foreground transition group-hover:scale-105">
                  <ArrowRight className="size-4" />
                </span>
                <span className="text-left">
                  <span className="block leading-4">{primaryLabel}</span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                    {user ? "Return to your research workspace" : "Sign in or create an account"}
                  </span>
                </span>
              </Link>
            </motion.div>
            <motion.dl
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-6"
            >
              {metrics.map((metric) => (
                <motion.div
                  key={metric.label}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-border/70 bg-surface/60 px-4 py-3 shadow-sm backdrop-blur"
                >
                  <dt className="text-xs font-semibold text-muted-foreground">{metric.label}</dt>
                  <dd className="mt-1 font-serif text-3xl">{metric.value}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </motion.div>
        </div>
      </section>

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
      <section className="border-b border-border bg-secondary/25 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand">
              <ChartNoAxesCombined className="size-4" />
              Workflow
            </div>
            <h2 className="text-balance font-serif text-4xl leading-tight">
              Turn scattered publication data into a repeatable research signal.
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ staggerChildren: 0.08 }}
          >
            {workflow.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-muted-foreground">{item.step}</span>
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand/10 text-brand">
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

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
      <section className="border-b border-border bg-background px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div {...fadeUp} viewport={{ once: true, amount: 0.35 }} whileInView="animate" transition={{ duration: 0.35 }}>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand">
              <Search className="size-4" />
              Built for research discovery
            </div>
            <h2 className="max-w-xl text-balance font-serif text-4xl leading-tight">
              From search to trend reports, every role gets the right workspace.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Admins manage topics, imports, sync jobs, and data sources. Researchers inspect deeper citation
              signals and popular papers. Users search, read, bookmark, and export basic reports.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ staggerChildren: 0.06 }}
          >
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <motion.article
                  key={module.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-brand/30"
                >
                  <div className="mb-4 grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.35 }}
          >
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand">
                <ShieldCheck className="size-4" />
                Role-aware workspace
              </div>
              <h2 className="max-w-2xl text-balance font-serif text-4xl leading-tight">
                Different users see the tools that match their research responsibility.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              The interface separates administration, analysis, and everyday discovery so teams can work without
              stepping through irrelevant controls.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-4 lg:grid-cols-3"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ staggerChildren: 0.08 }}
          >
            {roleWorkspaces.map((role) => {
              const Icon = role.icon;
              return (
                <motion.article
                  key={role.role}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:border-brand/30"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {role.role}
                    </span>
                    <span className="grid size-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{role.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{role.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="bg-secondary/35 px-6 py-14 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-7xl flex-col gap-7 rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
                <DatabaseZap className="size-4" />
                Connected academic data sources
              </div>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Designed around external academic APIs with Admin-controlled sync workflows and source visibility.
              </p>
            </div>
            <Link
              to={primaryTo}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border pt-6">
            {sources.map((source) => (
              <span
                key={source}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground"
              >
                {source}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-background px-6 py-16 lg:px-8">
        <motion.div
          className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/10 md:p-10"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 text-sm font-semibold text-primary-foreground/65">Ready when your research is.</div>
              <h2 className="max-w-2xl text-balance font-serif text-4xl leading-tight">
                Start tracking the papers, journals, and topics that matter next.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {!user && (
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary-foreground/90"
                >
                  Create account
                  <ArrowRight className="size-4" />
                </Link>
              )}
              <Link
                to={primaryTo}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
              >
                {primaryLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
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
