import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Bell, Check, LogIn } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { notificationService } from "@/api/services";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const { user, authLoading } = useAuth();
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
    enabled: Boolean(user),
    retry: false,
  });
  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-5 md:p-8">
        <div>
          <h1 className="font-serif text-4xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Updates from followed journals and research topics.
          </p>
        </div>
        {authLoading ? (
          <Skeleton className="h-28 rounded-xl" />
        ) : !user ? (
          <Alert>
            <LogIn />
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              <Link to="/auth" className="font-medium text-brand hover:underline">
                Sign in
              </Link>{" "}
              to view your personalized updates.
            </AlertDescription>
          </Alert>
        ) : notifications.isLoading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : notifications.error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load notifications</AlertTitle>
            <AlertDescription>{notifications.error.message}</AlertDescription>
          </Alert>
        ) : notifications.data?.items.length ? (
          <div className="flex flex-col gap-3">
            {notifications.data.items.map((item) => (
              <Card
                key={item.id}
                className={`flex gap-4 p-5 ${item.isRead ? "opacity-70" : "border-brand/40"}`}
              >
                <div
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${item.isRead ? "bg-secondary text-muted-foreground" : "bg-brand text-brand-foreground"}`}
                >
                  <Bell />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold">{item.title}</h2>
                    <time className="font-mono text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!item.isRead ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(item.id)}
                      >
                        <Check data-icon="inline-start" /> Mark as read
                      </Button>
                    ) : null}
                    {notificationLink(item) ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link {...notificationLink(item)!}>
                          <ArrowUpRight data-icon="inline-end" /> Open related item
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            You are all caught up.
          </div>
        )}
      </div>
    </AppShell>
  );
}

function notificationLink(item: {
  relatedPaperId?: string;
  relatedJournalId?: string;
  relatedResearchTopicId?: string;
}) {
  if (item.relatedPaperId)
    return { to: "/papers/$id" as const, params: { id: item.relatedPaperId } };
  if (item.relatedJournalId)
    return { to: "/journals/$id" as const, params: { id: item.relatedJournalId } };
  if (item.relatedResearchTopicId)
    return { to: "/topics/$id" as const, params: { id: item.relatedResearchTopicId } };
  return null;
}
