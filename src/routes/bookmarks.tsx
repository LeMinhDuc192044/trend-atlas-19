import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { papers, bookmarks } from "@/lib/mock-data";
import { BookmarkMinus } from "lucide-react";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — Scigraph" },
      { name: "description", content: "Papers and keywords you've saved for later." },
    ],
  }),
  component: Bookmarks,
});

function Bookmarks() {
  const saved = papers.filter((p) => bookmarks.includes(p.id));
  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Bookmarks</h1>
          <p className="text-muted-foreground text-sm">{saved.length} papers saved.</p>
        </div>
        <div className="space-y-3">
          {saved.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <Link to="/papers/$id" params={{ id: p.id }} className="font-semibold hover:text-brand block mb-1">
                  {p.title}
                </Link>
                <div className="text-xs text-muted-foreground">{p.authors.join(", ")} · {p.journalName} · {p.year}</div>
              </div>
              <button className="size-8 border border-border rounded-lg grid place-items-center hover:bg-secondary" aria-label="Remove bookmark">
                <BookmarkMinus className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
