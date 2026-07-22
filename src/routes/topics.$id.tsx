import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  ChevronRight,
  DatabaseZap,
  ExternalLink,
  FileText,
  Layers3,
  Loader2,
  Quote,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MainLayout } from "@/app/layouts/main-layout";
import { useResearchPapers, useResearchTopic, type ResearchPaperDto } from "@/features/research/api/research-api";
import { useAddBookmark, useBookmarks, useRemoveBookmark } from "@/lib/queries";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { formatDomain } from "@/shared/lib/format-domain";
import { DateDisplay } from "@/shared/ui/custom-date";

export const Route = createFileRoute("/topics/$id")({
  head: () => ({ meta: [{ title: "Topic - Scigraph" }] }),
  component: TopicDetail,
});

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function TopicDetail() {
  const { id } = Route.useParams();
  const { data: topic, isLoading, isError, error } = useResearchTopic(id);
  const {
    data: papersPage,
    isLoading: isPapersLoading,
    isError: isPapersError,
  } = useResearchPapers({
    topicName: topic?.name ?? undefined,
    pageNumber: 1,
    pageSize: 8,
    enabled: Boolean(topic?.name),
  });

  const papers = papersPage?.items ?? [];
  const stats = useMemo(() => buildTopicStats(papers, topic?.papersCount ?? papersPage?.totalCount ?? 0), [papers, papersPage?.totalCount, topic?.papersCount]);
  const yearBars = useMemo(() => buildYearBars(papers), [papers]);
  const keywordChips = useMemo(() => buildKeywordChips(papers), [papers]);
  const sourceChips = useMemo(() => buildSourceChips(papers), [papers]);

  const { data: bookmarksData } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const savedIds = useMemo(
    () => new Set(bookmarksData?.items?.map((b) => b.researchPaperId).filter(Boolean) ?? []),
    [bookmarksData?.items],
  );

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Link
            to="/topics"
            className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> Trend explorer
          </Link>
        </motion.div>

        {isLoading ? (
          <LoadingState label="Loading topic..." />
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-destructive">
            Failed to load topic: {(error as Error).message}
          </div>
        ) : !topic ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-muted-foreground">Topic not found.</div>
        ) : (
          <motion.div initial="initial" animate="animate" variants={stagger}>
            {/* ──── Hero Section ──── */}
            <motion.section
              variants={fadeUp}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-brand/[0.04] p-6 shadow-sm lg:p-10"
            >
              {/* Background decorations */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-brand/8 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-10 left-1/4 h-56 w-56 rounded-full bg-indigo/6 blur-[60px]" />
              <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-emerald-400/6 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
                      <Sparkles className="size-3 text-brand" />
                      {formatDomain(topic.domain)}
                    </span>
                    <span className="rounded-full bg-brand/12 px-3 py-1.5 text-xs font-semibold text-brand">
                      Live topic profile
                    </span>
                  </div>
                  <h1 className="max-w-4xl text-balance font-serif text-5xl leading-[0.95] lg:text-6xl">{topic.name}</h1>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
                    {topic.description ||
                      `Track publication activity, related papers, journals, citations, and discovery signals around ${topic.name}.`}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/papers"
                      search={{ q: topic.name ?? "" }}
                      className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90"
                    >
                      Browse papers
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                {/* Stat cards grid */}
                <motion.div
                  className="grid grid-cols-2 gap-3"
                  initial="initial"
                  animate="animate"
                  variants={{ animate: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
                >
                  <StatCard icon={FileText} label="Indexed papers" value={stats.totalPapers.toLocaleString()} accent="brand" />
                  <StatCard icon={Quote} label="Citations" value={stats.totalCitations.toLocaleString()} accent="indigo" />
                  <StatCard icon={BookOpen} label="Journals" value={stats.journals.toLocaleString()} accent="emerald" />
                  <StatCard icon={CalendarDays} label="Latest year" value={stats.latestYear ? String(stats.latestYear) : "N/A"} accent="amber" />
                </motion.div>
              </div>
            </motion.section>

            {/* ──── Main content grid ──── */}
            <motion.section variants={fadeUp} transition={{ duration: 0.35 }} className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
              {/* Papers list */}
              <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      <FileText className="size-3.5 text-brand" />
                      Related papers
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Papers linked to <span className="font-medium text-foreground">{topic.name}</span>
                    </p>
                  </div>
                  <Link
                    to="/papers"
                    search={{ q: topic.name ?? "" }}
                    className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold transition hover:bg-secondary sm:inline-flex"
                  >
                    View all
                    <ChevronRight className="size-3" />
                  </Link>
                </div>

                {isPapersLoading ? (
                  <LoadingState label="Loading related papers..." compact />
                ) : isPapersError ? (
                  <div className="rounded-2xl border border-border bg-background/60 p-6 text-sm text-destructive">
                    Could not load related papers.
                  </div>
                ) : papers.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-background/40 p-10 text-center">
                    <FileText className="mb-3 size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">No papers are linked to this topic yet.</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Papers will appear here once the sync job runs.</p>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-3"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
                  >
                    {papers.map((paper) => {
                      const paperId = paper.id ?? "";
                      const isSaved = savedIds.has(paperId);
                      const bookmarkId = bookmarksData?.items?.find((b) => b.researchPaperId === paperId)?.id;

                      return (
                        <PaperCard
                          key={paperId || paper.title}
                          paper={paper}
                          isSaved={isSaved}
                          onToggleBookmark={() => {
                            if (isSaved) {
                              removeBookmark.mutate({ paperId, bookmarkId });
                            } else {
                              addBookmark.mutate({ paperId, title: paper.title ?? undefined });
                            }
                          }}
                          bookmarkLoading={addBookmark.isPending || removeBookmark.isPending}
                        />
                      );
                    })}
                  </motion.div>
                )}

                {papers.length > 0 && (
                  <motion.div variants={fadeUp} className="mt-5 text-center">
                    <Link
                      to="/papers"
                      search={{ q: topic.name ?? "" }}
                      className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-brand/40 hover:bg-secondary hover:text-foreground"
                    >
                      <TrendingUp className="size-3.5" />
                      See all papers for this topic
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-5">
                {/* Publication momentum */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-brand/10">
                      <TrendingUp className="size-3.5 text-brand" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Publication momentum</h2>
                  </div>
                  {yearBars.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No yearly publication data available yet.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {yearBars.map((bar, index) => (
                        <motion.div
                          key={bar.year}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                        >
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="font-mono font-medium text-muted-foreground">{bar.year}</span>
                            <span className="font-semibold tabular-nums">{bar.count} {bar.count === 1 ? "paper" : "papers"}</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-brand to-brand/70"
                              initial={{ width: 0 }}
                              animate={{ width: `${bar.percent}%` }}
                              transition={{ delay: 0.15 + index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Signals found */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-indigo/10">
                      <Layers3 className="size-3.5 text-indigo" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Signals found</h2>
                  </div>
                  <div className="space-y-5">
                    <ChipGroup label="Keywords" values={keywordChips} empty="No keywords returned yet." />
                    <ChipGroup label="Sources" values={sourceChips} empty="No API source data yet." />
                  </div>
                </motion.div>

                {/* Topic metadata */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="mb-5 flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-emerald-500/10">
                      <DatabaseZap className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Topic metadata</h2>
                  </div>
                  <dl className="grid gap-3 text-sm">
                    <MetricRow label="Domain" value={formatDomain(topic.domain)} />
                    <MetricRow label="Created" value={<DateDisplay value={topic.createdAt} />} />
                    <MetricRow label="Updated" value={<DateDisplay value={topic.updatedAt} />} />
                    <MetricRow label="Total papers" value={String(topic.papersCount ?? 0)} />
                  </dl>
                </motion.div>
              </aside>
            </motion.section>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}

/* ──── Sub-components ──── */

function LoadingState({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface flex items-center justify-center gap-2 text-sm text-muted-foreground ${compact ? "p-6" : "p-10"}`}>
      <Loader2 className="size-4 animate-spin text-brand" />
      {label}
    </div>
  );
}

const accentColors = {
  brand: "text-brand bg-brand/10",
  indigo: "text-indigo bg-indigo/10",
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "brand",
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  accent?: keyof typeof accentColors;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.16 } }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-background/70 p-4 backdrop-blur-sm transition-colors hover:border-brand/30"
    >
      <div className={`mb-3.5 grid size-9 place-items-center rounded-xl ${accentColors[accent]}`}>
        <Icon className="size-4" />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl tabular-nums">{value}</div>
    </motion.div>
  );
}

function PaperCard({
  paper,
  isSaved,
  onToggleBookmark,
  bookmarkLoading,
}: {
  paper: ResearchPaperDto;
  isSaved: boolean;
  onToggleBookmark: () => void;
  bookmarkLoading: boolean;
}) {
  const authors = paper.authors?.map((a) => a.fullName).filter(Boolean).slice(0, 3).join(", ");
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      variants={fadeUp}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative rounded-2xl border border-border bg-background/55 p-5 transition-all hover:border-brand/30 hover:bg-background/80 hover:shadow-md hover:shadow-brand/[0.03]"
    >
      {/* Top metadata row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {paper.publicationYear ? (
          <span className="rounded bg-secondary px-2 py-0.5">{paper.publicationYear}</span>
        ) : null}
        {paper.apiSource ? (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand">{paper.apiSource}</span>
        ) : null}
        {paper.journal?.title ? (
          <span className="truncate text-[10px] font-medium normal-case tracking-normal">{paper.journal.title}</span>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="pr-10 text-base font-semibold leading-snug">
        {paper.id ? (
          <Link to="/papers/$id" params={{ id: paper.id }} className="transition hover:text-brand">
            {paper.title || "Untitled paper"}
          </Link>
        ) : (
          paper.title || "Untitled paper"
        )}
      </h3>

      {/* Abstract */}
      {paper.abstract ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{paper.abstract}</p>
      ) : null}

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{authors || "Unknown authors"}</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
            <Quote className="size-3 text-brand" />
            {(paper.citationCount ?? 0).toLocaleString()}
          </span>
          <AnimatePresence>
            {(hovered || isSaved) && paper.id && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={onToggleBookmark}
                disabled={bookmarkLoading}
                className={`grid size-8 place-items-center rounded-lg border border-border transition-colors disabled:opacity-50 ${isSaved ? "bg-brand/10 text-brand border-brand/30" : "hover:bg-secondary"}`}
                title={isSaved ? "Remove bookmark" : "Bookmark paper"}
              >
                {isSaved ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
              </motion.button>
            )}
          </AnimatePresence>
          {paper.id && (
            <Link
              to="/papers/$id"
              params={{ id: paper.id }}
              className="grid size-8 place-items-center rounded-lg border border-border transition-colors hover:bg-secondary"
              title="View paper"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* DOI */}
      {paper.doi ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
          DOI: {paper.doi}
        </div>
      ) : null}
    </motion.article>
  );
}

function MetricRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 px-4 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono text-sm">{value}</dd>
    </div>
  );
}

function ChipGroup({ label, values, empty }: { label: string; values: string[]; empty: string }) {
  return (
    <div>
      <div className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      {values.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold transition-colors hover:border-brand/30 hover:bg-brand/5"
            >
              {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──── Data helpers ──── */

function buildTopicStats(papers: ResearchPaperDto[], fallbackPapers: number) {
  const totalCitations = papers.reduce((sum, paper) => sum + (paper.citationCount ?? 0), 0);
  const journals = new Set(papers.map((paper) => paper.journal?.title).filter(Boolean)).size;
  const latestYear = papers.reduce<number | undefined>((latest, paper) => {
    if (!paper.publicationYear) return latest;
    return latest ? Math.max(latest, paper.publicationYear) : paper.publicationYear;
  }, undefined);

  return {
    totalPapers: fallbackPapers || papers.length,
    totalCitations,
    journals,
    latestYear,
  };
}

function buildYearBars(papers: ResearchPaperDto[]) {
  const counts = papers.reduce<Record<number, number>>((acc, paper) => {
    if (!paper.publicationYear) return acc;
    acc[paper.publicationYear] = (acc[paper.publicationYear] ?? 0) + 1;
    return acc;
  }, {});
  const max = Math.max(1, ...Object.values(counts));

  return Object.entries(counts)
    .map(([year, count]) => ({
      year,
      count,
      percent: Math.max(12, Math.round((count / max) * 100)),
    }))
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, 6);
}

function buildKeywordChips(papers: ResearchPaperDto[]) {
  const counts = new Map<string, number>();
  papers.forEach((paper) => {
    paper.keywords?.forEach((keyword) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword);
}

function buildSourceChips(papers: ResearchPaperDto[]) {
  return [...new Set(papers.map((paper) => paper.apiSource).filter(Boolean) as string[])].slice(0, 8);
}
