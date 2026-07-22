import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { journalService, paperService } from "@/api/services";
import { FollowButton } from "@/components/follow-button";

export const Route = createFileRoute("/journals/$id")({ component: JournalDetail });

function JournalDetail() {
  const { id } = Route.useParams();
  const journal = useQuery({
    queryKey: ["journal", id],
    queryFn: async () =>
      (await journalService.list("", 1, 100)).items.find((item) => item.id === id),
  });
  const papers = useQuery({
    queryKey: ["journal", id, "papers", journal.data?.title],
    queryFn: () => paperService.list({ journalName: journal.data?.title, pageSize: 20 }),
    enabled: Boolean(journal.data?.title),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
        <Button asChild variant="ghost" className="w-fit">
          <Link to="/journals">
            <ArrowLeft data-icon="inline-start" /> All journals
          </Link>
        </Button>
        {journal.isLoading ? (
          <Skeleton className="h-36" />
        ) : journal.error ? (
          <Alert variant="destructive">
            <AlertTitle>Journal unavailable</AlertTitle>
            <AlertDescription>{journal.error.message}</AlertDescription>
          </Alert>
        ) : journal.data ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {journal.data.publisher || "Scientific journal"}
            </p>
            <h1 className="mt-2 font-serif text-4xl">{journal.data.title}</h1>
            <p className="mt-3 font-mono text-sm text-muted-foreground">
              ISSN {journal.data.issn || "—"} · {journal.data.totalPapersPublished.toLocaleString()}{" "}
              indexed papers
            </p>
            <div className="mt-5">
              <FollowButton targetType="Journal" targetId={journal.data.id} />
            </div>
          </div>
        ) : (
          <Alert>
            <AlertTitle>Journal not found</AlertTitle>
            <AlertDescription>The requested journal is no longer available.</AlertDescription>
          </Alert>
        )}
        <section>
          <h2 className="mb-4 font-serif text-2xl">Indexed publications</h2>
          <div className="flex flex-col gap-3">
            {papers.isLoading ? (
              Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28" />)
            ) : papers.data?.items.length ? (
              papers.data.items.map((paper) => (
                <Card key={paper.id}>
                  <CardHeader>
                    <CardTitle className="text-base leading-snug">
                      <Link to="/papers/$id" params={{ id: paper.id }} className="hover:text-brand">
                        {paper.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {paper.authors.map((author) => author.fullName).join(", ")} ·{" "}
                    {paper.publicationYear} · {paper.citationCount.toLocaleString()} citations
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No publications found for this journal.
              </p>
            )}
          </div>
        </section>
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { MainLayout } from "@/app/layouts/main-layout";
import { useJournal } from "@/features/research/api/research-api";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";
import { DateDisplay } from "@/shared/ui/custom-date";

export const Route = createFileRoute("/journals/$id")({
  head: () => ({ meta: [{ title: "Journal - Scigraph" }] }),
  component: JournalDetail,
});

function JournalDetail() {
  const { id } = Route.useParams();
  const { data: journal, isLoading, isError, error } = useJournal(id);

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
