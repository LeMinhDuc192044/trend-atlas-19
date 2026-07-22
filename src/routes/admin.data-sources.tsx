import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { MainLayout } from "@/app/layouts/main-layout";
import { ADMIN_ONLY } from "@/shared/auth/roles";
import { useAdminDataSources } from "@/features/admin/api/admin-api";
import {
  Database,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react";
import { DateDisplay } from "@/shared/ui/custom-date";
import { FilterSelect } from "@/shared/ui/filter-select";
import { Pagination } from "@/shared/ui/pagination";
import { SearchInput } from "@/shared/ui/search-input";

export const Route = createFileRoute("/admin/data-sources")({
  head: () => ({
    meta: [
      { title: "Admin - Data Sources - Scigraph" },
      { name: "description", content: "Configure and monitor external academic API data sources." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DataSources,
});

const pageSizeOptions = [4, 8, 12];

function DataSources() {
  const { data: sources = [], isLoading, isError, error } = useAdminDataSources();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(4);
  const [page, setPage] = useState(1);

  const sourceTypes = useMemo(
    () => Array.from(new Set(sources.map((source) => source.sourceType).filter(Boolean))).sort(),
    [sources],
  );
  const activeCount = sources.filter((source) => source.status === "Active").length;

  const filteredSources = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sources.filter((source) => {
      const matchesSearch =
        !keyword ||
        [source.name, source.baseUrl, source.sourceType, source.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchesType = typeFilter === "all" || source.sourceType === typeFilter;
      const matchesStatus = statusFilter === "all" || source.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter, sources]);

  const totalPages = Math.max(1, Math.ceil(filteredSources.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedSources = filteredSources.slice(pageStart, pageStart + pageSize);
  const visibleStart = filteredSources.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + pageSize, filteredSources.length);

  const resetPage = () => setPage(1);

  return (
    <MainLayout roles={ADMIN_ONLY}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-2">Administration</div>
            <h1 className="font-serif text-4xl">API Data Sources</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {sources.length} sources, {activeCount} active, {filteredSources.length} matching current filters.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
            <Plus className="size-4" />
            Add source
          </button>
        </div>

        <div className="mb-4 grid gap-3 border border-border bg-surface rounded-2xl p-4 lg:grid-cols-[minmax(260px,1fr)_180px_160px]">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              resetPage();
            }}
            placeholder="Search source, URL, type..."
          />
          <FilterSelect
            label="Source type"
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              resetPage();
            }}
            options={[
              { label: "All source types", value: "all" },
              ...sourceTypes.map((type) => ({ label: type ?? "", value: type ?? "" })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              resetPage();
            }}
            options={[
              { label: "All status", value: "all" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
          />
        </div>

        {isLoading ? (
          <div className="bg-surface border border-border rounded-2xl p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading data sources...
          </div>
        ) : isError ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-sm text-destructive">
            Failed to load data sources: {(error as Error).message}
          </div>
        ) : sources.length === 0 ? (
          <EmptyState title="No API data sources" description="The API did not return any configured sources yet." />
        ) : filteredSources.length === 0 ? (
          <EmptyState title="No matching sources" description="Try changing the search text or filters." />
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {paginatedSources.map((source) => (
                <div key={source.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition hover:border-brand/40">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-11 shrink-0 rounded-xl bg-secondary grid place-items-center text-brand">
                        <Database className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-semibold truncate">{source.name}</h2>
                        <p className="text-xs font-mono text-muted-foreground truncate">{source.baseUrl}</p>
                      </div>
                    </div>
                    <StatusBadge status={source.status} />
                  </div>

                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <Metric label="Type" value={source.sourceType ?? "-"} />
                    <Metric label="Requests/min" value={String(source.requestsPerMinute ?? "-")} />
                    <Metric label="Last sync" value={<DateDisplay value={source.lastSyncTime} withTime />} />
                    <Metric label="Updated" value={<DateDisplay value={source.updatedAt} withTime />} />
                  </dl>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-secondary">
                      <RefreshCw className="size-3.5" />
                      Sync now
                    </button>
                    <button className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-secondary">
                      <Settings className="size-3.5" />
                      Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              visibleStart={visibleStart}
              visibleEnd={visibleEnd}
              totalItems={filteredSources.length}
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

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</dt>
      <dd className="mt-1 truncate font-mono text-xs">{value}</dd>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-12 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const active = status === "Active";

  return (
    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${active ? "bg-trend-up/10 text-trend-up" : "bg-destructive/10 text-destructive"}`}>
      {status ?? "-"}
    </span>
  );
}
