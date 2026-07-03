import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { papers } from "@/lib/mock-data";
import { Bookmark, ExternalLink, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/papers/$id")({
  loader: ({ params }) => {
    const paper = papers.find((p) => p.id === params.id);
    if (!paper) throw notFound();
    return { paper };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.paper.title} — Scigraph` },
          { name: "description", content: loaderData.paper.abstract.slice(0, 155) },
        ]
      : [{ title: "Paper — Scigraph" }],
  }),
  component: PaperDetail,
  notFoundComponent: () => (
    <AppShell>
      <div className="p-12 text-center text-muted-foreground">Paper not found.</div>
    </AppShell>
  ),
  errorComponent: () => (
    <AppShell>
      <div className="p-12 text-center text-muted-foreground">Failed to load paper.</div>
    </AppShell>
  ),
});

function PaperDetail() {
  const { paper } = Route.useLoaderData();
  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <Link to="/papers" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-3.5" /> Back to library
        </Link>

        <div className="flex gap-2 mb-4">
          <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">{paper.domain}</span>
          {paper.fullText && <span className="px-2 py-0.5 bg-trend-up/10 text-trend-up text-[10px] font-bold uppercase tracking-wider rounded">Full text</span>}
        </div>

        <h1 className="font-serif text-4xl leading-tight mb-4 text-balance">{paper.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
          <span>{paper.authors.join(", ")}</span>
          <span>·</span>
          <Link to="/journals/$id" params={{ id: paper.journalId }} className="hover:text-brand">
            {paper.journalName}
          </Link>
          <span>·</span>
          <span>{paper.year}</span>
          <span>·</span>
          <span>{paper.citations.toLocaleString()} citations</span>
        </div>

        <div className="flex gap-2 mb-8">
          <a href={paper.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90">
            View source <ExternalLink className="size-3.5" />
          </a>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium rounded-lg hover:bg-secondary">
            <Bookmark className="size-3.5" /> Bookmark
          </button>
        </div>

        <section className="bg-surface border border-border rounded-2xl p-8 mb-6">
          <h2 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">Abstract</h2>
          <p className="text-base leading-relaxed text-foreground/90">{paper.abstract}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.map((k: string) => (
                <span key={k} className="px-2 py-1 bg-secondary rounded text-xs">{k}</span>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">Metadata</h3>
            <dl className="text-sm space-y-1 font-mono">
              <div className="flex justify-between"><dt className="text-muted-foreground">DOI</dt><dd>{paper.doi}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Year</dt><dd>{paper.year}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Citations</dt><dd>{paper.citations.toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Full text</dt><dd>{paper.fullText ? "Yes" : "No"}</dd></div>
            </dl>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
