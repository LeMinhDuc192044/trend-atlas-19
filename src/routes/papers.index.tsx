import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bookmark,
  BookmarkCheck,
  FileText,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useJournals, useResearchPapers, type ResearchDomain } from "@/features/research/api/research-api";
import { useAddBookmark, useBookmarks, useRemoveBookmark } from "@/lib/queries";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { formatDomain } from "@/shared/lib/format-domain";
import { DatePicker } from "@/shared/ui/custom-date";
import { FilterSelect } from "@/shared/ui/filter-select";
import { MotionItem, MotionPage, MotionStack } from "@/shared/ui/motion";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";

export const Route = createFileRoute("/papers/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Research Library - Scigraph" },
      { name: "description", content: "Search and filter research papers by keyword, author, journal, year, and domain." },
    ],
  }),
  component: PapersList,
});

const pageSizeOptions = [5, 10, 20];
const domainOptions: Array<{ label: string; value: ResearchDomain }> = [
  { label: "Computer Science", value: "ComputerScience" },
  { label: "Artificial Intelligence", value: "ArtificialIntelligence" },
];

function PapersList() {
  const searchParams = Route.useSearch();
  const [query, setQuery] = useState(searchParams.q);
  const [author, setAuthor] = useState("");
  const [topic, setTopic] = useState("");
  const [journalName, setJournalName] = useState("all");
  const [domain, setDomain] = useState<"all" | ResearchDomain>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const papersQuery = useResearchPapers({
    query,
    authorName: author,
    topicName: topic,
    journalName: journalName === "all" ? "" : journalName,
    domain: domain === "all" ? undefined : domain,
    fromYear: getYear(fromDate),
    toYear: getYear(toDate),
    pageNumber: page,
    pageSize,
  });
  const { data: journals = [] } = useJournals();
  const { data: bookmarksData } = useBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const papers = papersQuery.data?.items ?? [];
  const totalItems = papersQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, papersQuery.data?.totalPages ?? Math.ceil(totalItems / pageSize));
  const visibleStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const visibleEnd = Math.min(page * pageSize, totalItems);
  const savedIds = useMemo(
    () => new Set(bookmarksData?.items?.map((bookmark) => bookmark.researchPaperId).filter(Boolean) ?? []),
    [bookmarksData?.items],
  );

  const resetPage = () => setPage(1);

  useEffect(() => {
    setQuery(searchParams.q);
    setPage(1);
  }, [searchParams.q]);

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <MotionPage className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="size-3.5 text-brand" />
            Live papers from backend
          </div>
          <h1 className="font-serif text-4xl mt-4 mb-1">Research Library</h1>
          <p className="text-muted-foreground text-sm">
            {totalItems.toLocaleString()} papers matching your current query.
          </p>
        </div>

        <MotionItem className="mb-5 rounded-2xl border border-border bg-surface p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.2fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)]">
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                resetPage();
              }}
              placeholder="Search title or abstract..."
            />
            <SearchInput
              value={author}
              onChange={(value) => {
                setAuthor(value);
                resetPage();
              }}
              placeholder="Author name..."
            />
            <SearchInput
              value={topic}
              onChange={(value) => {
                setTopic(value);
                resetPage();
              }}
              placeholder="Topic name..."
            />
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_190px_180px_180px]">
            <FilterSelect
              label="Journal"
              value={journalName}
              onChange={(value) => {
                setJournalName(value);
                resetPage();
              }}
              options={[
                { label: "All journals", value: "all" },
                ...journals
                  .filter((journal) => journal.title)
                  .map((journal) => ({ label: journal.title ?? "", value: journal.title ?? "" })),
              ]}
            />
            <FilterSelect
              label="Domain"
              value={String(domain)}
              onChange={(value) => {
                setDomain(value === "all" ? "all" : (value as ResearchDomain));
                resetPage();
              }}
              options={[
                { label: "All domains", value: "all" },
                ...domainOptions.map((item) => ({ label: item.label, value: String(item.value) })),
              ]}
            />
            <DatePicker
              value={fromDate}
              onChange={(value) => {
                setFromDate(value);
                resetPage();
              }}
              placeholder="From date"
            />
            <DatePicker
              value={toDate}
              onChange={(value) => {
                setToDate(value);
                resetPage();
              }}
              placeholder="To date"
            />
          </div>
        </MotionItem>

        {papersQuery.isLoading ? (
          <LoadingState label="Loading papers..." />
        ) : papersQuery.isError ? (
          <ErrorState message={(papersQuery.error as Error).message} />
        ) : papers.length === 0 ? (
          <EmptyState title="No papers found" description="Try changing the search text, year range, journal, or domain." />
        ) : (
          <>
            <MotionStack className="space-y-4">
              {papers.map((paper) => {
                const paperId = paper.id ?? "";
                const saved = savedIds.has(paperId);
                const bookmarkId = bookmarksData?.items?.find((bookmark) => bookmark.researchPaperId === paperId)?.id;

                return (
                  <MotionItem
                    key={paperId}
                    hover
                    className="group relative rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-brand/40"
                  >
                    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{formatDomain(paper.domain)}</Badge>
                        <Badge>{paper.apiSource || "Unknown source"}</Badge>
                        {paper.doi ? <Badge>DOI</Badge> : null}
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{paper.doi ? `DOI: ${paper.doi}` : "No DOI"}</span>
                    </div>

                    <h2 className="text-lg font-semibold leading-snug transition group-hover:text-brand">
                      <Link to="/papers/$id" params={{ id: paperId }} className="after:absolute after:inset-0 after:z-10">
                        {paper.title || "Untitled paper"}
                      </Link>
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm italic text-muted-foreground">
                      {paper.abstract || "No abstract available."}
                    </p>

                    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <span>{paper.authors?.map((item) => item.fullName).filter(Boolean).join(", ") || "Unknown authors"}</span>
                        <span>{paper.journal?.title || "Unassigned journal"}</span>
                        <span>{paper.publicationYear ?? "-"}</span>
                        <span>{(paper.citationCount ?? 0).toLocaleString()} citations</span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => {
                            if (saved) {
                              removeBookmark.mutate({ paperId, bookmarkId });
                            } else {
                              addBookmark.mutate({ paperId, title: paper.title ?? undefined });
                            }
                          }}
                          disabled={!paperId || addBookmark.isPending || removeBookmark.isPending}
                          className={`relative z-20 size-9 border border-border rounded-lg grid place-items-center transition-colors disabled:opacity-50 ${saved ? "bg-secondary text-brand" : "hover:bg-secondary"}`}
                        >
                          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                        </button>
                        <Link to="/papers/$id" params={{ id: paperId }} className="relative z-20 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90">
                          View
                        </Link>
                      </div>
                    </div>
                  </MotionItem>
                );
              })}
            </MotionStack>
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3"
            />
          </>
        )}
      </MotionPage>
    </MainLayout>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{children}</span>;
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-destructive">Failed to load papers: {message}</div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function getYear(value: string) {
  if (!value) return undefined;
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? year : undefined;
}
