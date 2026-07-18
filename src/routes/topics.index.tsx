import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Loader2, TrendingUp } from "lucide-react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useResearchTopics } from "@/features/research/api/research-api";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { formatDomain } from "@/shared/lib/format-domain";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "Trend Explorer - Scigraph" },
      { name: "description", content: "Explore trending research topics and their publication momentum." },
    ],
  }),
  component: TopicsList,
});

const pageSizeOptions = [6, 12, 24];

function TopicsList() {
  const { data, isLoading, isError, error } = useResearchTopics();
  const topics = Array.isArray(data) ? data : [];
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("all");
  const [sort, setSort] = useState("papers-desc");
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const domains = useMemo(
    () => Array.from(new Set(topics.map((topic) => topic.domain).filter(Boolean))).sort(),
    [topics],
  );

  const filteredTopics = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const result = topics.filter((topic) => {
      const matchesSearch =
        !keyword ||
        [topic.name, topic.description, topic.domain]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchesDomain = domain === "all" || String(topic.domain) === domain;
      return matchesSearch && matchesDomain;
    });

    return result.sort((a, b) => {
      if (sort === "name-asc") return String(a.name ?? "").localeCompare(String(b.name ?? ""));
      if (sort === "papers-asc") return (a.papersCount ?? 0) - (b.papersCount ?? 0);
      return (b.papersCount ?? 0) - (a.papersCount ?? 0);
    });
  }, [domain, search, sort, topics]);

  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedTopics = filteredTopics.slice(pageStart, pageStart + pageSize);
  const visibleStart = filteredTopics.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, filteredTopics.length);

  const resetPage = () => setPage(1);

  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <TrendingUp className="size-3.5 text-trend-up" />
            Live topics from backend
          </div>
          <h1 className="font-serif text-4xl mt-4 mb-1">Trend Explorer</h1>
          <p className="text-muted-foreground text-sm">
            {topics.length} indexed topics, {filteredTopics.length} visible with current filters.
          </p>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 lg:grid-cols-[minmax(260px,1fr)_180px_180px]">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              resetPage();
            }}
            placeholder="Search topics, domains..."
          />
          <FilterSelect
            label="Domain"
            value={domain}
            onChange={(value) => {
              setDomain(value);
              resetPage();
            }}
            options={[
              { label: "All domains", value: "all" },
              ...domains.map((item) => ({ label: formatDomain(item), value: String(item) })),
            ]}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { label: "Most papers", value: "papers-desc" },
              { label: "Fewest papers", value: "papers-asc" },
              { label: "Name A-Z", value: "name-asc" },
            ]}
          />
        </div>

        {isLoading ? (
          <LoadingState label="Loading topics..." />
        ) : isError ? (
          <ErrorState message={(error as Error).message} />
        ) : topics.length === 0 ? (
          <EmptyState title="No topics found" description="The backend did not return any research topics yet." />
        ) : filteredTopics.length === 0 ? (
          <EmptyState title="No matching topics" description="Try changing the search text or domain filter." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedTopics.map((topic, index) => (
                <Link
                  key={topic.id}
                  to="/topics/$id"
                  params={{ id: topic.id ?? "" }}
                  className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:border-brand/40 hover:-translate-y-0.5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-mono text-muted-foreground">
                      #{pageStart + index + 1}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-trend-up/10 px-2 py-1 text-xs font-bold text-trend-up">
                      <TrendingUp className="size-3.5" />
                      {(topic.papersCount ?? 0).toLocaleString()} papers
                    </span>
                  </div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {topic.domain !== null && topic.domain !== undefined ? formatDomain(topic.domain) : "Uncategorized"}
                  </p>
                  <h2 className="text-xl font-semibold leading-snug group-hover:text-brand">{topic.name}</h2>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{topic.description || "No description available."}</p>
                  <div className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-brand">
                    Explore trend
                    <ArrowUpRight className="size-3.5" />
                  </div>
                </Link>
              ))}
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              totalItems={filteredTopics.length}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setPage(1);
              }}
              className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3"
            />
          </>
        )}
      </div>
    </MainLayout>
  );
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
  return <div className="rounded-2xl border border-border bg-surface p-10 text-sm text-destructive">Failed to load topics: {message}</div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
