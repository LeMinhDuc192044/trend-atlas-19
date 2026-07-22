import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkMinus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bookmarkService } from "@/api/services";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/app/layouts/main-layout";
import { useBookmarks, useRemoveBookmark } from "@/lib/queries";
import { BookmarkMinus, Loader2 } from "lucide-react";
import { ALL_AUTHENTICATED_ROLES } from "@/shared/auth/roles";

export const Route = createFileRoute("/bookmarks")({ component: Bookmarks });

function Bookmarks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const bookmarks = useQuery({
    queryKey: ["bookmarks"],
    queryFn: bookmarkService.list,
    enabled: Boolean(user),
    retry: false,
  });
  const remove = useMutation({
    mutationFn: bookmarkService.remove,
    onSuccess: () => {
      toast.success("Bookmark removed");
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-5 md:p-8">
        <div>
          <h1 className="font-serif text-4xl">Bookmarks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Papers, journals, topics, and keywords saved for later.
          </p>
        </div>
        {!user ? (
          <Alert>
            <LogIn />
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              Bookmarks are linked to your account.{" "}
              <Link to="/auth" className="font-medium text-brand hover:underline">
                Sign in to continue.
              </Link>
            </AlertDescription>
          </Alert>
        ) : bookmarks.isLoading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : bookmarks.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load bookmarks</AlertTitle>
            <AlertDescription>{bookmarks.error.message}</AlertDescription>
          </Alert>
        ) : bookmarks.data?.items.length ? (
          <div className="flex flex-col gap-3">
            {bookmarks.data.items.map((item) => {
              const title =
                item.paperTitle ||
                item.journalTitle ||
                item.researchTopicName ||
                item.keywordName ||
                "Saved item";
              const to = item.researchPaperId
                ? "/papers/$id"
                : item.journalId
                  ? "/journals/$id"
                  : item.researchTopicId
                    ? "/topics/$id"
                    : null;
              const id = item.researchPaperId || item.journalId || item.researchTopicId;
              return (
                <Card key={item.id} className="flex items-start gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    {to && id ? (
                      <Link to={to} params={{ id }} className="font-semibold hover:text-brand">
                        {title}
                      </Link>
                    ) : (
                      <p className="font-semibold">{title}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Saved {new Date(item.createdAt).toLocaleDateString()}{" "}
                      {item.notes ? `· ${item.notes}` : ""}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Remove bookmark"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(item.id)}
                  >
                    <BookmarkMinus />
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            You have not saved anything yet.
          </div>
  const { data, isLoading } = useBookmarks();
  const removeBookmark = useRemoveBookmark();

  const saved = data?.items || [];
  return (
    <MainLayout roles={ALL_AUTHENTICATED_ROLES}>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-4xl mb-1">Bookmarks</h1>
          <p className="text-muted-foreground text-sm">{saved.length} papers saved.</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <div className="space-y-3">
          {saved.map((p) => (
            <div key={p.id} className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <Link to="/papers/$id" params={{ id: p.researchPaperId || "" }} className="font-semibold hover:text-brand block mb-1">
                  {p.paperTitle || "Untitled Document"}
                </Link>
                <div className="text-xs text-muted-foreground">Bookmarked on {new Date(p.createdAt ?? Date.now()).toLocaleDateString()}</div>
              </div>
              <button 
                onClick={() => removeBookmark.mutate({ paperId: p.researchPaperId ?? undefined, bookmarkId: p.id })}
                disabled={removeBookmark.isPending}
                className="size-8 border border-border rounded-lg grid place-items-center hover:bg-secondary disabled:opacity-50" 
                aria-label="Remove bookmark"
              >
                {removeBookmark.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <BookmarkMinus className="size-3.5" />}
              </button>
            </div>
          ))}
          {saved.length === 0 && (
            <div className="text-center py-10 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border">
              No bookmarks yet. Start saving interesting papers!
            </div>
          )}
        </div>
        )}
      </div>
    </MainLayout>
  );
}
