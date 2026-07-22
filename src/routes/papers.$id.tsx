import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bookmarkService, paperService } from "@/api/services";
import { domainLabel } from "@/api/types";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/papers/$id")({ component: PaperDetail });
import { useMemo } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useResearchPaper } from "@/features/research/api/research-api";
import { useAddBookmark, useBookmarks, useRemoveBookmark } from "@/lib/queries";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { formatDomain } from "@/shared/lib/format-domain";

export const Route = createFileRoute("/papers/$id")({
  head: () => ({ meta: [{ title: "Paper - Scigraph" }] }),
  component: PaperDetail,
});

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function PaperDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const paper = useQuery({
    queryKey: ["paper", id],
    queryFn: () => paperService.detail(id),
    retry: false,
  });
  const bookmark = useMutation({
    mutationFn: () => bookmarkService.createPaper(id),
    onSuccess: () => toast.success("Paper saved"),
    onError: (error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5 md:p-8">
        <Button asChild variant="ghost" className="w-fit">
          <Link to="/papers">
            <ArrowLeft data-icon="inline-start" /> Back to library
          </Link>
        </Button>
        {paper.isLoading ? (
          <>
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-64" />
          </>
        ) : paper.error ? (
          <Alert variant="destructive">
            <AlertTitle>Paper unavailable</AlertTitle>
            <AlertDescription>
              {paper.error.message}. This detail endpoint requires an authenticated User,
              Researcher, or Admin account.
            </AlertDescription>
          </Alert>
        ) : paper.data ? (
          <>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-indigo">
                {domainLabel(paper.data.domain)}
              </p>
              <h1 className="text-balance font-serif text-4xl leading-tight">{paper.data.title}</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                {paper.data.authors.map((author) => author.fullName).join(", ") ||
                  "Unknown authors"}{" "}
                · {paper.data.journal?.title || "Unlisted journal"} · {paper.data.publicationYear} ·{" "}
                {paper.data.citationCount.toLocaleString()} citations
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {paper.data.url ? (
                <Button asChild>
                  <a href={paper.data.url} target="_blank" rel="noreferrer">
                    View source <ExternalLink data-icon="inline-end" />
                  </a>
                </Button>
              ) : null}
              <Button
                variant="outline"
                disabled={bookmark.isPending}
                onClick={() =>
                  user ? bookmark.mutate() : toast.error("Sign in to save bookmarks")
                }
              >
                <Bookmark data-icon="inline-start" /> Save paper
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Abstract</CardTitle>
              </CardHeader>
              <CardContent className="leading-relaxed text-foreground/90">
                {paper.data.abstract || "No abstract is available for this paper."}
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest">Keywords</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {paper.data.keywords.length ? (
                    paper.data.keywords.map((keyword) => (
                      <span key={keyword} className="rounded-md bg-secondary px-2 py-1 text-xs">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No keywords</span>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest">Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-2 text-sm">
                    <Row label="DOI" value={paper.data.doi || "—"} />
                    <Row label="Source" value={paper.data.apiSource} />
                    <Row label="Year" value={String(paper.data.publicationYear)} />
                    <Row label="Topics" value={paper.data.topics.join(", ") || "—"} />
                  </dl>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
  const { data: paper, isLoading, isError, error } = useResearchPaper(id);

  const { data: bookmarksData } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const isSaved = useMemo(
    () => bookmarksData?.items?.some((b) => b.researchPaperId === id) ?? false,
    [bookmarksData?.items, id],
  );
  const bookmarkId = useMemo(
    () => bookmarksData?.items?.find((b) => b.researchPaperId === id)?.id,
    [bookmarksData?.items, id],
  );

  const toggleBookmark = () => {
    if (isSaved) {
      removeBookmark.mutate({ paperId: id, bookmarkId });
    } else {
      addBookmark.mutate({ paperId: id, title: paper?.title ?? undefined });
    }
  };

  const bookmarkLoading = addBookmark.isPending || removeBookmark.isPending;

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Link
            to="/papers"
            search={{ q: "" }}
            className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to library
          </Link>
        </motion.div>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : !paper ? (
          <EmptyState />
        ) : (
          <motion.div initial="initial" animate="animate" variants={stagger}>
            {/* ──── Hero Card ──── */}
            <motion.section
              variants={fadeUp}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-brand/[0.04] p-6 shadow-sm lg:p-10"
            >
              {/* Background decorations */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand/8 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-10 left-1/4 h-56 w-56 rounded-full bg-indigo/6 blur-[60px]" />

              {/* Badges */}
              <div className="relative mb-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
                  <Sparkles className="size-3 text-brand" />
                  {formatDomain(paper.domain)}
                </span>
                <span className="rounded-full bg-brand/12 px-3 py-1.5 text-xs font-semibold text-brand">
                  {paper.apiSource || "Unknown source"}
                </span>
                {paper.doi && (
                  <DoiChip doi={paper.doi} />
                )}
              </div>

              {/* Title */}
              <h1 className="relative max-w-4xl text-balance font-serif text-4xl leading-[1.08] lg:text-5xl">
                {paper.title || "Untitled paper"}
              </h1>

              {/* Authors & journal row */}
              <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {paper.authors && paper.authors.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5 text-brand/60" />
                    {paper.authors.map((a) => a.fullName).filter(Boolean).join(", ")}
                  </span>
                )}
                {paper.journal?.title && (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-brand/60" />
                    {paper.journal.title}
                  </span>
                )}
                {paper.publicationYear && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-brand/60" />
                    {paper.publicationYear}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <Quote className="size-3.5 text-brand" />
                  {(paper.citationCount ?? 0).toLocaleString()} citations
                </span>
              </div>

              {/* Action buttons */}
              <div className="relative mt-8 flex flex-wrap gap-3">
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:bg-primary/90"
                  >
                    View source
                    <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    isSaved
                      ? "border-brand/30 bg-brand/10 text-brand hover:bg-brand/15"
                      : "border-border bg-surface/80 text-foreground hover:bg-secondary"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isSaved ? "saved" : "unsaved"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-2"
                    >
                      {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                      {bookmarkLoading ? "Saving..." : isSaved ? "Bookmarked" : "Bookmark"}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </motion.section>

            {/* ──── Content Grid ──── */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
              {/* Left: Abstract */}
              <motion.section
                variants={fadeUp}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-border bg-surface p-6 shadow-sm lg:p-8"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-brand/10">
                    <FileText className="size-3.5 text-brand" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Abstract</h2>
                </div>
                {paper.abstract ? (
                  <p className="text-[15px] leading-[1.85] text-foreground/88">{paper.abstract}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No abstract available for this paper.</p>
                )}

                {/* Topics if available */}
                {paper.topics && paper.topics.length > 0 && (
                  <div className="mt-8 border-t border-border pt-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Hash className="size-3.5 text-brand" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {paper.topics.map((topicName) => (
                        <Link
                          key={topicName}
                          to="/papers"
                          search={{ q: topicName }}
                          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                        >
                          {topicName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.section>

              {/* Right sidebar */}
              <aside className="space-y-5">
                {/* Keywords */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-indigo/10">
                      <Hash className="size-3.5 text-indigo" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Keywords</h3>
                  </div>
                  {(paper.keywords ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {paper.keywords!.map((keyword) => (
                        <Link
                          key={keyword}
                          to="/papers"
                          search={{ q: keyword }}
                          className="rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand"
                        >
                          {keyword}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No keywords indexed yet.</p>
                  )}
                </motion.div>

                {/* Metadata */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-emerald-500/10">
                      <FileText className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Paper metadata</h3>
                  </div>
                  <dl className="grid gap-2.5 text-sm">
                    <MetadataRow label="DOI" value={paper.doi || "—"} mono />
                    <MetadataRow label="Year" value={String(paper.publicationYear ?? "—")} />
                    <MetadataRow label="Citations" value={(paper.citationCount ?? 0).toLocaleString()} />
                    <MetadataRow label="Journal" value={paper.journal?.title || "—"} />
                    <MetadataRow label="Source" value={paper.apiSource || "—"} />
                    <MetadataRow label="Domain" value={formatDomain(paper.domain)} />
                  </dl>
                </motion.div>

                {/* Authors list */}
                {paper.authors && paper.authors.length > 0 && (
                  <motion.div
                    variants={fadeUp}
                    className="rounded-3xl border border-border bg-surface p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <div className="grid size-7 place-items-center rounded-lg bg-amber-500/10">
                        <Users className="size-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Authors ({paper.authors.length})
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {paper.authors.map((author) => (
                        <div
                          key={author.id || author.fullName}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                            {getInitials(author.fullName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{author.fullName}</div>
                            {author.orcid && (
                              <div className="truncate text-xs font-mono text-muted-foreground">
                                ORCID: {author.orcid}
                              </div>
                            )}
                          </div>
                          <Link
                            to="/papers"
                            search={{ q: author.fullName ?? "" }}
                            className="grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            title={`Search papers by ${author.fullName}`}
                          >
                            <ChevronRight className="size-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </aside>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}

/* ──── Sub-components ──── */

function DoiChip({ doi }: { doi: string }) {
  const [copied, setCopied] = useState(false);

  const copyDoi = async () => {
    try {
      await navigator.clipboard.writeText(doi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={copyDoi}
      className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-mono text-muted-foreground backdrop-blur-sm transition hover:border-brand/30 hover:text-foreground"
      title="Click to copy DOI"
    >
      <span className="truncate max-w-48">DOI: {doi}</span>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check className="size-3 text-trend-up" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy className="size-3 opacity-50 transition group-hover:opacity-100" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function MetadataRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/60 px-4 py-3">
      <dt className="shrink-0 pt-[3px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={`min-w-0 break-words text-right text-sm ${mono ? "font-mono break-all" : ""}`}>{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all text-right font-mono text-xs">{value}</dd>
    </div>
  );
}
function LoadingState() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-brand" />
      <span className="text-sm">Loading paper details...</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center">
      <p className="text-sm font-medium text-destructive">Failed to load paper</p>
      <p className="mt-1 text-xs text-destructive/70">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-16 flex flex-col items-center justify-center gap-3 text-center">
      <FileText className="size-8 text-muted-foreground/40" />
      <p className="text-sm font-medium text-muted-foreground">Paper not found</p>
      <p className="text-xs text-muted-foreground/70">This paper may have been removed or the link is invalid.</p>
      <Link
        to="/papers"
        search={{ q: "" }}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Browse library
        <ChevronRight className="size-3" />
      </Link>
    </div>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
}
