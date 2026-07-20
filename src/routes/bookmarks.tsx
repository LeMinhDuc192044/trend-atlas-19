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
        )}
      </div>
    </AppShell>
  );
}
