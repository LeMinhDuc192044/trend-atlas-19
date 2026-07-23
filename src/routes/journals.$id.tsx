import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useJournal, useResearchPapers } from "@/features/research/api/research-api";
import { useAddBookmark, useBookmarks, useRemoveBookmark } from "@/lib/queries";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { DateDisplay } from "@/shared/ui/custom-date";
import { MotionItem, MotionStack } from "@/shared/ui/motion";

export const Route = createFileRoute("/journals/$id")({
  head: () => ({ meta: [{ title: "Journal - Scigraph" }] }),
  component: JournalDetail,
});

function JournalDetail() {
  const { id } = Route.useParams();
  const { data: journal, isLoading, isError, error } = useJournal(id);
  const { data: papersPage, isLoading: isPapersLoading } = useResearchPapers({
    journalName: journal?.title ?? undefined,
    pageSize: 5,
    enabled: !!journal?.title,
  });

  const papers = papersPage?.items ?? [];

  const { data: bookmarksData } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const savedIds = useMemo(
    () =>
      new Set(
        bookmarksData?.items?.map((b) => b.researchPaperId).filter(Boolean) ?? []
      ),
    [bookmarksData?.items]
  );

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <Link to="/journals" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-3.5" /> All journals
        </Link>

        {isLoading ? (
          <State label="Loading journal..." />
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-destructive">Failed to load journal: {(error as Error).message}</div>
        ) : !journal ? (
          <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-muted-foreground">Journal not found.</div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">{journal.publisher || "Unknown publisher"}</div>
                <h1 className="font-serif text-4xl mb-2">{journal.title || "Untitled journal"}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono">
                  <span>ISSN: {journal.issn || "-"}</span>
                  <span>Country: {journal.country || "-"}</span>
                  <span>Papers: {(journal.papersCount ?? 0).toLocaleString()}</span>
                </div>
              </div>
              {journal.website ? (
                <a href={journal.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Website <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>

            <section className="bg-surface border border-border rounded-2xl p-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Journal Metadata</h2>
              <dl className="grid gap-4 text-sm md:grid-cols-2">
                <Metric label="Established" value={journal.establishedYear ? String(journal.establishedYear) : "-"} />
                <Metric label="Indexed papers" value={(journal.papersCount ?? 0).toLocaleString()} />
                <Metric label="Created" value={<DateDisplay value={journal.createdAt} />} />
                <Metric label="Updated" value={<DateDisplay value={journal.updatedAt} />} />
              </dl>
            </section>

            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    <FileText className="size-3.5 text-brand" />
                    Recent Papers
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recently indexed papers from this journal.
                  </p>
                </div>
                
              </div>

              {isPapersLoading ? (
                <State label="Loading papers..." />
              ) : papers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
                  No papers found for this journal yet.
                </div>
              ) : (
                <MotionStack className="space-y-4">
                  {papers.map((paper) => {
                    const paperId = paper.id ?? "";
                    const saved = savedIds.has(paperId);
                    const bookmarkId = bookmarksData?.items?.find(
                      (b) => b.researchPaperId === paperId
                    )?.id;

                    return (
                      <MotionItem
                        key={paperId}
                        hover
                        className="group relative rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-brand/40"
                      >
                        <h2 className="pr-10 text-lg font-semibold leading-snug">
                          {paper.title || "Untitled paper"}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm italic text-muted-foreground">
                          {paper.abstract || "No abstract available."}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>{paper.authors?.map((a) => a.fullName).join(", ")}</span>
                          <span>{paper.publicationYear}</span>
                          <span>{paper.citationCount?.toLocaleString()} citations</span>
                        </div>
                        <div className="absolute right-4 top-4 z-20">
                          <button
                            onClick={() => {
                              if (saved) removeBookmark.mutate({ paperId, bookmarkId });
                              else addBookmark.mutate({ paperId, title: paper.title ?? undefined });
                            }}
                            disabled={!paperId || addBookmark.isPending || removeBookmark.isPending}
                            className={`size-9 border border-border rounded-lg grid place-items-center transition-colors disabled:opacity-50 ${saved ? "bg-secondary text-brand" : "bg-surface hover:bg-secondary"}`}
                          >
                            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                          </button>
                        </div>
                      </MotionItem>
                    );
                  })}
                </MotionStack>
              )}
            </section>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function State({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</dt>
      <dd className="mt-1 font-mono">{value}</dd>
    </div>
  );
}
