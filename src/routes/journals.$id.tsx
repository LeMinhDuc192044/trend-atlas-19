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
      </div>
    </AppShell>
  );
}
