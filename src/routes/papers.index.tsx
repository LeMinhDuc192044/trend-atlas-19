import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { bookmarkService, journalService, paperService } from "@/api/services";
import { domainLabel } from "@/api/types";
import { useAuth } from "@/lib/auth";
import { z } from "zod";

export const Route = createFileRoute("/papers/")({
  validateSearch: z.object({ query: z.string().optional().catch(undefined) }),
  head: () => ({ meta: [{ title: "Research Library — Scigraph" }] }),
  component: PapersList,
});

function PapersList() {
  const routeSearch = Route.useSearch();
  const [query, setQuery] = useState(routeSearch.query ?? "");
  const [domain, setDomain] = useState("");
  const [journalName, setJournalName] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const papers = useQuery({
    queryKey: ["papers", deferredQuery, domain, journalName, year, page],
    queryFn: () =>
      paperService.list({
        query: deferredQuery || undefined,
        domain: domain ? Number(domain) : undefined,
        journalName: journalName || undefined,
        fromYear: year ? Number(year) : undefined,
        toYear: year ? Number(year) : undefined,
        pageNumber: page,
        pageSize: 10,
      }),
  });
  const journals = useQuery({
    queryKey: ["journals", "filters"],
    queryFn: () => journalService.list("", 1, 100),
  });
  const bookmark = useMutation({
    mutationFn: bookmarkService.createPaper,
    onSuccess: () => {
      toast.success("Paper saved to bookmarks");
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 md:p-8">
        <div>
          <h1 className="font-serif text-4xl">Research Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search indexed papers by title, author, journal, year, and domain.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 pt-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Filter /> Filters
            </div>
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => updateFilter(setQuery)(e.target.value)}
                placeholder="Title, keyword, or author…"
                className="pl-9"
              />
            </div>
            <select
              value={domain}
              onChange={(e) => updateFilter(setDomain)(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All domains</option>
              <option value="0">Computer Science</option>
              <option value="1">Artificial Intelligence</option>
            </select>
            <select
              value={journalName}
              onChange={(e) => updateFilter(setJournalName)(e.target.value)}
              className="h-9 max-w-56 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All journals</option>
              {journals.data?.items.map((journal) => (
                <option key={journal.id} value={journal.title}>
                  {journal.title}
                </option>
              ))}
            </select>
            <Input
              value={year}
              onChange={(e) => updateFilter(setYear)(e.target.value)}
              type="number"
              min="1900"
              max="2100"
              placeholder="Year"
              className="w-28"
            />
          </CardContent>
        </Card>

        {papers.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load papers</AlertTitle>
            <AlertDescription>{papers.error.message}</AlertDescription>
          </Alert>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {papers.data
            ? `${papers.data.totalCount.toLocaleString()} results`
            : "Loading research index…"}
        </p>

        <div className="flex flex-col gap-4">
          {papers.isLoading ? (
            Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          ) : papers.data?.items.length ? (
            papers.data.items.map((paper) => (
              <Card key={paper.id} className="shadow-sm transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-indigo">{domainLabel(paper.domain)}</span>
                    <span className="font-mono">
                      {paper.doi ? `DOI: ${paper.doi}` : paper.apiSource}
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
                <CardFooter className="flex-wrap justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    {paper.authors.map((author) => author.fullName).join(", ") || "Unknown authors"}{" "}
                    · {paper.journal?.title || "Unlisted journal"} · {paper.publicationYear} ·{" "}
                    {paper.citationCount.toLocaleString()} citations
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Bookmark paper"
                      disabled={bookmark.isPending}
                      onClick={() =>
                        user ? bookmark.mutate(paper.id) : toast.error("Sign in to save bookmarks")
                      }
                    >
                      <Bookmark />
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/papers/$id" params={{ id: paper.id }}>
                        View paper
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No papers match these filters.
            </div>
          )}
        </div>

        {papers.data && papers.data.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <ChevronLeft data-icon="inline-start" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {papers.data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!papers.data.hasNextPage}
              onClick={() => setPage((value) => value + 1)}
            >
              Next <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
