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
      </div>
    </AppShell>
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
