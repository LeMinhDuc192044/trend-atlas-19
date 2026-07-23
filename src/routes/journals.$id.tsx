import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { FollowButton } from "@/features/follow-subscriptions/ui/follow-button";
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
                <div className="flex flex-wrap items-center gap-2">
                  <FollowButton targetType="Journal" targetId={journal.id} label="journal" />
                  <a href={journal.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                    Website <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ) : (
                <FollowButton targetType="Journal" targetId={journal.id} label="journal" />
              )}
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
