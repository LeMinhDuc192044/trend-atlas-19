import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { BookmarkMinus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { ApiResponse, BookmarkListResponse } from "@/lib/types";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery<ApiResponse<BookmarkListResponse>>({
    queryKey: ["bookmarks"],
    queryFn: () => apiFetch("/api/bookmarks"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/bookmarks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark removed");
    },
    onError: (error) => {
      toast.error("Failed to remove bookmark");
      console.error(error);
    },
  });

  const bookmarks = response?.data?.items || [];

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Bookmarks</h1>
          <p className="text-muted-foreground text-sm">{response?.data?.totalCount || 0} items saved.</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-surface border border-border rounded-2xl">
            You haven't saved any bookmarks yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => {
              const p = b.researchPaper;
              if (!p) return null; // We are primarily rendering papers here
              
              return (
                <div key={b.id} className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <Link to="/papers/$id" params={{ id: p.id }} className="font-semibold hover:text-brand block mb-1">
                      {p.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {p.authors?.join(", ")} · {p.journalName} · {p.year}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteMutation.mutate(b.id)}
                    disabled={deleteMutation.isPending}
                    className="size-8 border border-border rounded-lg grid place-items-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors disabled:opacity-50" 
                    aria-label="Remove bookmark"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === b.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <BookmarkMinus className="size-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
