import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Filter, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { papers, journals } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/papers/")({
  head: () => ({
    meta: [
      { title: "Research Library — Scigraph" },
      { name: "description", content: "Search and filter research papers by keyword, author, journal, year, and domain." },
    ],
  }),
  component: PapersList,
});

function PapersList() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("all");
  const [journal, setJournal] = useState("all");
  const [year, setYear] = useState("all");
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: (paperId: string) => 
      apiFetch("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify({
          type: 0, // Paper
          researchPaperId: paperId,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Paper bookmarked successfully!");
    },
    onError: (error) => {
      toast.error("Failed to bookmark paper");
      console.error(error);
    },
  });

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      if (q && !(p.title.toLowerCase().includes(q.toLowerCase()) ||
                 p.authors.some(a => a.toLowerCase().includes(q.toLowerCase())) ||
                 p.keywords.some(k => k.toLowerCase().includes(q.toLowerCase())))) return false;
      if (domain !== "all" && p.domain !== domain) return false;
      if (journal !== "all" && p.journalId !== journal) return false;
      if (year !== "all" && String(p.year) !== year) return false;
      return true;
    });
  }, [q, domain, journal, year]);

  const domains = Array.from(new Set(papers.map(p => p.domain)));
  const years = Array.from(new Set(papers.map(p => p.year))).sort((a, b) => b - a);

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl mb-1">Research Library</h1>
            <p className="text-muted-foreground text-sm">{filtered.length} papers · filter by keyword, author, journal, year or domain.</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider mr-2">
            <Filter className="size-3.5" /> Filters
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keyword, author or title..."
            className="flex-1 min-w-48 px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="px-3 py-2 bg-secondary rounded-lg text-sm outline-none">
            <option value="all">All domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={journal} onChange={(e) => setJournal(e.target.value)} className="px-3 py-2 bg-secondary rounded-lg text-sm outline-none">
            <option value="all">All journals</option>
            {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-2 bg-secondary rounded-lg text-sm outline-none">
            <option value="all">All years</option>
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((p) => (
            <article key={p.id} className="bg-surface border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-accent text-indigo text-[10px] font-bold uppercase tracking-wider rounded">{p.domain}</span>
                  {p.fullText && <span className="px-2 py-0.5 bg-trend-up/10 text-trend-up text-[10px] font-bold uppercase tracking-wider rounded">Full text</span>}
                </div>
                <span className="text-xs font-mono text-muted-foreground">DOI: {p.doi}</span>
              </div>
              <Link to="/papers/$id" params={{ id: p.id }}>
                <h3 className="text-lg font-semibold leading-snug mb-2 hover:text-brand transition-colors">{p.title}</h3>
              </Link>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 italic">{p.abstract}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{p.authors.join(", ")}</span>
                  <span>{p.journalName}</span>
                  <span>{p.year}</span>
                  <span>{p.citations.toLocaleString()} citations</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => bookmarkMutation.mutate(p.id)}
                    disabled={bookmarkMutation.isPending && bookmarkMutation.variables === p.id}
                    className="size-8 border border-border rounded-lg grid place-items-center hover:bg-secondary disabled:opacity-50"
                    title="Save bookmark"
                  >
                    {bookmarkMutation.isPending && bookmarkMutation.variables === p.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Bookmark className="size-3.5" />
                    )}
                  </button>
                  <Link to="/papers/$id" params={{ id: p.id }} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">No papers match your filters.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
