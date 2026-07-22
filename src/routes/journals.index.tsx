import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useJournals } from "@/features/research/api/research-api";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { DateDisplay } from "@/shared/ui/custom-date";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";
import { MotionItem } from "@/shared/ui/motion";
import type { ReactNode } from "react";

export const Route = createFileRoute("/journals/")({
  head: () => ({
    meta: [
      { title: "Journal Tracker - Scigraph" },
      { name: "description", content: "Follow scientific journals and monitor publication activity." },
    ],
  }),
  component: JournalsList,
});

const pageSizeOptions = [8, 12, 20];

function JournalsList() {
  const { data: journals = [], isLoading, isError, error } = useJournals();
  const [search, setSearch] = useState("");
  const [publisher, setPublisher] = useState("all");
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState("papers-desc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const publishers = useMemo(
    () => Array.from(new Set(journals.map((journal) => journal.publisher).filter(Boolean))).sort(),
    [journals],
  );
  const countries = useMemo(
    () => Array.from(new Set(journals.map((journal) => journal.country).filter(Boolean))).sort(),
    [journals],
  );

  const filteredJournals = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result = journals.filter((journal) => {
      const matchesSearch =
        !keyword ||
        [journal.title, journal.issn, journal.publisher, journal.country]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchesPublisher = publisher === "all" || journal.publisher === publisher;
      const matchesCountry = country === "all" || journal.country === country;
      return matchesSearch && matchesPublisher && matchesCountry;
    });

    return result.sort((a, b) => {
      if (sort === "title-asc") return String(a.title ?? "").localeCompare(String(b.title ?? ""));
      if (sort === "year-desc") return (b.establishedYear ?? 0) - (a.establishedYear ?? 0);
      if (sort === "papers-asc") return (a.papersCount ?? 0) - (b.papersCount ?? 0);
      return (b.papersCount ?? 0) - (a.papersCount ?? 0);
    });
  }, [country, journals, publisher, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredJournals.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedJournals = filteredJournals.slice(pageStart, pageStart + pageSize);
  const visibleStart = filteredJournals.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, filteredJournals.length);
  const resetPage = () => setPage(1);

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5 text-brand" />
            Live journals from backend
          </div>
          <h1 className="font-serif text-4xl mt-4 mb-1">Journal Tracker</h1>
          <p className="text-muted-foreground text-sm">
            {journals.length} indexed journals, {filteredJournals.length} matching current filters.
          </p>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 lg:grid-cols-[minmax(260px,1fr)_180px_180px_160px]">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              resetPage();
            }}
            placeholder="Search journal, ISSN, publisher..."
          />
          <FilterSelect
            label="Publisher"
            value={publisher}
            onChange={(value) => {
              setPublisher(value);
              resetPage();
            }}
            options={[
              { label: "All publishers", value: "all" },
              ...publishers.map((item) => ({ label: item ?? "", value: item ?? "" })),
            ]}
          />
          <FilterSelect
            label="Country"
            value={country}
            onChange={(value) => {
              setCountry(value);
              resetPage();
            }}
            options={[
              { label: "All countries", value: "all" },
              ...countries.map((item) => ({ label: item ?? "", value: item ?? "" })),
            ]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { label: "Most papers", value: "papers-desc" },
              { label: "Fewest papers", value: "papers-asc" },
              { label: "Title A-Z", value: "title-asc" },
              { label: "Newest established", value: "year-desc" },
            ]}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {isLoading ? (
            <LoadingState label="Loading journals..." />
          ) : isError ? (
            <ErrorState message={(error as Error).message} />
          ) : journals.length === 0 ? (
            <EmptyState title="No journals found" description="The backend did not return any indexed journals yet." />
          ) : filteredJournals.length === 0 ? (
            <EmptyState title="No matching journals" description="Try changing the search text or filters." />
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 p-5">
                {paginatedJournals.map((journal) => (
                  <MotionItem
                    key={journal.id}
                    hover
                    className="group relative flex flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:border-brand/40 hover:shadow-md hover:shadow-brand/[0.03]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <h2 className="font-serif text-xl font-semibold leading-tight transition-colors group-hover:text-brand">
                        <Link to="/journals/$id" params={{ id: journal.id ?? "" }} className="after:absolute after:inset-0 after:z-10">
                          {journal.title || "Untitled journal"}
                        </Link>
                      </h2>
                      {journal.website && (
                        <a
                          href={journal.website}
                          target="_blank"
                          rel="noreferrer"
                          className="relative z-20 shrink-0 inline-grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                          title="Visit journal website"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {journal.publisher && <Badge>Pub: {journal.publisher}</Badge>}
                      {journal.country && <Badge>{journal.country}</Badge>}
                      {journal.issn && <Badge>ISSN: {journal.issn}</Badge>}
                      {journal.establishedYear && <Badge>Est: {journal.establishedYear}</Badge>}
                      {!journal.publisher && !journal.country && !journal.issn && !journal.establishedYear && (
                        <span className="text-xs italic text-muted-foreground">No extra metadata available</span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
                      <div className="font-bold text-foreground">
                        {(journal.papersCount ?? 0).toLocaleString()}{" "}
                        <span className="font-normal text-muted-foreground">papers</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated <DateDisplay value={journal.updatedAt} />
                      </div>
                    </div>
                  </MotionItem>
                ))}
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                visibleStart={visibleStart}
                visibleEnd={visibleEnd}
                totalItems={filteredJournals.length}
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
                className="border-t border-border px-4 py-3"
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="p-10 text-sm text-destructive">Failed to load journals: {message}</div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
